"use client";

import Link from "next/link";
import { Eye, Edit2, Trash2, Ban } from "lucide-react";
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
import { SaleWithDetails, SaleStatus } from "@/types/sale";
import { formatCurrency } from "@/lib/utils";

const STATUS_CONFIG: Record<SaleStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  COMPLETED: { label: "Hoàn thành", variant: "default" },
  CANCELLED: { label: "Đã hủy", variant: "secondary" },
};

interface SaleTableProps {
  sales: SaleWithDetails[];
  onDelete: (sale: SaleWithDetails) => void;
  onCancel: (sale: SaleWithDetails) => void;
}

function SaleCard({
  sale,
  onDelete,
  onCancel,
}: {
  sale: SaleWithDetails;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const statusCfg = STATUS_CONFIG[sale.status];
  const grossAmount = sale.quantity * sale.soldPrice;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-semibold text-foreground">
            {sale.id}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {sale.productName}
          </p>
          <p className="text-xs text-muted-foreground">{sale.storeName}</p>
        </div>
        <Badge variant={statusCfg.variant} className="shrink-0 text-xs">
          {statusCfg.label}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center border-t border-border pt-3">
        <div>
          <p className="text-sm font-bold text-foreground">{sale.quantity}</p>
          <p className="text-xs text-muted-foreground">SL</p>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">
            {formatCurrency(sale.soldPrice)}
          </p>
          <p className="text-xs text-muted-foreground">Đơn giá</p>
        </div>
        <div>
          <p className="text-sm font-bold text-green-600">
            {formatCurrency(grossAmount)}
          </p>
          <p className="text-xs text-muted-foreground">Tổng</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon-xs" title="Xem chi tiết" asChild>
          <Link href={`/dashboard/sales/${sale.id}`}>
            <Eye className="size-3" />
          </Link>
        </Button>
        {sale.status === "COMPLETED" && (
          <Button
            variant="ghost"
            size="icon-xs"
            title="Hủy giao dịch"
            className="text-orange-500 hover:text-orange-600"
            onClick={onCancel}
          >
            <Ban className="size-3" />
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

export function SaleTable({ sales, onDelete, onCancel }: SaleTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-border bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã GD</TableHead>
              <TableHead>Lô ký gửi</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Cửa hàng</TableHead>
              <TableHead className="text-center">SL</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead className="text-right">Tổng cộng</TableHead>
              <TableHead>Ngày bán</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  Không tìm thấy giao dịch nào.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((s) => {
                const grossAmount = s.quantity * s.soldPrice;
                const statusCfg = STATUS_CONFIG[s.status];
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {s.id}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.consignmentCode}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {s.productName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {s.productSku}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs max-w-[120px] truncate">
                      {s.storeName}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">
                      {s.quantity}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(s.soldPrice)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-green-600">
                      {formatCurrency(grossAmount)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(s.soldAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" title="Xem chi tiết" asChild>
                          <Link href={`/dashboard/sales/${s.id}`}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        {s.status === "COMPLETED" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Hủy giao dịch"
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => onCancel(s)}
                          >
                            <Ban className="size-4" />
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
        {sales.length === 0 ? (
          <div className="rounded-xl border border-border bg-white dark:bg-zinc-900 px-4 py-12 text-center text-sm text-muted-foreground">
            Không tìm thấy giao dịch nào.
          </div>
        ) : (
          sales.map((s) => (
            <SaleCard
              key={s.id}
              sale={s}
              onDelete={() => onDelete(s)}
              onCancel={() => onCancel(s)}
            />
          ))
        )}
      </div>
    </>
  );
}
