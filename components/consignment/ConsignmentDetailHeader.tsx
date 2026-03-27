"use client";

import Link from "next/link";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsignmentWithItems, ConsignmentStatus } from "@/types/consignment";

const STATUS_CONFIG: Record<ConsignmentStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  DRAFT: { label: "Nháp", variant: "secondary" },
  SHIPPED: { label: "Đã gửi", variant: "default" },
  PARTIAL_SOLD: { label: "Bán một phần", variant: "outline" },
  COMPLETED: { label: "Hoàn thành", variant: "default" },
  RETURNED: { label: "Đã trả về", variant: "secondary" },
  SETTLED: { label: "Đã đối soát", variant: "secondary" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
};

interface ConsignmentDetailHeaderProps {
  consignment: ConsignmentWithItems;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

export function ConsignmentDetailHeader({
  consignment,
  isEditing,
  onEdit,
  onCancelEdit,
  onDelete,
}: ConsignmentDetailHeaderProps) {
  const statusCfg = STATUS_CONFIG[consignment.status];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/dashboard/consignments">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-foreground sm:text-xl truncate max-w-[280px] sm:max-w-none font-mono">
              {consignment.code}
            </h2>
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Ngày gửi:{" "}
            {new Date(consignment.sentDate).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
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
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="size-4" />
              <span className="hidden sm:inline">Chỉnh sửa</span>
              <span className="sm:hidden">Sửa</span>
            </Button>
            {consignment.status === "DRAFT" ? (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="size-4" />
                <span className="hidden sm:inline">Xóa</span>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled title="Chỉ có thể xóa lô ở trạng thái Nháp">
                <Trash2 className="size-4" />
                <span className="hidden sm:inline">Xóa</span>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
