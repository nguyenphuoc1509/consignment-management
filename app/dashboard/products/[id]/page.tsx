"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductForm } from "@/components/product/ProductForm";
import {
  ProductDetailHeader,
  ProductDetailInfo,
  ProductCommissionCard,
  ProductNotFound,
} from "@/components/product";
import { DeleteDialog } from "@/components/deleteDialog/DeleteDialog";
import { useProducts } from "@/hooks/useProducts";
import { useConsignors } from "@/hooks/useConsignors";
import { Product } from "@/types/product";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const { getProduct, updateProduct, deleteProduct } = useProducts();
  const { consignors } = useConsignors();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(isEditMode);

  const product = getProduct(id);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    router.push("/dashboard/products");
  }

  function handleEditSubmit(data: Partial<Product>) {
    updateProduct(id, data);
    setIsEditing(false);
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto">
        <ProductNotFound id={id} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <ProductDetailHeader
        product={product}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancelEdit={() => setIsEditing(false)}
        onDelete={() => setDeleteTarget(product)}
      />

      {/* Edit form or detail view */}
      {isEditing ? (
        <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
          <h3 className="text-base font-semibold text-foreground mb-5">
            Chỉnh sửa sản phẩm
          </h3>
          <ProductForm
            product={product}
            consignors={consignors.map((c) => ({ id: c.id, companyName: c.companyName }))}
            onSubmit={handleEditSubmit}
          />
        </div>
      ) : (
        <>
          <ProductDetailInfo product={product} />
          <ProductCommissionCard product={product} />
        </>
      )}

      {/* Delete dialog */}
      <DeleteDialog
        target={deleteTarget}
        itemLabel="sản phẩm"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
