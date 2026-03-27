// components/warehouse/WarehouseSummaryCards.tsx
"use client";

import { Warehouse, Package, Box, Calendar } from "lucide-react";

interface WarehouseSummaryCardsProps {
  totalWarehouses: number;
  totalProducts: number;
  totalStock: number;
  totalReserved: number;
}

export function WarehouseSummaryCards({
  totalWarehouses,
  totalProducts,
  totalStock,
  totalReserved,
}: WarehouseSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
          <Warehouse className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{totalWarehouses}</p>
          <p className="text-xs text-muted-foreground">Tổng kho</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 sm:size-10">
          <Package className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{totalProducts}</p>
          <p className="text-xs text-muted-foreground">Tổng SKU</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 sm:size-10">
          <Box className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{totalStock}</p>
          <p className="text-xs text-muted-foreground">Tổng tồn kho</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400 sm:size-10">
          <Box className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{totalReserved}</p>
          <p className="text-xs text-muted-foreground">Đã đặt trước</p>
        </div>
      </div>
    </div>
  );
}
