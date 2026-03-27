"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ConsignorDetailHeader,
  ConsignorDetailView,
  ConsignorNotFound,
} from "@/components/consignor";
import { ConsignorForm } from "@/components/consignor";
import { DeleteDialog } from "@/components/deleteDialog/DeleteDialog";
import { useConsignors } from "@/hooks/useConsignors";
import { Consignor } from "@/types/consignor";

export default function ConsignorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const { getConsignor, updateConsignor, deleteConsignor } = useConsignors();
  const [deleteTarget, setDeleteTarget] = useState<Consignor | null>(null);
  const [isEditing, setIsEditing] = useState(isEditMode);

  const consignor = getConsignor(id);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteConsignor(deleteTarget.id);
    router.push("/dashboard/consignors");
  }

  function handleEditSubmit(data: Partial<Consignor>) {
    updateConsignor(id, data);
    setIsEditing(false);
  }

  if (!consignor) {
    return (
      <div className="max-w-2xl mx-auto">
        <ConsignorNotFound id={id} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <ConsignorDetailHeader
        consignor={consignor}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancelEdit={() => setIsEditing(false)}
        onDelete={() => setDeleteTarget(consignor)}
      />

      {/* Edit form or detail view */}
      {isEditing ? (
        <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
          <h3 className="text-base font-semibold text-foreground mb-5">
            Chỉnh sửa kho cung cấp
          </h3>
          <ConsignorForm consignor={consignor} onSubmit={handleEditSubmit} />
        </div>
      ) : (
        <ConsignorDetailView consignor={consignor} />
      )}

      {/* Delete dialog */}
      <DeleteDialog
        target={deleteTarget}
        itemLabel="kho sản xuất"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
