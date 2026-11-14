// apps/web/src/lib/api.ts
import type {
  AdminOrderRow,
  AdminPaymentReviewResponse,
  AdminProductResponse,
  AdminUserResponse,
  AuthResponse,
  CategoryResponse,
  FulfillmentStatus,
  OrderResponse,
  Page,
  PaymentProvider,
  PaymentSession,
  PlatformStatsResponse,
  ProductResponse,
  ProductStatus,
  PublicProductResponse,
  PublicStoreResponse,
  ShippingAddress,
  UserResponse,
  UserStatus,
  VendorDashboardResponse,
  VendorOrderItemResponse,
  VendorResponse,
  VendorStatus,
} from "./types";
import {
  DEMO_MODE,
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  DEMO_STORES,
  listDemoProducts,
} from "./demo";

// Browser calls /api/v1 on the same origin. next.config.ts rewrites it to Spring Boot.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

// ─── Token storage (browser only) ────────────────────────────────────────────

const ACCESS_KEY = "ss_access";
const REFRESH_KEY = "ss_refresh";

function getAccess(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

function getRefresh(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ─── Refresh ─────────────────────────────────────────────────────────────────

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
    if (typeof window !== "undefined") {
      const login = new URL("/auth/login", window.location.origin);
      login.searchParams.set(
        "next",
        window.location.pathname + window.location.search,
      );
      window.location.assign(login.href);
    }
    throw new Error("Session expired");
  }

  const data = (await res.json()) as AuthResponse;
  saveTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function getValidAccess(): Promise<string | null> {
  const access = getAccess();
  if (!access) return null;

  try {
    const payload = JSON.parse(atob(access.split(".")[1]));
    if (payload.exp * 1000 - Date.now() > 60_000) return access;
  } catch {
    // malformed token, fall through to refresh
  }

  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

// ─── Core fetch ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

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
    let message = res.statusText || `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err.detail ?? err.message ?? err.error ?? message;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),

  register: (fullName: string, email: string, password: string) =>
    apiFetch<UserResponse>("/auth/register", {
      method: "POST",
      body: { fullName, email, password, role: "CUSTOMER" },
      auth: false,
    }),

  logout: (refreshToken: string) =>
    apiFetch<void>("/auth/logout", { method: "POST", body: { refreshToken } }),

  me: () => apiFetch<UserResponse>("/me"),
};

// ─── Catalog (public) ────────────────────────────────────────────────────────

export interface ProductListParams {
  page?: number;
  size?: number;
  q?: string;
  category?: string;
  store?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name";
}

export const productApi = {
  list: (params: ProductListParams = {}) => {
    if (DEMO_MODE) return Promise.resolve(listDemoProducts(params));
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) qs.set(k, String(v));
    });
    const query = qs.toString();
    return apiFetch<Page<PublicProductResponse>>(
      `/products${query ? `?${query}` : ""}`,
      { auth: false },
    );
  },

  get: (slug: string) => {
    if (!DEMO_MODE)
      return apiFetch<PublicProductResponse>(`/products/${slug}`, {
        auth: false,
      });
    const product = DEMO_PRODUCTS.find((p) => p.slug === slug);
    return product
      ? Promise.resolve(product)
      : Promise.reject(new ApiError(404, "This product could not be found."));
  },

  flashSales: (page = 0, size = 20) =>
    apiFetch<Page<PublicProductResponse>>(
      `/products/flash-sales?page=${page}&size=${size}`,
      { auth: false },
    ),
};

export const categoryApi = {
  list: () =>
    DEMO_MODE
      ? Promise.resolve(DEMO_CATEGORIES)
      : apiFetch<CategoryResponse[]>("/categories", { auth: false }),
};

export const storeApi = {
  get: (slug: string) => {
    if (!DEMO_MODE)
      return apiFetch<PublicStoreResponse>(`/stores/${slug}`, { auth: false });
    const store = DEMO_STORES.find((s) => s.slug === slug);
    return store
      ? Promise.resolve(store)
      : Promise.reject(new ApiError(404, "This store could not be found."));
  },

  // Backend has no /stores/{slug}/products. Use the product search with the store filter.
  products: (slug: string, page = 0) =>
    productApi.list({ store: slug, page, size: 20 }),
};

// ─── Orders (customer) ───────────────────────────────────────────────────────

export const orderApi = {
  create: (
    items: { productId: string; quantity: number }[],
    shippingAddress: ShippingAddress,
  ) =>
    apiFetch<OrderResponse>("/orders", {
      method: "POST",
      body: { items, shippingAddress },
    }),

  list: (page = 0) => apiFetch<Page<OrderResponse>>(`/orders?page=${page}`),

  get: (id: string) => apiFetch<OrderResponse>(`/orders/${id}`),

  cancel: (id: string) =>
    apiFetch<OrderResponse>(`/orders/${id}/cancel`, { method: "POST" }),

  // Starts a payment session. providerReference is used by mockConfirm.
  pay: (orderId: string, provider: PaymentProvider = "MOCK") =>
    apiFetch<PaymentSession>(`/orders/${orderId}/pay`, {
      method: "POST",
      body: { provider },
    }),

  // Dev only. Backend requires the logged-in customer who owns the order.
  mockConfirm: (providerReference: string) =>
    apiFetch<void>(`/payments/mock/${providerReference}/confirm`, {
      method: "POST",
    }),
};

// ─── Vendor ──────────────────────────────────────────────────────────────────

export interface ProductWriteBody {
  name: string;
  description?: string;
  priceCents: number;
  currency: string;
  stockQuantity: number;
  categoryId: string;
  status: ProductStatus;
  imageUrls?: string[];
}

export const vendorApi = {
  store: () => apiFetch<VendorResponse>("/vendor/store"),

  dashboard: (period: "7d" | "30d" | "all" = "30d") =>
    apiFetch<VendorDashboardResponse>(`/vendor/dashboard?period=${period}`),

  products: (page = 0) =>
    apiFetch<Page<ProductResponse>>(`/vendor/products?page=${page}`),

  getProduct: (id: string) =>
    apiFetch<ProductResponse>(`/vendor/products/${id}`),

  createProduct: (data: ProductWriteBody) =>
    apiFetch<ProductResponse>("/vendor/products", {
      method: "POST",
      body: data,
    }),

  updateProduct: (id: string, data: ProductWriteBody) =>
    apiFetch<ProductResponse>(`/vendor/products/${id}`, {
      method: "PUT",
      body: data,
    }),

  orderItems: (page = 0) =>
    apiFetch<Page<VendorOrderItemResponse>>(
      `/vendor/orders/items?page=${page}`,
    ),

  advanceItem: (itemId: string, status: FulfillmentStatus) =>
    apiFetch<VendorOrderItemResponse>(
      `/vendor/orders/items/${itemId}/fulfillment`,
      {
        method: "PATCH",
        body: { status },
      },
    ),
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminApi = {
  stats: (period: "7d" | "30d" | "all" = "30d") =>
    apiFetch<PlatformStatsResponse>(`/admin/stats?period=${period}`),

  vendors: (page = 0) =>
    apiFetch<Page<VendorResponse>>(`/admin/vendors?page=${page}`),

  updateVendorStatus: (id: string, status: VendorStatus) =>
    apiFetch<VendorResponse>(`/admin/vendors/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),

  products: (page = 0) =>
    apiFetch<Page<AdminProductResponse>>(`/admin/products?page=${page}`),

  blockProduct: (id: string) =>
    apiFetch<void>(`/admin/products/${id}/block`, { method: "POST" }),

  unblockProduct: (id: string) =>
    apiFetch<void>(`/admin/products/${id}/unblock`, { method: "POST" }),

  users: (page = 0) =>
    apiFetch<Page<AdminUserResponse>>(`/admin/users?page=${page}`),

  updateUserStatus: (id: string, status: UserStatus) =>
    apiFetch<AdminUserResponse>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),

  // Public list, since the backend has no GET /admin/categories.
  categories: () => categoryApi.list(),

  createCategory: (name: string) =>
    apiFetch<CategoryResponse>("/admin/categories", {
      method: "POST",
      body: { name },
    }),

  updateCategory: (id: string, name: string) =>
    apiFetch<CategoryResponse>(`/admin/categories/${id}`, {
      method: "PUT",
      body: { name },
    }),

  deleteCategory: (id: string) =>
    apiFetch<void>(`/admin/categories/${id}`, { method: "DELETE" }),

  payments: (page = 0) =>
    apiFetch<Page<AdminPaymentReviewResponse>>(
      `/admin/payments/review?page=${page}`,
    ),

  resolvePayment: (paymentId: string) =>
    apiFetch<AdminPaymentReviewResponse>(
      `/admin/payments/review/${paymentId}/resolve`,
      { method: "POST" },
    ),

  refund: (paymentId: string) =>
    apiFetch<void>(`/admin/payments/${paymentId}/refund`, { method: "POST" }),

  orders: (page = 0) =>
    apiFetch<Page<AdminOrderRow>>(`/admin/orders?page=${page}`),
};
