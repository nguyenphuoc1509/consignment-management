"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ConsignmentSummaryCards,
  ConsignmentFilters,
  ConsignmentTable,
} from "@/components/consignment";
import { useConsignments } from "@/hooks/useConsignments";

export default function ConsignmentsPage() {
  const {
    filtered,
    filters,
    counts,
    deleteConsignment,
    consignors,
    stores,
  } = useConsignments();

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Lô ký gửi</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý thông tin các lô hàng ký gửi từ bên giao đến cửa hàng.
          </p>
        </div>
        <Button className="w-full sm:w-auto shrink-0" asChild>
          <Link href="/dashboard/consignments/add">
            <Plus className="size-4" />
            Tạo lô ký gửi
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <ConsignmentSummaryCards total={counts.total} byStatus={counts.byStatus} />

      {/* Filters */}
      <ConsignmentFilters
        search={filters.search}
        statusFilter={filters.statusFilter}
        consignorFilter={filters.consignorFilter}
        storeFilter={filters.storeFilter}
        consignors={consignors}
        stores={stores}
        onSearchChange={filters.setSearch}
        onStatusChange={filters.setStatusFilter}
        onConsignorChange={filters.setConsignorFilter}
        onStoreChange={filters.setStoreFilter}
      />

      {/* Table */}
      <ConsignmentTable
        consignments={filtered}
        consignors={consignors}
        stores={stores}
        onDelete={deleteConsignment}
      />

      {/* Results summary */}
      <p className="text-xs text-muted-foreground text-right">
        Hiển thị {filtered.length} / {counts.total} lô ký gửi
      </p>
    </div>
  );
}
