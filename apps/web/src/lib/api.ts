// apps/web/src/lib/api.ts

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// ─── Token helpers (browser only) ────────────────────────────────────────────

function getAccess(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ss_access");
}

function getRefresh(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ss_refresh");
}

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem("ss_access", access);
  localStorage.setItem("ss_refresh", refresh);
}

export function clearTokens() {
  localStorage.removeItem("ss_access");
  localStorage.removeItem("ss_refresh");
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

let refreshing: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  const rt = getRefresh();
  if (!rt) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  });

  if (!res.ok) {
    clearTokens();
    window.location.href = "/auth/login";
    throw new Error("Session expired");
  }

  const data = await res.json();
  saveTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function getValidAccess(): Promise<string | null> {
  const access = getAccess();
  if (!access) return null;

  // Decode exp without a library
  try {
    const payload = JSON.parse(atob(access.split(".")[1]));
    const expiresIn = payload.exp * 1000 - Date.now();
    if (expiresIn > 60_000) return access; // more than 1 min left
  } catch {
    // malformed — try refresh
  }

  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean; // default true
  signal?: AbortSignal;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, signal } = opts;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = await getValidAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const err = await res.json();
      message = err.message ?? err.error ?? message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ accessToken: string; refreshToken: string; user: import("./types").UserResponse }>(
      "/auth/login",
      { method: "POST", body: { email, password }, auth: false },
    ),

  register: (name: string, email: string, password: string) =>
    apiFetch<import("./types").UserResponse>("/auth/register", {
      method: "POST",
      body: { name, email, password },
      auth: false,
    }),

  logout: (refreshToken: string) =>
    apiFetch<void>("/auth/logout", {
      method: "POST",
      body: { refreshToken },
    }),

  me: () => apiFetch<import("./types").UserResponse>("/auth/me"),
};

// ─── Product endpoints ────────────────────────────────────────────────────────

export const productApi = {
  list: (params?: {
    page?: number;
    size?: number;
    category?: string;
    q?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.size !== undefined) qs.set("size", String(params.size));
    if (params?.category) qs.set("category", params.category);
    if (params?.q) qs.set("q", params.q);
    if (params?.minPrice !== undefined)
      qs.set("minPrice", String(params.minPrice));
    if (params?.maxPrice !== undefined)
      qs.set("maxPrice", String(params.maxPrice));
    const query = qs.toString();
    return apiFetch<import("./types").Page<import("./types").PublicProductResponse>>(
      `/products${query ? "?" + query : ""}`,
      { auth: false },
    );
  },

  get: (slug: string) =>
    apiFetch<import("./types").PublicProductResponse>(`/products/${slug}`, {
      auth: false,
    }),

  flashSales: () =>
    apiFetch<import("./types").PublicProductResponse[]>("/products/flash-sales", {
      auth: false,
    }),
};

// ─── Category endpoints ───────────────────────────────────────────────────────

export const categoryApi = {
  list: () =>
    apiFetch<import("./types").CategoryResponse[]>("/categories", {
      auth: false,
    }),
};

// ─── Store endpoints ──────────────────────────────────────────────────────────

export const storeApi = {
  get: (slug: string) =>
    apiFetch<import("./types").StoreResponse>(`/stores/${slug}`, {
      auth: false,
    }),

  products: (slug: string) =>
    apiFetch<import("./types").Page<import("./types").PublicProductResponse>>(
      `/stores/${slug}/products`,
      { auth: false },
    ),
};

// ─── Order endpoints ──────────────────────────────────────────────────────────

export const orderApi = {
  create: (items: { productId: number; quantity: number }[]) =>
    apiFetch<import("./types").OrderResponse>("/orders", {
      method: "POST",
      body: { items },
    }),

  list: () =>
    apiFetch<import("./types").Page<import("./types").OrderResponse>>("/orders"),

  get: (id: number) =>
    apiFetch<import("./types").OrderResponse>(`/orders/${id}`),

  cancel: (id: number) =>
    apiFetch<import("./types").OrderResponse>(`/orders/${id}/cancel`, {
      method: "POST",
    }),

  pay: (orderId: number, provider: string) =>
    apiFetch<{ providerReference: string; redirectUrl?: string }>(
      `/orders/${orderId}/pay`,
      { method: "POST", body: { provider } },
    ),
};

// ─── Vendor endpoints ─────────────────────────────────────────────────────────

export const vendorApi = {
  dashboard: (period: "7d" | "30d" | "all" = "30d") =>
    apiFetch<import("./types").VendorDashboardResponse>(
      `/vendor/dashboard?period=${period}`,
    ),

  products: (page = 0) =>
    apiFetch<import("./types").Page<import("./types").PublicProductResponse>>(
      `/vendor/products?page=${page}`,
    ),

  createProduct: (data: {
    name: string;
    description?: string;
    priceCents: number;
    currency: string;
    stockQuantity: number;
    categoryId: number;
    status: string;
    imageUrls?: string[];
  }) =>
    apiFetch<import("./types").PublicProductResponse>("/vendor/products", {
      method: "POST",
      body: data,
    }),

  updateProduct: (id: number, data: Partial<{
    name: string;
    description: string;
    priceCents: number;
    stockQuantity: number;
    status: string;
  }>) =>
    apiFetch<import("./types").PublicProductResponse>(`/vendor/products/${id}`, {
      method: "PUT",
      body: data,
    }),

  orders: (page = 0) =>
    apiFetch<import("./types").Page<{ id: number; orderId: number; status: string; productName: string; quantity: number; unitPriceCents: number }>>(
      `/vendor/orders/items?page=${page}`,
    ),

  store: () =>
    apiFetch<import("./types").StoreResponse>("/vendor/store"),
};

// ─── Admin endpoints ──────────────────────────────────────────────────────────

export const adminApi = {
  stats: () =>
    apiFetch<import("./types").PlatformStatsResponse>("/admin/stats"),

  vendors: (page = 0) =>
    apiFetch<import("./types").Page<import("./types").StoreResponse>>(
      `/admin/vendors?page=${page}`,
    ),

  updateVendorStatus: (id: number, status: string) =>
    apiFetch<import("./types").StoreResponse>(
      `/admin/vendors/${id}/status`,
      { method: "PATCH", body: { status } },
    ),

  products: (page = 0) =>
    apiFetch<import("./types").Page<import("./types").AdminProductResponse>>(
      `/admin/products?page=${page}`,
    ),

  blockProduct: (id: number) =>
    apiFetch<void>(`/admin/products/${id}/block`, { method: "PATCH" }),

  unblockProduct: (id: number) =>
    apiFetch<void>(`/admin/products/${id}/unblock`, { method: "PATCH" }),

  users: (page = 0) =>
    apiFetch<import("./types").Page<import("./types").AdminUserResponse>>(
      `/admin/users?page=${page}`,
    ),

  updateUserStatus: (id: number, status: string) =>
    apiFetch<void>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),

  categories: () =>
    apiFetch<import("./types").CategoryResponse[]>("/admin/categories"),

  createCategory: (name: string) =>
    apiFetch<import("./types").CategoryResponse>("/admin/categories", {
      method: "POST",
      body: { name },
    }),

  updateCategory: (id: number, name: string) =>
    apiFetch<import("./types").CategoryResponse>(`/admin/categories/${id}`, {
      method: "PUT",
      body: { name },
    }),

  deleteCategory: (id: number) =>
    apiFetch<void>(`/admin/categories/${id}`, { method: "DELETE" }),

  payments: (page = 0) =>
    apiFetch<import("./types").Page<import("./types").PaymentReviewResponse>>(
      `/admin/payments/review?page=${page}`,
    ),

  refund: (paymentId: number) =>
    apiFetch<void>(`/admin/payments/${paymentId}/refund`, { method: "POST" }),

  orders: (page = 0) =>
    apiFetch<import("./types").Page<import("./types").OrderResponse>>(
      `/admin/orders?page=${page}`,
    ),
};