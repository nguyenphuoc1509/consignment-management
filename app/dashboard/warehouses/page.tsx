"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  WarehouseTable,
  WarehouseSummaryCards,
} from "@/components/warehouse";
import { useWarehouses } from "@/hooks/useWarehouses";
import { DeleteDialog } from "@/components/deleteDialog/DeleteDialog";
import { useState } from "react";
import { Warehouse } from "@/types/warehouse";

export default function WarehousesPage() {
  const { warehouses, loading, error, stats, fetchWarehouses } = useWarehouses();
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/warehouses/${deleteTarget.id}`, { method: "DELETE" });
      fetchWarehouses();
    } catch {}
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Quản lý kho</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tạo và quản lý tồn kho hàng hóa theo từng kho dự trữ.
          </p>
        </div>
        <Button className="w-full sm:w-auto shrink-0" asChild>
          <Link href="/dashboard/warehouses/add">
            <Plus className="size-4" />
            Tạo kho
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      {!loading && !error && (
        <WarehouseSummaryCards
          totalWarehouses={stats.totalWarehouses}
          totalProducts={stats.totalProducts}
          totalStock={stats.totalStock}
          totalReserved={stats.totalReserved}
        />
      )}

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <WarehouseTable
          warehouses={warehouses as (Warehouse & {
            inventory: { id: string; productId: string; quantity: number; reserved: number; product: { id: string; sku: string; name: string; price: number } }[];
          })[]}
          onDelete={(w) => setDeleteTarget(w)}
        />
      )}

      {/* Results summary */}
      {!loading && !error && (
        <p className="text-xs text-muted-foreground text-right">
          Hiển thị {warehouses.length} kho
        </p>
      )}

      <DeleteDialog
        target={deleteTarget}
        itemLabel="kho"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
