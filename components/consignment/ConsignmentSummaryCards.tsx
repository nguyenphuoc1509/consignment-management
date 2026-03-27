"use client";

import { ArrowLeftRight } from "lucide-react";
import { ConsignmentStatus } from "@/types/consignment";

interface ConsignmentSummaryCardsProps {
  total: number;
  byStatus: Record<ConsignmentStatus, number>;
}

const STATUS_LABELS: Record<ConsignmentStatus, string> = {
  DRAFT: "Nháp",
  SHIPPED: "Đã gửi",
  PARTIAL_SOLD: "Bán một phần",
  COMPLETED: "Hoàn thành",
  RETURNED: "Đã trả về",
  SETTLED: "Đã đối soát",
  CANCELLED: "Đã hủy",
};

export function ConsignmentSummaryCards({
  total,
  byStatus,
}: ConsignmentSummaryCardsProps) {
  const active =
    byStatus.DRAFT + byStatus.SHIPPED + byStatus.PARTIAL_SOLD;

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
          <ArrowLeftRight className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{total}</p>
          <p className="text-xs text-muted-foreground">Tổng lô ký gửi</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 sm:size-10">
          <ArrowLeftRight className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{active}</p>
          <p className="text-xs text-muted-foreground">Đang xử lý</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 sm:size-10">
          <ArrowLeftRight className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">
            {byStatus.COMPLETED + byStatus.PARTIAL_SOLD}
          </p>
          <p className="text-xs text-muted-foreground">Đã bán (toàn/thành phần)</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:size-10">
          <ArrowLeftRight className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground sm:text-2xl">
            {byStatus.SETTLED}
          </p>
          <p className="text-xs text-muted-foreground">Đã đối soát</p>
        </div>
      </div>
    </div>
  );
}
