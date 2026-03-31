"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export interface StoreSalesRow {
  id: string;
  name: string;
  code: string;
  address?: string;
  totalConsignments: number;
  totalAvailable: number;
}

interface SalesData {
  revenue: number;
  count: number;
  lastDate: string | null;
}

function StoreSalesCard({
  store,
  salesData,
}: {
  store: StoreSalesRow;
  salesData: SalesData | undefined;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-foreground truncate">{store.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{store.code}</p>
        </div>
        <Button size="sm" variant="outline" asChild className="shrink-0">
          <Link href={`/dashboard/sales/by-store/${store.id}`}>
            Chi tiết
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center border-t border-border pt-3">
        <div>
          <p className="text-sm font-bold">{store.totalConsignments}</p>
          <p className="text-xs text-muted-foreground">Lô ký gửi</p>
        </div>
        <div>
          <p className={cn("text-sm font-bold", store.totalAvailable === 0 ? "text-muted-foreground" : "text-amber-600")}>
            {store.totalAvailable}
          </p>
          <p className="text-xs text-muted-foreground">Tồn kho</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Giao dịch</span>
        <span className="font-semibold">{salesData?.count ?? 0}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Doanh thu</span>
        <span className="font-semibold text-green-600">{formatCurrency(salesData?.revenue ?? 0)}</span>
      </div>
    </div>
  );
}

interface StoreSalesTableProps {
  stores: StoreSalesRow[];
  storeSalesMap?: Map<string, SalesData>;
}

export function StoreSalesTable({ stores, storeSalesMap }: StoreSalesTableProps) {
  return (
    <>
      <div className="hidden md:block rounded-xl border border-border bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã CH</TableHead>
              <TableHead>Cửa hàng</TableHead>
              <TableHead className="text-center">Lô ký gửi</TableHead>
              <TableHead className="text-center">Tồn kho</TableHead>
              <TableHead className="text-center">Giao dịch</TableHead>
              <TableHead className="text-right">Doanh thu</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  Không có cửa hàng nào có lô ký gửi.
                </TableCell>
              </TableRow>
            ) : (
              stores.map((s) => {
                const salesData = storeSalesMap?.get(s.id);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs font-medium">{s.code}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{s.name}</span>
                        {s.address && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {s.address}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">{s.totalConsignments}</TableCell>
                    <TableCell
                      className={cn(
                        "text-center text-sm font-medium",
                        s.totalAvailable === 0 ? "text-muted-foreground" : "text-amber-600"
                      )}
                    >
                      {s.totalAvailable}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {salesData?.count ?? 0}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-green-600">
                      {formatCurrency(salesData?.revenue ?? 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon-sm" title="Xem lịch sử giao dịch" asChild>
                        <Link href={`/dashboard/sales/by-store/${s.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {stores.length === 0 ? (
          <div className="rounded-xl border border-border bg-white dark:bg-zinc-900 px-4 py-12 text-center text-sm text-muted-foreground">
            Không có cửa hàng nào có lô ký gửi.
          </div>
        ) : (
          stores.map((s) => (
            <StoreSalesCard
              key={s.id}
              store={s}
              salesData={storeSalesMap?.get(s.id)}
            />
          ))
        )}
      </div>
    </>
  );
}
