"use client";

import { Package } from "lucide-react";

interface ProductSummaryCardsProps {
  total: number;
}

export function ProductSummaryCards({ total }: ProductSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-1">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
          <Package className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{total}</p>
          <p className="text-xs text-muted-foreground">Tổng sản phẩm</p>
        </div>
      </div>
    </div>
  );
}
