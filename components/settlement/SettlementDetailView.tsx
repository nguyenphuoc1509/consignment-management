"use client";

import { Badge } from "@/components/ui/badge";
import { SettlementWithDetails, SettlementStatus } from "@/types/settlement";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Store as StoreIcon,
  Calendar,
  ReceiptText,
  Banknote,
} from "lucide-react";

const STATUS_CONFIG: Record<SettlementStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  PENDING: { label: "Chờ xác nhận", variant: "secondary" },
  CONFIRMED: { label: "Đã xác nhận", variant: "default" },
  PAID: { label: "Đã thanh toán", variant: "default" },
};

interface SettlementDetailViewProps {
  settlement: SettlementWithDetails;
}

export function SettlementDetailView({ settlement }: SettlementDetailViewProps) {
  const statusCfg = STATUS_CONFIG[settlement.status];

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white px-4 py-5 text-center dark:bg-zinc-900">
          <p className="text-xs text-muted-foreground">Doanh số</p>
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(settlement.totalSalesAmount)}
          </p>
          <p className="text-xs text-muted-foreground">VNĐ</p>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white px-4 py-5 text-center dark:bg-zinc-900">
          <p className="text-xs text-muted-foreground">Hoa hồng cửa hàng</p>
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(settlement.totalCommissionAmount)}
          </p>
          <p className="text-xs text-muted-foreground">VNĐ</p>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white px-4 py-5 text-center dark:bg-zinc-900">
          <p className="text-xs text-muted-foreground">Phải trả bên giao</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(settlement.totalPayableAmount)}
          </p>
          <p className="text-xs text-muted-foreground">Sau hoa hồng</p>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Consignment info */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Lô ký gửi
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-mono text-sm font-semibold text-foreground">
              {settlement.consignmentCode}
            </p>
            <p className="text-xs text-muted-foreground">
              Bên giao: {settlement.consignorName}
            </p>
          </div>
        </div>

        {/* Store info */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <StoreIcon className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Cửa hàng
            </h3>
          </div>
          <p className="text-sm text-foreground">{settlement.storeName}</p>
        </div>

        {/* Sale count */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Giao dịch
            </h3>
          </div>
          <p className="text-sm font-medium text-foreground">
            {settlement.saleCount} giao dịch
          </p>
        </div>

        {/* Date info */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Thời gian
            </h3>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-foreground">
              Đối soát:{" "}
              {new Date(settlement.settledAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              Tạo:{" "}
              {new Date(settlement.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {settlement.notes && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">Ghi chú</h3>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-foreground">{settlement.notes}</p>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Trạng thái:</span>
        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
      </div>
    </div>
  );
}
