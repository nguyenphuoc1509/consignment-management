"use client";

import Link from "next/link";
import { Eye, Trash2, CheckCircle, Clock, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SettlementWithDetails, SettlementStatus } from "@/types/settlement";
import { formatCurrency } from "@/lib/utils";

const STATUS_CONFIG: Record<SettlementStatus, { label: string; variant: "default" | "secondary" | "destructive"; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "Chờ xác nhận", variant: "secondary", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", variant: "default", icon: CheckCircle },
  PAID: { label: "Đã thanh toán", variant: "default", icon: Banknote },
};

interface SettlementTableProps {
  settlements: SettlementWithDetails[];
  onDelete: (settlement: SettlementWithDetails) => void;
  onMarkPaid: (settlement: SettlementWithDetails) => void;
}

function SettlementCard({
  settlement,
  onDelete,
  onMarkPaid,
}: {
  settlement: SettlementWithDetails;
  onDelete: () => void;
  onMarkPaid: () => void;
}) {
  const statusCfg = STATUS_CONFIG[settlement.status];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-semibold text-foreground">
            {settlement.code}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {settlement.consignorName}
          </p>
          <p className="text-xs text-muted-foreground">{settlement.storeName}</p>
        </div>
        <Badge variant={statusCfg.variant} className="shrink-0 text-xs gap-1">
          <StatusIcon className="size-3" />
          {statusCfg.label}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center border-t border-border pt-3">
        <div>
          <p className="text-sm font-bold text-foreground">
            {settlement.saleCount}
          </p>
          <p className="text-xs text-muted-foreground">Giao dịch</p>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">
            {formatCurrency(settlement.totalSalesAmount)}
          </p>
          <p className="text-xs text-muted-foreground">Doanh số</p>
        </div>
        <div>
          <p className="text-sm font-bold text-green-600">
            {formatCurrency(settlement.totalPayableAmount)}
          </p>
          <p className="text-xs text-muted-foreground">Phải trả</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon-xs" title="Xem chi tiết" asChild>
          <Link href={`/dashboard/settlements/${settlement.id}`}>
            <Eye className="size-3" />
          </Link>
        </Button>
        {settlement.status !== "PAID" && (
          <Button
            variant="ghost"
            size="icon-xs"
            title="Đánh dấu đã thanh toán"
            className="text-green-600 hover:text-green-700"
            onClick={onMarkPaid}
          >
            <Banknote className="size-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          title="Xóa"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}

export function SettlementTable({
  settlements,
  onDelete,
  onMarkPaid,
}: SettlementTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-border bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đối soát</TableHead>
              <TableHead>Lô ký gửi</TableHead>
              <TableHead>Bên giao</TableHead>
              <TableHead>Cửa hàng</TableHead>
              <TableHead className="text-center">SL GD</TableHead>
              <TableHead className="text-right">Doanh số</TableHead>
              <TableHead className="text-right">Hoa hồng</TableHead>
              <TableHead className="text-right">Phải trả</TableHead>
              <TableHead>Ngày đối soát</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settlements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  Không tìm thấy đối soát nào.
                </TableCell>
              </TableRow>
            ) : (
              settlements.map((s) => {
                const statusCfg = STATUS_CONFIG[s.status];
                const StatusIcon = statusCfg.icon;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {s.code}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.consignmentCode}
                    </TableCell>
                    <TableCell className="text-xs max-w-[140px] truncate">
                      {s.consignorName}
                    </TableCell>
                    <TableCell className="text-xs max-w-[120px] truncate">
                      {s.storeName}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">
                      {s.saleCount}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(s.totalSalesAmount)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatCurrency(s.totalCommissionAmount)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-green-600">
                      {formatCurrency(s.totalPayableAmount)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(s.settledAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={statusCfg.variant} className="gap-1">
                        <StatusIcon className="size-3" />
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Xem chi tiết"
                          asChild
                        >
                          <Link href={`/dashboard/settlements/${s.id}`}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        {s.status !== "PAID" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Đánh dấu đã thanh toán"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => onMarkPaid(s)}
                          >
                            <Banknote className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Xóa"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDelete(s)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {settlements.length === 0 ? (
          <div className="rounded-xl border border-border bg-white dark:bg-zinc-900 px-4 py-12 text-center text-sm text-muted-foreground">
            Không tìm thấy đối soát nào.
          </div>
        ) : (
          settlements.map((s) => (
            <SettlementCard
              key={s.id}
              settlement={s}
              onDelete={() => onDelete(s)}
              onMarkPaid={() => onMarkPaid(s)}
            />
          ))
        )}
      </div>
    </>
  );
}
