"use client";

import { Badge } from "@/components/ui/badge";
import { SaleWithDetails, SaleStatus } from "@/types/sale";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  Building2,
  Store as StoreIcon,
  Calendar,
  Package,
  ReceiptText,
} from "lucide-react";

const STATUS_CONFIG: Record<SaleStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  COMPLETED: { label: "Hoàn thành", variant: "default" },
  CANCELLED: { label: "Đã hủy", variant: "secondary" },
};

interface SaleDetailViewProps {
  sale: SaleWithDetails;
}

export function SaleDetailView({ sale }: SaleDetailViewProps) {
  const statusCfg = STATUS_CONFIG[sale.status];
  const grossAmount = sale.quantity * sale.soldPrice;
  const commissionRate = 0; // Will be populated from product when available
  const storeCommission = Math.round(grossAmount * commissionRate);
  const consignorPayable = grossAmount - storeCommission;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white px-4 py-5 text-center dark:bg-zinc-900">
          <p className="text-xs text-muted-foreground">Số lượng</p>
          <p className="text-2xl font-bold text-foreground">{sale.quantity}</p>
          <p className="text-xs text-muted-foreground">đơn vị</p>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white px-4 py-5 text-center dark:bg-zinc-900">
          <p className="text-xs text-muted-foreground">Đơn giá</p>
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(sale.soldPrice)}
          </p>
          <p className="text-xs text-muted-foreground">VNĐ / sản phẩm</p>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white px-4 py-5 text-center dark:bg-zinc-900">
          <p className="text-xs text-muted-foreground">Thành tiền</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(grossAmount)}
          </p>
          <p className="text-xs text-muted-foreground">Doanh thu giao dịch</p>
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
            <div className="flex flex-col gap-0.5">
              <p className="font-mono text-sm font-semibold text-foreground">
                {sale.consignmentCode}
              </p>
              <p className="text-xs text-muted-foreground">
                Bên giao: {sale.consignorName}
              </p>
            </div>
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Sản phẩm
            </h3>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium text-sm text-foreground">
              {sale.productName}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              SKU: {sale.productSku}
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
          <p className="text-sm text-foreground">{sale.storeName}</p>
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
              {new Date(sale.soldAt).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              Tạo:{" "}
              {new Date(sale.createdAt).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {sale.notes && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">Ghi chú</h3>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-foreground">{sale.notes}</p>
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
