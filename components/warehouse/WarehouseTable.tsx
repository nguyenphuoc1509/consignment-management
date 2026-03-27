// components/warehouse/WarehouseTable.tsx
"use client";

import Link from "next/link";
import { Eye, Edit2, Trash2, Warehouse as WarehouseIcon } from "lucide-react";
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
import { Warehouse } from "@/types/warehouse";
import { formatCurrency } from "@/lib/utils";

interface WarehouseWithInventory extends Warehouse {
  inventory?: {
    quantity: number;
    reserved: number;
    product: { id: string; sku: string; name: string; price: number; category?: string };
  }[];
  consignor?: { id: string; name: string; code: string; phone?: string; email?: string };
}

interface WarehouseTableProps {
  warehouses: WarehouseWithInventory[];
  onDelete: (warehouse: WarehouseWithInventory) => void;
}

function WarehouseCard({
  warehouse,
  onDelete,
}: {
  warehouse: WarehouseWithInventory;
  onDelete: () => void;
}) {
  const totalStock = warehouse.inventory?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const totalValue =
    warehouse.inventory?.reduce((s, i) => s + i.quantity * Number(i.product.price), 0) ?? 0;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/warehouses/${warehouse.id}`}
            className="font-semibold text-sm text-foreground truncate hover:underline block"
          >
            {warehouse.name}
          </Link>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            {warehouse.code}
          </p>
        </div>
        <Badge
          variant={warehouse.status === "ACTIVE" ? "default" : "secondary"}
          className="shrink-0 text-xs"
        >
          {warehouse.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
        </Badge>
      </div>

      {warehouse.consignor && (
        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          Kho cung cấp: <span className="text-foreground">{warehouse.consignor.name}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 text-center border-t border-border pt-3">
        <div>
          <p className="text-sm font-bold text-foreground">
            {warehouse.inventory?.length ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">SKU</p>
        </div>
        <div>
          <p className="text-sm font-bold text-green-600">{totalStock}</p>
          <p className="text-xs text-muted-foreground">Tồn kho</p>
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          Giá trị tồn:{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(totalValue)}
          </span>
        </p>
      </div>

      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon-xs" title="Quản lý tồn kho" asChild>
          <Link href={`/dashboard/warehouses/${warehouse.id}`}>
            <Eye className="size-3" />
          </Link>
        </Button>
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

export function WarehouseTable({ warehouses, onDelete }: WarehouseTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-border bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kho</TableHead>
              <TableHead>Mã kho</TableHead>
              <TableHead>Kho cung cấp</TableHead>
              <TableHead className="text-center">SKU</TableHead>
              <TableHead className="text-center">Tồn kho</TableHead>
              <TableHead className="text-right">Giá trị tồn</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
                  Chưa có kho nào. Thêm kho để bắt đầu quản lý.
                </TableCell>
              </TableRow>
            ) : (
              warehouses.map((w) => {
                const totalStock = w.inventory?.reduce((s, i) => s + i.quantity, 0) ?? 0;
                const totalValue =
                  w.inventory?.reduce((s, i) => s + i.quantity * Number(i.product.price), 0) ?? 0;
                return (
                  <TableRow key={w.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/warehouses/${w.id}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <WarehouseIcon className="size-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-sm">{w.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {w.code}
                    </TableCell>
                    <TableCell className="text-sm">
                      {w.consignor?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">
                      {w.inventory?.length ?? 0}
                    </TableCell>
                    <TableCell className="text-center text-sm font-bold text-green-600">
                      {totalStock}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(totalValue)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={w.status === "ACTIVE" ? "default" : "secondary"}>
                        {w.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Quản lý tồn kho"
                          asChild
                        >
                          <Link href={`/dashboard/warehouses/${w.id}`}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Xóa"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDelete(w)}
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
        {warehouses.length === 0 ? (
          <div className="rounded-xl border border-border bg-white dark:bg-zinc-900 px-4 py-12 text-center text-sm text-muted-foreground">
            Chưa có kho nào.
          </div>
        ) : (
          warehouses.map((w) => (
            <WarehouseCard key={w.id} warehouse={w} onDelete={() => onDelete(w)} />
          ))
        )}
      </div>
    </>
  );
}
