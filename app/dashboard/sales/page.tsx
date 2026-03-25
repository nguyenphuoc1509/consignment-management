"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SaleSummaryCards,
  SaleFilters,
  SaleTable,
} from "@/components/sale";
import { useSales } from "@/hooks/useSales";

export default function SalesPage() {
  const {
    filtered,
    filters,
    counts,
    deleteSale,
    cancelSale,
    stores,
    consignments,
  } = useSales();

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Giao dịch bán hàng</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ghi nhận và theo dõi các giao dịch bán hàng từ cửa hàng.
          </p>
        </div>
        <Button className="w-full sm:w-auto shrink-0" asChild>
          <Link href="/dashboard/sales/add">
            <Plus className="size-4" />
            Ghi nhận bán hàng
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <SaleSummaryCards
        total={counts.total}
        byStatus={counts.byStatus}
        totalRevenue={counts.totalRevenue}
      />

      {/* Filters */}
      <SaleFilters
        search={filters.search}
        statusFilter={filters.statusFilter}
        storeFilter={filters.storeFilter}
        consignmentFilter={filters.consignmentFilter}
        stores={stores}
        consignments={consignments}
        onSearchChange={filters.setSearch}
        onStatusChange={filters.setStatusFilter}
        onStoreChange={filters.setStoreFilter}
        onConsignmentChange={filters.setConsignmentFilter}
      />

      {/* Table */}
      <SaleTable
        sales={filtered}
        onDelete={deleteSale}
        onCancel={(s) => cancelSale(s.id)}
      />

      {/* Results summary */}
      <p className="text-xs text-muted-foreground text-right">
        Hiển thị {filtered.length} / {counts.total} giao dịch
      </p>
    </div>
  );
}
