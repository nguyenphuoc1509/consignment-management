"use client";

import { Package } from "lucide-react";

interface ProductSummaryCardsProps {
  total: number;
  active: number;
  inactive: number;
}

export function ProductSummaryCards({ total, active, inactive }: ProductSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
          <Package className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{total}</p>
          <p className="text-xs text-muted-foreground">Tổng sản phẩm</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 sm:size-10">
          <Package className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{active}</p>
          <p className="text-xs text-muted-foreground">Đang hoạt động</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900 sm:col-span-1">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:size-10">
          <Package className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{inactive}</p>
          <p className="text-xs text-muted-foreground">Tạm ngưng</p>
        </div>
      </div>
    </div>
  );
}
