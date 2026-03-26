"use client";

import { use, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductForm } from "@/components/product/ProductForm";
import {
  ProductDetailHeader,
  ProductDetailInfo,
  ProductNotFound,
} from "@/components/product";
import { SuccessDialog, FailDialog } from "@/components/dialog";
import { DeleteDialog } from "@/components/deleteDialog/DeleteDialog";
import { useProducts } from "@/hooks/useProducts";
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

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [successOpen, setSuccessOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const [failMessage, setFailMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLoadingProduct(true);
    getProduct(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoadingProduct(false));
  }, [id, getProduct]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget);
      router.push("/dashboard/products");
    } catch (err) {
      setFailMessage(err instanceof Error ? err.message : "Xóa sản phẩm thất bại.");
      setFailOpen(true);
    }
  }

  async function handleEditSubmit(data: Partial<Product>) {
    setIsLoading(true);
    try {
      const updated = await updateProduct(id, data);
      setProduct(updated);
      setIsEditing(false);
      setSuccessOpen(true);
    } catch (err) {
      setFailMessage(err instanceof Error ? err.message : "Cập nhật sản phẩm thất bại.");
      setFailOpen(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (loadingProduct) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto">
        <ProductNotFound id={id} />
      </div>
    );
  }

  return (
    <>
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
              onSubmit={handleEditSubmit}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <ProductDetailInfo product={product} />
        )}

        {/* Delete dialog */}
        <DeleteDialog
          target={deleteTarget}
          itemLabel="sản phẩm"
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      </div>

      <SuccessDialog
        open={successOpen}
        title="Cập nhật thành công"
        message="Thông tin sản phẩm đã được lưu."
        onClose={() => setSuccessOpen(false)}
      />

      <FailDialog
        open={failOpen}
        title="Thất bại"
        message={failMessage}
        onClose={() => setFailOpen(false)}
      />
    </>
  );
}
