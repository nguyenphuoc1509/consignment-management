"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SaleDetailHeader,
  SaleDetailView,
  SaleDeleteDialog,
  SaleNotFound,
} from "@/components/sale";
import { SaleForm } from "@/components/sale";
import { useSales } from "@/hooks/useSales";
import { Sale } from "@/types/sale";

export default function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const {
    getSale,
    deleteSale,
    cancelSale,
    stores,
    consignments,
    products,
    getAvailableQuantity,
  } = useSales();

  const [deleteTarget, setDeleteTarget] = useState<ReturnType<typeof getSale>>(null);
  const [isEditing, setIsEditing] = useState(isEditMode);

  const sale = getSale(id);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteSale(deleteTarget.id);
    router.push("/dashboard/sales");
  }

  function handleCancel() {
    if (!sale) return;
    cancelSale(sale.id);
    router.refresh();
  }

  function handleEditSubmit(_data: Omit<Sale, "id" | "createdAt" | "updatedAt">) {
    setIsEditing(false);
  }

  if (!sale) {
    return (
      <div className="max-w-2xl mx-auto">
        <SaleNotFound id={id} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <SaleDetailHeader
        sale={sale}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancelEdit={() => setIsEditing(false)}
        onDelete={() => setDeleteTarget(sale)}
        onCancel={handleCancel}
      />

      {/* Edit form or detail view */}
      {isEditing ? (
        <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
          <h3 className="text-base font-semibold text-foreground mb-5">
            Chỉnh sửa giao dịch
          </h3>
          <SaleForm
            sale={sale}
            stores={stores}
            consignments={consignments}
            products={products}
            getAvailableQuantity={getAvailableQuantity}
            onSubmit={handleEditSubmit}
          />
        </div>
      ) : (
        <SaleDetailView sale={sale} />
      )}

      {/* Delete dialog */}
      <SaleDeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
