import type {
  CategoryResponse,
  PublicProductResponse,
  PublicStoreResponse,
} from "./types";
import type { ProductListParams } from "./api";

// The imported frontend is a demo unless an API URL is explicitly configured.
export const DEMO_MODE = !process.env.NEXT_PUBLIC_API_URL;

export const DEMO_CATEGORIES: CategoryResponse[] = [
  { id: "fashion", slug: "fashion", name: "Fashion" },
  { id: "electronics", slug: "electronics", name: "Electronics" },
  { id: "grocery", slug: "grocery", name: "Grocery" },
  { id: "beauty", slug: "beauty", name: "Beauty" },
  { id: "home", slug: "home", name: "Home" },
  { id: "books", slug: "books", name: "Books" },
];

export const DEMO_STORES: PublicStoreResponse[] = [
  {
    storeName: "Bengal & Thread",
    slug: "bengal-thread",
    description:
      "Considered clothing and everyday essentials, inspired by Bangladesh.",
  },
  {
    storeName: "The Everyday Edit",
    slug: "everyday-edit",
    description:
      "Little discoveries for your home, bookshelf, and daily rituals.",
  },
  {
    storeName: "Fresh from Home",
    slug: "fresh-from-home",
    description:
      "Seasonal produce and simple, thoughtfully chosen pantry essentials.",
  },
];

const items = [
  [
    "cotton-panjabi-set",
    "The everyday cotton set",
    "fashion",
    245000,
    215000,
    0,
    "Breathable white cotton panjabi with a relaxed fit, paired with brown sandals. A sample coordinated set for quiet mornings and special occasions.",
    true,
  ],
  [
    "wireless-essentials",
    "Your daily tech essentials",
    "electronics",
    699000,
    null,
    1,
    "A sample collection of a smartphone, wireless earbuds, and a smartwatch. Explore the bundle layout in this frontend preview.",
    true,
  ],
  [
    "seasonal-harvest",
    "The seasonal harvest basket",
    "grocery",
    125000,
    null,
    2,
    "A colorful selection of seasonal fruit and vegetables. Sample contents are shown for illustration; availability is not live.",
    true,
  ],
  [
    "botanical-perfume",
    "Botanical eau de parfum",
    "beauty",
    185000,
    165000,
    1,
    "A soft botanical fragrance in a reusable glass bottle. A little moment of calm for your everyday routine. Sample size: 50 ml.",
    true,
  ],
  [
    "natural-jute-runner",
    "Handwoven jute runner",
    "home",
    320000,
    null,
    1,
    "Natural texture for your favorite corner. This sample handwoven jute runner brings a warm, understated finish to your home.",
    true,
  ],
  [
    "weekend-reading-set",
    "The slow weekend reading set",
    "books",
    195000,
    null,
    1,
    "A curated sample collection of five books for a slower weekend. Image is illustrative; titles are not a live listing.",
    true,
  ],
  [
    "festive-cotton-edit",
    "The festive cotton edit",
    "fashion",
    285000,
    null,
    0,
    "A refined cotton ensemble with a clean silhouette and natural details. Sample product photography is shared with the everyday cotton set.",
    false,
  ],
  [
    "home-reading-collection",
    "A little reading corner",
    "home",
    450000,
    405000,
    1,
    "A sample home collection built around woven textures and warm neutrals. Image is illustrative and does not represent live inventory.",
    true,
  ],
] as const;

export const DEMO_PRODUCTS: PublicProductResponse[] = items.map(
  ([slug, name, category, price, sale, store, description, inStock]) => ({
    id: slug,
    slug,
    name,
    description,
    priceCents: price,
    salePriceCents: sale,
    effectivePriceCents: sale ?? price,
    flashSaleActive: sale !== null,
    saleEndsAt: null,
    currency: "BDT",
    inStock,
    category: DEMO_CATEGORIES.find((c) => c.slug === category)!,
    store: DEMO_STORES[store],
    imageUrls: [`/images/cat-${category}.webp`],
  }),
);

export function listDemoProducts(params: ProductListParams = {}) {
  const query = params.q?.trim().toLowerCase() ?? "";
  const filtered = DEMO_PRODUCTS.filter(
    (product) =>
      (!query ||
        `${product.name} ${product.description} ${product.category.name} ${product.store.storeName}`
          .toLowerCase()
          .includes(query)) &&
      (!params.category || product.category.slug === params.category) &&
      (!params.store || product.store.slug === params.store) &&
      (params.minPrice === undefined ||
        product.effectivePriceCents >= params.minPrice) &&
      (params.maxPrice === undefined ||
        product.effectivePriceCents <= params.maxPrice),
  );
  if (params.sort === "price_asc")
    filtered.sort((a, b) => a.effectivePriceCents - b.effectivePriceCents);
  if (params.sort === "price_desc")
    filtered.sort((a, b) => b.effectivePriceCents - a.effectivePriceCents);
  if (params.sort === "name")
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  const size = Math.max(1, params.size ?? 12);
  const page = Math.max(0, params.page ?? 0);
  return {
    content: filtered.slice(page * size, (page + 1) * size),
    page,
    size,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
  };
}

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
