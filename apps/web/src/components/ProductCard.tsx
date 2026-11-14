// apps/web/src/components/ProductCard.tsx
import Link from "next/link";
import type { PublicProductResponse } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { Icon } from "./ui/Icon";

interface ProductCardProps {
  product: PublicProductResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const isFlash = product.flashSaleActive;
  const img = product.imageUrls?.[0];
  const discount =
    isFlash && product.priceCents > 0
      ? Math.round((1 - product.effectivePriceCents / product.priceCents) * 100)
      : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-[var(--shadow-lift)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-border">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-muted">
            <Icon name="box" size={28} />
            <span className="text-xs">No image</span>
          </div>
        )}

        {isFlash && discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-text shadow-sm">
            -{discount}%
          </span>
        )}

        {!product.inStock && (
          <div
            className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]"
            style={{ background: "color-mix(in srgb, var(--bg) 70%, transparent)" }}
          >
            <span className="rounded-full bg-text px-3 py-1 text-xs font-semibold text-bg">
              Sold out
            </span>
          </div>
        )}

        {product.inStock && (
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 rounded-full bg-bg px-4 py-1.5 text-xs font-semibold text-text opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            View details
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="truncate text-xs text-text-muted">{product.store.storeName}</p>
        <h3
          className="line-clamp-2 text-sm font-semibold leading-snug text-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {product.name}
        </h3>

        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2">
          <span className="text-sm font-bold text-text">
            {formatMoney(product.effectivePriceCents, product.currency)}
          </span>
          {isFlash && (
            <span className="text-xs text-text-muted line-through">
              {formatMoney(product.priceCents, product.currency)}
            </span>
          )}
        </div>

        {product.inStock ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            In stock
          </p>
        ) : (
          <p className="text-xs font-medium text-danger">Out of stock</p>
        )}
      </div>
    </Link>
  );
}