"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ConsignmentDetailHeader,
  ConsignmentDetailView,
  ConsignmentDeleteDialog,
  ConsignmentNotFound,
} from "@/components/consignment";
import { ConsignmentForm } from "@/components/consignment";
import { useConsignments } from "@/hooks/useConsignments";
import {
  Consignment,
  ConsignmentItem,
  ConsignmentWithItems,
} from "@/types/consignment";

export default function ConsignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const {
    getConsignment,
    updateConsignment,
    deleteConsignment,
    consignors,
    stores,
    products,
  } = useConsignments();

  const [deleteTarget, setDeleteTarget] = useState<ConsignmentWithItems | null>(null);
  const [isEditing, setIsEditing] = useState(isEditMode);

  const consignment = getConsignment(id);
  const consignor = consignors.find((c) => c.id === consignment?.consignorId);
  const store = stores.find((s) => s.id === consignment?.storeId);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteConsignment(deleteTarget.id);
    router.push("/dashboard/consignments");
  }

  function handleEditSubmit(
    data: Partial<Consignment>,
    items: Omit<ConsignmentItem, "id" | "consignmentId">[]
  ) {
    updateConsignment(id, data);
    setIsEditing(false);
  }

  if (!consignment) {
    return (
      <div className="max-w-2xl mx-auto">
        <ConsignmentNotFound id={id} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <ConsignmentDetailHeader
        consignment={consignment}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancelEdit={() => setIsEditing(false)}
        onDelete={() => setDeleteTarget(consignment)}
      />

      {/* Edit form or detail view */}
      {isEditing ? (
        <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
          <h3 className="text-base font-semibold text-foreground mb-5">
            Chỉnh sửa lô ký gửi
          </h3>
          <ConsignmentForm
            consignment={consignment}
            consignors={consignors}
            stores={stores}
            products={products}
            onSubmitEdit={handleEditSubmit}
          />
        </div>
      ) : (
        <>
          {consignor && store && (
            <ConsignmentDetailView
              consignment={consignment}
              consignor={consignor}
              store={store}
              products={products}
            />
          )}
        </>
      )}

      {/* Delete dialog */}
      <ConsignmentDeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
