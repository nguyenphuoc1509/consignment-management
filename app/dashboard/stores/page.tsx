"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StoreSummaryCards,
  StoreFilters,
  StoreTable,
} from "@/components/store";
import { useStores } from "@/hooks/useStores";

export default function StoresPage() {
  const {
    filtered,
    filters,
    counts,
    deleteStore,
  } = useStores();

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Cửa hàng</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý thông tin các chi nhánh và điểm bán hàng.
          </p>
        </div>
        <Button className="w-full sm:w-auto shrink-0" asChild>
          <Link href="/dashboard/stores/add">
            <Plus className="size-4" />
            Thêm cửa hàng
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <StoreSummaryCards
        total={counts.total}
        active={counts.active}
        inactive={counts.inactive}
      />

      {/* Filters */}
      <StoreFilters
        search={filters.search}
        statusFilter={filters.statusFilter}
        onSearchChange={filters.setSearch}
        onStatusChange={filters.setStatusFilter}
      />

      {/* Table */}
      <StoreTable
        stores={filtered}
        onDelete={deleteStore}
      />

      {/* Results summary */}
      <p className="text-xs text-muted-foreground text-right">
        Hiển thị {filtered.length} / {counts.total} cửa hàng
      </p>
    </div>
  );
}
