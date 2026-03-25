"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SettlementDetailHeader,
  SettlementDetailView,
  SettlementDeleteDialog,
  SettlementNotFound,
  SettlementForm,
} from "@/components/settlement";
import { useSettlements } from "@/hooks/useSettlements";

export default function SettlementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const {
    getSettlement,
    deleteSettlement,
    markPaid,
    updateSettlement,
    stores,
    consignors,
    consignments,
    salesByConsignment,
  } = useSettlements();

  const [deleteTarget, setDeleteTarget] = useState<ReturnType<typeof getSettlement>>(null);
  const [isEditing, setIsEditing] = useState(isEditMode);

  const settlement = getSettlement(id);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteSettlement(deleteTarget.id);
    router.push("/dashboard/settlements");
  }

  function handleMarkPaid() {
    if (!settlement) return;
    markPaid(settlement.id);
    router.refresh();
  }

  function handleEditSubmit(_data: Parameters<typeof updateSettlement>[1]) {
    updateSettlement(id, _data as Parameters<typeof updateSettlement>[1]);
    setIsEditing(false);
  }

  if (!settlement) {
    return (
      <div className="max-w-2xl mx-auto">
        <SettlementNotFound id={id} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <SettlementDetailHeader
        settlement={settlement}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancelEdit={() => setIsEditing(false)}
        onDelete={() => setDeleteTarget(settlement)}
        onMarkPaid={handleMarkPaid}
      />

      {/* Edit form or detail view */}
      {isEditing ? (
        <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
          <h3 className="text-base font-semibold text-foreground mb-5">
            Chỉnh sửa đối soát
          </h3>
          <SettlementForm
            settlement={settlement}
            stores={stores}
            consignors={consignors}
            consignments={consignments}
            salesByConsignment={salesByConsignment}
            onSubmit={handleEditSubmit}
          />
        </div>
      ) : (
        <SettlementDetailView settlement={settlement} />
      )}

      {/* Delete dialog */}
      <SettlementDeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
