"use client";

import Link from "next/link";
import { ArrowLeft, Edit2, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SaleWithDetails, SaleStatus } from "@/types/sale";
import { formatCurrency } from "@/lib/utils";

const STATUS_CONFIG: Record<SaleStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  COMPLETED: { label: "Hoàn thành", variant: "default" },
  CANCELLED: { label: "Đã hủy", variant: "secondary" },
};

interface SaleDetailHeaderProps {
  sale: SaleWithDetails;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function SaleDetailHeader({
  sale,
  isEditing,
  onEdit,
  onCancelEdit,
  onDelete,
  onCancel,
}: SaleDetailHeaderProps) {
  const statusCfg = STATUS_CONFIG[sale.status];
  const grossAmount = sale.quantity * sale.soldPrice;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/dashboard/sales">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold font-mono text-foreground sm:text-xl truncate max-w-[280px] sm:max-w-none">
              {sale.id}
            </h2>
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {formatCurrency(grossAmount)} —{" "}
            {new Date(sale.soldAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-11 sm:pl-0 sm:shrink-0">
        {isEditing ? (
          <Button variant="outline" size="sm" onClick={onCancelEdit}>
            Hủy chỉnh sửa
          </Button>
        ) : (
          <>
            {sale.status === "COMPLETED" && (
              <Button
                variant="outline"
                size="sm"
                className="text-orange-500 hover:text-orange-600"
                onClick={onCancel}
              >
                <Ban className="size-4" />
                <span className="hidden sm:inline">Hủy GD</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="size-4" />
              <span className="hidden sm:inline">Chỉnh sửa</span>
              <span className="sm:hidden">Sửa</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">Xóa</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
