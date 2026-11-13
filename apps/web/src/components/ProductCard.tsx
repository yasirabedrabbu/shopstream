// apps/web/src/components/ProductCard.tsx
import Link from "next/link";
import type { PublicProductResponse } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { Badge } from "./Badge";

interface ProductCardProps {
  product: PublicProductResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const isFlash = product.flashSaleActive;
  const img = product.imageUrls?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border transition-colors hover:border-[#E8F44A]"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="aspect-square w-full overflow-hidden" style={{ background: "var(--border)" }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
            No image
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {product.store.storeName}
        </p>
        <h3
          className="text-sm font-semibold line-clamp-2 leading-snug"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
            {formatMoney(product.effectivePriceCents, product.currency)}
          </span>
          {isFlash && (
            <>
              <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>
                {formatMoney(product.priceCents, product.currency)}
              </span>
              <Badge variant="accent">Flash</Badge>
            </>
          )}
        </div>

        {!product.inStock && <p className="text-xs text-red-500">Out of stock</p>}
      </div>
    </Link>
  );
}