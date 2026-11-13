// apps/web/src/app/vendor/products/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { vendorApi, categoryApi } from "@/lib/api";
import { ProductForm, type ProductFormValues } from "@/components/ProductForm";
import type { CategoryResponse } from "@/lib/types";

const blank: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  status: "ACTIVE",
  imageUrls: "",
};

export default function NewProductPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    categoryApi
      .list()
      .then(setCategories)
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="p-6 h-64 max-w-xl rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />;
  }

  return (
    <ProductForm
      title="New product"
      categories={categories}
      initial={blank}
      submitLabel="Create product"
      onSubmit={(body) => vendorApi.createProduct(body)}
    />
  );
}