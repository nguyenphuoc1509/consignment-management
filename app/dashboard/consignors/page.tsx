"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ConsignorSummaryCards,
  ConsignorFilters,
  ConsignorTable,
} from "@/components/consignor";
import { DeleteDialog } from "@/components/deleteDialog/DeleteDialog";
import { Consignor } from "@/types/consignor";
import { useConsignors } from "@/hooks/useConsignors";

export default function ConsignorsPage() {
  const {
    filtered,
    filters,
    counts,
    deleteConsignor,
  } = useConsignors();

  const [deleteTarget, setDeleteTarget] = useState<Consignor | null>(null);

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Kho cung cấp</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý thông tin các kho cung cấp.
          </p>
        </div>
        <Button className="w-full sm:w-auto shrink-0" asChild>
          <Link href="/dashboard/consignors/add">
            <Plus className="size-4" />
            Thêm kho cung cấp
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <ConsignorSummaryCards
        total={counts.total}
        active={counts.active}
        inactive={counts.inactive}
      />

      {/* Filters */}
      <ConsignorFilters
        search={filters.search}
        statusFilter={filters.statusFilter}
        onSearchChange={filters.setSearch}
        onStatusChange={filters.setStatusFilter}
      />

      {/* Table */}
      <ConsignorTable
        consignors={filtered}
        onSelectDelete={setDeleteTarget}
      />

      {/* Delete dialog */}
      <DeleteDialog
        target={deleteTarget}
        itemLabel="kho cung cấp"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteConsignor(deleteTarget);
          setDeleteTarget(null);
        }}
      />

      {/* Results summary */}
      <p className="text-xs text-muted-foreground text-right">
        Hiển thị {filtered.length} / {counts.total} kho cung cấp
      </p>
    </div>
  );
}
