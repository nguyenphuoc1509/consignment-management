"use client";

import Link from "next/link";
import { ArrowLeft, Edit2, Trash2, CheckCircle, Clock, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettlementWithDetails, SettlementStatus } from "@/types/settlement";
import { formatCurrency } from "@/lib/utils";

const STATUS_CONFIG: Record<SettlementStatus, { label: string; variant: "default" | "secondary" | "destructive"; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "Chờ xác nhận", variant: "secondary", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", variant: "default", icon: CheckCircle },
  PAID: { label: "Đã thanh toán", variant: "default", icon: Banknote },
};

interface SettlementDetailHeaderProps {
  settlement: SettlementWithDetails;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onMarkPaid: () => void;
}

export function SettlementDetailHeader({
  settlement,
  isEditing,
  onEdit,
  onCancelEdit,
  onDelete,
  onMarkPaid,
}: SettlementDetailHeaderProps) {
  const statusCfg = STATUS_CONFIG[settlement.status];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/dashboard/settlements">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold font-mono text-foreground sm:text-xl truncate max-w-[280px] sm:max-w-none">
              {settlement.code}
            </h2>
            <Badge variant={statusCfg.variant} className="gap-1">
              <StatusIcon className="size-3" />
              {statusCfg.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {formatCurrency(settlement.totalPayableAmount)} —{" "}
            {new Date(settlement.settledAt).toLocaleDateString("vi-VN")}
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
            {settlement.status !== "PAID" && (
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700"
                onClick={onMarkPaid}
              >
                <Banknote className="size-4" />
                <span className="hidden sm:inline">Đánh dấu đã TT</span>
                <span className="sm:hidden">Đã TT</span>
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
