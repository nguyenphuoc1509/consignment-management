"use client";

import { ShoppingCart } from "lucide-react";
import { SaleStatus } from "@/types/sale";
import { formatCurrency } from "@/lib/utils";

interface SaleSummaryCardsProps {
  total: number;
  byStatus: Record<SaleStatus, number>;
  totalRevenue: number;
}

export function SaleSummaryCards({
  total,
  byStatus,
  totalRevenue,
}: SaleSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
          <ShoppingCart className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{total}</p>
          <p className="text-xs text-muted-foreground">Tổng giao dịch</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 sm:size-10">
          <ShoppingCart className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">
            {byStatus.COMPLETED}
          </p>
          <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
          <ShoppingCart className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-xs text-muted-foreground">Tổng doanh thu</p>
        </div>
      </div>
    </div>
  );
}
