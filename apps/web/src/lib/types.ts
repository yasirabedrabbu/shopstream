// apps/web/src/lib/types.ts

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
  status: string;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED" | "BLOCKED";

export interface PublicProductResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  currency: string;
  salePriceCents: number | null;
  saleEndsAt: string | null;
  stockQuantity: number;
  imageUrls: string[];
  status: ProductStatus;
  categoryId: number;
  categoryName: string;
  vendorId: number;
  storeName: string;
  storeSlug: string;
  createdAt: string;
}

export interface AdminProductResponse extends PublicProductResponse {
  vendorEmail: string;
}

// ─── Store / Vendor ───────────────────────────────────────────────────────────

export type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";

export interface StoreResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  status: VendorStatus;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED";

export type FulfillmentStatus =
  | "NEW"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  quantity: number;
  unitPriceCents: number;
  currency: string;
}

export interface OrderResponse {
  id: number;
  status: OrderStatus;
  totalCents: number;
  currency: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED";
export type PaymentReviewReason =
  | "HELD"
  | "LATE_PAYMENT"
  | "AMOUNT_MISMATCH"
  | "DUPLICATE_CHARGE";

export interface PaymentReviewResponse {
  id: number;
  orderId: number;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  reviewReason: PaymentReviewReason | null;
  providerReference: string;
  createdAt: string;
}

// ─── Vendor Dashboard ─────────────────────────────────────────────────────────

export interface VendorDashboardResponse {
  period: string;
  totalRevenueCents: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  revenueByDay: { date: string; revenueCents: number }[];
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface PlatformStatsResponse {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenueCents: number;
  pendingVendors: number;
}

export interface AdminUserResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}