import Link from "next/link";
import Image from "next/image";
import type { PublicProductResponse } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { DEMO_MODE } from "@/lib/demo";
import { Icon } from "./ui/Icon";

export function ProductCard({ product }: { product: PublicProductResponse }) {
  const discount =
    product.flashSaleActive && product.priceCents > product.effectivePriceCents
      ? Math.round((1 - product.effectivePriceCents / product.priceCents) * 100)
      : 0;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex min-w-0 flex-col rounded-xl border border-border bg-bg p-2 transition-colors hover:border-text/40 sm:p-3"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        {product.imageUrls[0] ? (
          <Image
            unoptimized={!product.imageUrls[0].startsWith("/")}
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-text-muted">
            <Icon name="box" size={40} />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-accent px-2 py-1 text-[10px] font-bold text-accent-text sm:text-xs">
            {discount}% off
          </span>
        )}
        {!product.inStock && (
          <span className="absolute bottom-2 left-2 rounded-md bg-bg/95 px-2 py-1 text-xs font-medium text-text">
            Currently unavailable
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1 pb-2 pt-4 sm:px-2">
        <p className="truncate text-[11px] text-text-muted sm:text-xs">
          {product.store.storeName}
        </p>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-relaxed sm:text-base">
          {product.name}
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-3">
          <span className="text-sm font-bold sm:text-base">
            {formatMoney(product.effectivePriceCents, product.currency)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-text-muted line-through">
              <span className="sr-only">Was </span>
              {formatMoney(product.priceCents, product.currency)}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between gap-1 border-t border-border pt-3">
          <span className="text-[11px] text-text-muted sm:text-xs">
            {DEMO_MODE
              ? "Sample listing"
              : product.inStock
                ? "In stock"
                : "Out of stock"}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold">
            View <span className="hidden sm:inline">details</span>
            <Icon name="arrowRight" size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
