import type {
  CategoryResponse,
  Page,
  PublicProductResponse,
  PublicStoreResponse,
} from "./types";
import type { ProductListParams } from "./api";

// Demo mode is permanently off. The app always uses the live API.
export const DEMO_MODE = false;

// Empty placeholders. Kept so existing imports still compile.
export const DEMO_CATEGORIES: CategoryResponse[] = [];
export const DEMO_STORES: PublicStoreResponse[] = [];
export const DEMO_PRODUCTS: PublicProductResponse[] = [];

export function listDemoProducts(_params: ProductListParams = {}): Page<PublicProductResponse> {
  return { content: [], page: 0, size: 0, totalElements: 0, totalPages: 0 };
}

// Blocks open redirects. Only allows same-site paths that start with a single "/".
export function safeReturnPath(value: string | null): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020]/.test(value)
  )
    return null;
  return value;
}