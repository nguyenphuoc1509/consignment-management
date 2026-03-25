"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  StoreDetailHeader,
  StoreDetailView,
  StoreDeleteDialog,
  StoreNotFound,
} from "@/components/store";
import { StoreForm } from "@/components/store";
import { useStores } from "@/hooks/useStores";
import { Store } from "@/types/store";

export default function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const { getStore, updateStore, deleteStore } = useStores();
  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null);
  const [isEditing, setIsEditing] = useState(isEditMode);

  const store = getStore(id);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteStore(deleteTarget.id);
    router.push("/dashboard/stores");
  }

  function handleEditSubmit(data: Partial<Store>) {
    updateStore(id, data);
    setIsEditing(false);
  }

  if (!store) {
    return (
      <div className="max-w-2xl mx-auto">
        <StoreNotFound id={id} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <StoreDetailHeader
        store={store}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancelEdit={() => setIsEditing(false)}
        onDelete={() => setDeleteTarget(store)}
      />

      {/* Edit form or detail view */}
      {isEditing ? (
        <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
          <h3 className="text-base font-semibold text-foreground mb-5">
            Chỉnh sửa cửa hàng
          </h3>
          <StoreForm store={store} onSubmit={handleEditSubmit} />
        </div>
      ) : (
        <StoreDetailView store={store} />
      )}

      {/* Delete dialog */}
      <StoreDeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
