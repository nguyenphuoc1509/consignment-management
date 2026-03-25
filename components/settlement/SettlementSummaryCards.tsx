"use client";

import { Receipt } from "lucide-react";
import { SettlementStatus } from "@/types/settlement";
import { formatCurrency } from "@/lib/utils";

interface SettlementSummaryCardsProps {
  total: number;
  byStatus: Record<SettlementStatus, number>;
  totalPayable: number;
}

export function SettlementSummaryCards({
  total,
  byStatus,
  totalPayable,
}: SettlementSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
          <Receipt className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{total}</p>
          <p className="text-xs text-muted-foreground">Tổng đối soát</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 sm:size-10">
          <Receipt className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">
            {byStatus.PENDING}
          </p>
          <p className="text-xs text-muted-foreground">Chờ xác nhận</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
          <Receipt className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-green-600 sm:text-2xl">
            {formatCurrency(totalPayable)}
          </p>
          <p className="text-xs text-muted-foreground">Tổng phải trả</p>
        </div>
      </div>
    </div>
  );
}
