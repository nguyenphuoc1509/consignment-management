"use client";

import { useEffect } from "react";
import { Package, AlertTriangle, RotateCcw, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { StoreInventoryReconciliation } from "@/types/revenueReport";

interface ReconciliationViewProps {
  data: StoreInventoryReconciliation | null;
  loading?: boolean;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  SHIPPED: { label: "Đang bán", variant: "default" },
  PARTIAL_SOLD: { label: "Bán 1 phần", variant: "secondary" },
  COMPLETED: { label: "Hoàn tất", variant: "outline" },
};

export function ReconciliationView({ data, loading }: ReconciliationViewProps) {
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-muted-foreground">Đang tải dữ liệu đối soát...</div>
      </div>
    );
  }

  const hasDiscrepancies = data.consignments.some((c) =>
    c.items.some((i) => i.discrepancy !== 0)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Grand totals */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card>
          <CardContent className="pt-4 text-center">
            <Package className="size-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{data.grandTotals.totalSent}</p>
            <p className="text-xs text-muted-foreground">Tổng gửi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="size-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{data.grandTotals.totalSold}</p>
            <p className="text-xs text-muted-foreground">Đã bán</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <RotateCcw className="size-5 mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{data.grandTotals.totalReturned}</p>
            <p className="text-xs text-muted-foreground">Trả về</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <AlertTriangle className="size-5 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold text-red-500">{data.grandTotals.totalDamaged}</p>
            <p className="text-xs text-muted-foreground">Hư hỏng</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-4 text-center">
            <Package className="size-5 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold text-amber-600">{data.grandTotals.totalAvailable}</p>
            <p className="text-xs text-muted-foreground">Còn tồn</p>
          </CardContent>
        </Card>
      </div>

      {/* Warning if discrepancies exist */}
      {hasDiscrepancies && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4">
          <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
              Phát hiện chênh lệch số lượng
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              Một số sản phẩm có số lượng tồn kho không khớp với báo cáo. Kiểm tra chi tiết bên dưới.
            </p>
          </div>
        </div>
      )}

      {/* Per-consignment tables */}
      {data.consignments.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
          Cửa hàng này chưa có lô ký gửi nào.
        </div>
      ) : (
        data.consignments.map((c) => {
          const cfg = statusConfig[c.status] ?? { label: c.status, variant: "outline" as const };
          const hasDiscrepancy = c.items.some((i) => i.discrepancy !== 0);
          return (
            <Card key={c.consignmentId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{c.consignmentCode}</CardTitle>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    {hasDiscrepancy && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="size-3" /> Chênh lệch
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{c.consignorName}</span>
                    <span>·</span>
                    <span>Gửi: {formatDate(c.sentDate)}</span>
                    <span>·</span>
                    <span>Tồn: {c.totalAvailable}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className="text-right">Đã gửi</TableHead>
                        <TableHead className="text-right">Đã bán</TableHead>
                        <TableHead className="text-right">Trả về</TableHead>
                        <TableHead className="text-right">Hư hỏng</TableHead>
                        <TableHead className="text-right">Còn tồn</TableHead>
                        <TableHead className="text-right">BC bán</TableHead>
                        <TableHead className="text-right">Chênh lệch</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {c.items.map((item) => {
                        const isDiscrepant = item.discrepancy !== 0;
                        return (
                          <TableRow
                            key={item.consignmentItemId}
                            className={cn(isDiscrepant && "bg-amber-50/50 dark:bg-amber-950/10")}
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{item.productName}</p>
                                <p className="text-xs text-muted-foreground">{item.productSku}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{item.quantitySent}</TableCell>
                            <TableCell className="text-right text-green-600">{item.quantitySold}</TableCell>
                            <TableCell className="text-right text-blue-600">{item.quantityReturned}</TableCell>
                            <TableCell className="text-right text-red-500">{item.quantityDamaged}</TableCell>
                            <TableCell className={cn(
                              "text-right font-medium",
                              item.available === 0 ? "text-muted-foreground" : "text-amber-600"
                            )}>
                              {item.available}
                            </TableCell>
                            <TableCell className="text-right">{item.soldViaReport}</TableCell>
                            <TableCell className={cn(
                              "text-right font-medium",
                              isDiscrepant ? "text-red-600" : "text-muted-foreground"
                            )}>
                              {isDiscrepant ? (
                                <span className="flex items-center justify-end gap-1">
                                  <AlertTriangle className="size-3" />
                                  {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                                </span>
                              ) : (
                                "0"
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Row totals */}
                <div className="flex items-center justify-end gap-6 px-4 py-2 border-t bg-muted/30 text-xs font-medium">
                  <span className="text-muted-foreground">Tổng lô:</span>
                  <span>{c.totalSent}</span>
                  <span className="text-green-600">Đã bán: {c.totalSold}</span>
                  <span className="text-blue-600">Trả: {c.totalReturned}</span>
                  <span className="text-red-500">Hỏng: {c.totalDamaged}</span>
                  <span className="text-amber-600">Tồn: {c.totalAvailable}</span>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
