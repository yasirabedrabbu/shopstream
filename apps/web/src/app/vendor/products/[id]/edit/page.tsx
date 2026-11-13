// apps/web/src/app/vendor/products/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { vendorApi, categoryApi } from "@/lib/api";
import { ProductForm, type ProductFormValues } from "@/components/ProductForm";
import { useToast } from "@/components/Toast";
import type { CategoryResponse, ProductResponse } from "@/lib/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([vendorApi.getProduct(id), categoryApi.list()])
      .then(([p, cats]) => {
        setProduct(p);
        setCategories(cats);
      })
      .catch((err) => {
        toast(err instanceof Error ? err.message : "Could not load product.", "error");
        router.replace("/vendor/products");
      })
      .finally(() => setLoading(false));
  }, [id, router, toast]);

  if (loading || !product) {
    return <div className="p-6 h-64 max-w-xl rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />;
  }

  const initial: ProductFormValues = {
    name: product.name,
    description: product.description ?? "",
    price: (product.priceCents / 100).toFixed(2),
    stock: String(product.stockQuantity),
    categoryId: product.categoryId,
    status: product.status === "BLOCKED" ? "DRAFT" : product.status,
    imageUrls: product.imageUrls.join(", "),
  };

  return (
    <ProductForm
      title="Edit product"
      categories={categories}
      initial={initial}
      submitLabel="Save changes"
      onSubmit={(body) => vendorApi.updateProduct(id, body)}
    />
  );
}