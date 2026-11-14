// apps/web/src/lib/types.ts
// Mirrors services/core-api DTOs. Money is always cents (number).
// Instants are ISO-8601 strings. UUIDs are strings.

// ─── Enums ───────────────────────────────────────────────────────────────────

export type Role = "CUSTOMER" | "VENDOR" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED" | "BLOCKED";
export type OrderStatus = "PENDING" | "AWAITING_PAYMENT" | "PAID" | "CANCELLED" | "EXPIRED";
export type FulfillmentStatus = "NEW" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentProvider = "MOCK" | "STRIPE" | "SSLCOMMERZ";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED";
export type PaymentReviewReason = "HELD" | "LATE_PAYMENT" | "AMOUNT_MISMATCH" | "DUPLICATE_CHARGE";

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  user: UserResponse;
}

// ─── Catalog ─────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
}

export interface PublicStoreResponse {
  storeName: string;
  slug: string;
  description: string | null;
}

export interface PublicProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  salePriceCents: number | null;
  saleEndsAt: string | null;
  flashSaleActive: boolean;
  effectivePriceCents: number;
  currency: string;
  inStock: boolean;
  category: CategoryResponse;
  store: PublicStoreResponse;
  imageUrls: string[];
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  salePriceCents: number | null;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  flashSaleActive: boolean;
  effectivePriceCents: number;
  currency: string;
  stockQuantity: number;
  status: ProductStatus;
  categoryId: string;
  categoryName: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductResponse {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  stockQuantity: number;
  status: ProductStatus;
  categoryName: string;
  vendorId: string;
  storeName: string;
  vendorStatus: VendorStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Store / Vendor ──────────────────────────────────────────────────────────

export interface VendorResponse {
  id: string;
  ownerUserId: string;
  storeName: string;
  slug: string;
  description: string | null;
  status: VendorStatus;
  createdAt: string;
}

// ─── Shipping / Orders ───────────────────────────────────────────────────────

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  countryCode: string; // 2-letter ISO, e.g. "BD"
}

export interface OrderItem {
  id: string;
  productId: string;
  vendorId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  fulfillmentStatus: FulfillmentStatus;
}

export interface OrderResponse {
  id: string;
  status: OrderStatus;
  currency: string;
  totalCents: number;
  reservationExpiresAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
}

export interface VendorOrderItemResponse {
  itemId: string;
  orderId: string;
  placedAt: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  currency: string;
  fulfillmentStatus: FulfillmentStatus;
  shippingAddress: ShippingAddress;
}

export interface AdminOrderRow {
  id: string;
  status: OrderStatus;
  currency: string;
  totalCents: number;
  itemCount: number;
  customerEmail: string;
  createdAt: string;
  paidAt: string | null;
}

// ─── Payments ────────────────────────────────────────────────────────────────

export interface PaymentSession {
  paymentId: string;
  provider: PaymentProvider;
  providerReference: string;
  clientSecret: string | null;
  redirectUrl: string | null;
}

export interface AdminPaymentReviewResponse {
  paymentId: string;
  orderId: string;
  provider: PaymentProvider;
  providerReference: string;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  bankTranId: string | null;
  reviewReason: PaymentReviewReason | null;
  reviewAt: string | null;
  refundedAt: string | null;
  createdAt: string;
}

// ─── Vendor dashboard ────────────────────────────────────────────────────────

export interface VendorDashboardResponse {
  period: string;
  from: string;
  currency: string;
  revenue: {
    grossCents: number;
    commissionCents: number;
    netCents: number;
    orders: number;
    units: number;
  };
  pipeline: Partial<Record<FulfillmentStatus, number>>;
  lowStock: { productId: string; name: string; slug: string; stockQuantity: number }[];
  topProducts: { productId: string; name: string; unitsSold: number; revenueCents: number }[];
  daily: { date: string; grossCents: number; orders: number }[];
  recent: {
    itemId: string;
    orderId: string;
    paidAt: string;
    productName: string;
    quantity: number;
    lineTotalCents: number;
    fulfillmentStatus: FulfillmentStatus;
  }[];
}

// ─── Admin dashboard ─────────────────────────────────────────────────────────

export interface PlatformStatsResponse {
  period: string;
  from: string;
  currency: string;
  sales: { gmvCents: number; commissionCents: number; paidOrders: number; unitsSold: number };
  usersByRole: Record<string, number>;
  vendorsByStatus: Record<string, number>;
  productsByStatus: Record<string, number>;
  ordersByStatus: Record<string, number>;
  topVendors: { vendorId: string; storeName: string; grossCents: number; orders: number }[];
}

export interface AdminUserResponse {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}