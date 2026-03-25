"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SettlementSummaryCards,
  SettlementFilters,
  SettlementTable,
} from "@/components/settlement";
import { useSettlements } from "@/hooks/useSettlements";

export default function SettlementsPage() {
  const {
    filtered,
    filters,
    counts,
    deleteSettlement,
    markPaid,
    consignors,
    stores,
    consignments,
  } = useSettlements();

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Đối soát</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tính toán và theo dõi thanh toán cho các bên giao hàng.
          </p>
        </div>
        <Button className="w-full sm:w-auto shrink-0" asChild>
          <Link href="/dashboard/settlements/add">
            <Plus className="size-4" />
            Tạo đối soát
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <SettlementSummaryCards
        total={counts.total}
        byStatus={counts.byStatus}
        totalPayable={counts.totalPayable}
      />

      {/* Filters */}
      <SettlementFilters
        search={filters.search}
        statusFilter={filters.statusFilter}
        storeFilter={filters.storeFilter}
        consignorFilter={filters.consignorFilter}
        consignmentFilter={filters.consignmentFilter}
        stores={stores}
        consignors={consignors}
        consignments={consignments}
        onSearchChange={filters.setSearch}
        onStatusChange={filters.setStatusFilter}
        onStoreChange={filters.setStoreFilter}
        onConsignorChange={filters.setConsignorFilter}
        onConsignmentChange={filters.setConsignmentFilter}
      />

      {/* Table */}
      <SettlementTable
        settlements={filtered}
        onDelete={deleteSettlement}
        onMarkPaid={(s) => markPaid(s.id)}
      />

      {/* Results summary */}
      <p className="text-xs text-muted-foreground text-right">
        Hiển thị {filtered.length} / {counts.total} đối soát
      </p>
    </div>
  );
}
