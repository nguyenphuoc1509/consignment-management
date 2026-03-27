"use client";

import Link from "next/link";
import { Eye, Edit2, Trash2 } from "lucide-react";
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
import { ConsignmentWithItems, ConsignmentStatus } from "@/types/consignment";
import { Consignor } from "@/types/consignor";
import { Store } from "@/types/store";

const STATUS_CONFIG: Record<ConsignmentStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  DRAFT: { label: "Nháp", variant: "secondary" },
  SHIPPED: { label: "Đã gửi", variant: "default" },
  PARTIAL_SOLD: { label: "Bán một phần", variant: "outline" },
  COMPLETED: { label: "Hoàn thành", variant: "default" },
  RETURNED: { label: "Đã trả về", variant: "secondary" },
  SETTLED: { label: "Đã đối soát", variant: "secondary" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
};

interface ConsignmentTableProps {
  consignments: ConsignmentWithItems[];
  consignors: Consignor[];
  stores: Store[];
  onDelete: (consignment: ConsignmentWithItems) => void;
}

function ConsignmentCard({
  consignment,
  consignorName,
  storeName,
  onDelete,
}: {
  consignment: ConsignmentWithItems;
  consignorName: string;
  storeName: string;
  onDelete: () => void;
}) {
  const statusCfg = STATUS_CONFIG[consignment.status];
  const totalSent = consignment.items.reduce((s, i) => s + i.quantitySent, 0);
  const totalSold = consignment.items.reduce((s, i) => s + i.quantitySold, 0);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-semibold text-foreground">
            {consignment.code}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {consignorName}
          </p>
          <p className="text-xs text-muted-foreground">{storeName}</p>
        </div>
        <Badge variant={statusCfg.variant} className="shrink-0 text-xs">
          {statusCfg.label}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center border-t border-border pt-3">
        <div>
          <p className="text-sm font-bold text-foreground">
            {consignment.items.length}
          </p>
          <p className="text-xs text-muted-foreground">SP</p>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{totalSent}</p>
          <p className="text-xs text-muted-foreground">Đã gửi</p>
        </div>
        <div>
          <p className="text-sm font-bold text-green-600">{totalSold}</p>
          <p className="text-xs text-muted-foreground">Đã bán</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon-xs" title="Xem chi tiết" asChild>
          <Link href={`/dashboard/consignments/${consignment.id}`}>
            <Eye className="size-3" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon-xs" title="Chỉnh sửa" asChild>
          <Link href={`/dashboard/consignments/${consignment.id}?edit=true`}>
            <Edit2 className="size-3" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          title={consignment.status === "DRAFT" ? "Xóa" : "Chỉ có thể xóa lô ở trạng thái Nháp"}
          className={consignment.status === "DRAFT" ? "text-destructive hover:text-destructive" : "text-muted-foreground cursor-not-allowed"}
          disabled={consignment.status !== "DRAFT"}
          onClick={onDelete}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}

export function ConsignmentTable({
  consignments,
  consignors,
  stores,
  onDelete,
}: ConsignmentTableProps) {
  function getConsignorName(id: string) {
    return consignors.find((c) => c.id === id)?.name ?? id;
  }
  function getStoreName(id: string) {
    return stores.find((s) => s.id === id)?.name ?? id;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-border bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã lô</TableHead>
              <TableHead>Bên giao hàng</TableHead>
              <TableHead>Cửa hàng nhận</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead className="text-center">SP</TableHead>
              <TableHead className="text-center">SL gửi</TableHead>
              <TableHead className="text-center">SL bán</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consignments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  Không tìm thấy lô ký gửi nào.
                </TableCell>
              </TableRow>
            ) : (
              consignments.map((c) => {
                const totalSent = c.items.reduce((s, i) => s + i.quantitySent, 0);
                const totalSold = c.items.reduce((s, i) => s + i.quantitySold, 0);
                const statusCfg = STATUS_CONFIG[c.status];
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {c.code}
                    </TableCell>
                    <TableCell className="text-xs max-w-[160px] truncate">
                      {getConsignorName(c.consignorId)}
                    </TableCell>
                    <TableCell className="text-xs max-w-[140px] truncate">
                      {getStoreName(c.storeId)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(c.sentDate).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">
                      {c.items.length}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">
                      {totalSent}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium text-green-600">
                      {totalSold}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={statusCfg.variant}>
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" title="Xem chi tiết" asChild>
                          <Link href={`/dashboard/consignments/${c.id}`}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" title="Chỉnh sửa" asChild>
                          <Link href={`/dashboard/consignments/${c.id}?edit=true`}>
                            <Edit2 className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title={c.status === "DRAFT" ? "Xóa" : "Chỉ có thể xóa lô ở trạng thái Nháp"}
                          className={c.status === "DRAFT" ? "text-destructive hover:text-destructive" : "text-muted-foreground cursor-not-allowed"}
                          disabled={c.status !== "DRAFT"}
                          onClick={() => onDelete(c)}
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
        {consignments.length === 0 ? (
          <div className="rounded-xl border border-border bg-white dark:bg-zinc-900 px-4 py-12 text-center text-sm text-muted-foreground">
            Không tìm thấy lô ký gửi nào.
          </div>
        ) : (
          consignments.map((c) => (
            <ConsignmentCard
              key={c.id}
              consignment={c}
              consignorName={getConsignorName(c.consignorId)}
              storeName={getStoreName(c.storeId)}
              onDelete={() => onDelete(c)}
            />
          ))
        )}
      </div>
    </>
  );
}
