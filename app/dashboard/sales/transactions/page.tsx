"use client";

import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SaleSummaryCards,
  SaleFilters,
  SaleTable,
} from "@/components/sale";
import { useSales } from "@/hooks/useSales";

export default function SalesTransactionsPage() {
  const {
    filtered,
    filters,
    counts,
    deleteSale,
    cancelSale,
    stores,
  } = useSales();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/sales">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Giao dịch bán hàng</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Danh sách từng giao dịch đã ghi nhận.
            </p>
          </div>
        </div>
        <Button className="w-full sm:w-auto shrink-0" asChild>
          <Link href="/dashboard/sales/add">
            <Plus className="size-4" />
            Ghi nhận bán hàng
          </Link>
        </Button>
      </div>

      <SaleSummaryCards
        total={counts.total}
        byStatus={counts.byStatus}
        totalRevenue={counts.totalRevenue}
      />

      <SaleFilters
        search={filters.search}
        statusFilter={filters.statusFilter}
        storeFilter={filters.storeFilter}
        stores={stores}
        onSearchChange={filters.setSearch}
        onStatusChange={filters.setStatusFilter}
        onStoreChange={filters.setStoreFilter}
      />

      <SaleTable
        sales={filtered}
        onDelete={deleteSale}
        onCancel={(s) => cancelSale(s.id)}
      />

      <p className="text-xs text-muted-foreground text-right">
        Hiển thị {filtered.length} / {counts.total} giao dịch
      </p>
    </div>
  );
}
