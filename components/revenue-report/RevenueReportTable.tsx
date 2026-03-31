"use client";

import Link from "next/link";
import { Eye, Trash2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Nháp", variant: "secondary" },
  CONFIRMED: { label: "Đã xác nhận", variant: "default" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
};

interface RevenueReportTableProps {
  reports: Array<{
    id: string;
    code: string;
    storeId: string;
    storeName: string;
    reportDate: string;
    note?: string;
    status: string;
    totalAmount: number;
    totalQuantity: number;
    createdByName?: string;
    createdAt: string;
  }>;
  onDelete?: (id: string) => void;
  onShowAudit?: (id: string) => void;
  isDeleting?: boolean;
}

export function RevenueReportTable({
  reports,
  onDelete,
  onShowAudit,
  isDeleting,
}: RevenueReportTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã báo cáo</TableHead>
              <TableHead>Cửa hàng</TableHead>
              <TableHead>Ngày báo cáo</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Doanh thu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Người tạo</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Chưa có báo cáo doanh thu nào.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((r) => {
                const cfg = statusConfig[r.status] ?? { label: r.status, variant: "outline" as const };
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.code}</TableCell>
                    <TableCell>{r.storeName}</TableCell>
                    <TableCell>{formatDate(r.reportDate)}</TableCell>
                    <TableCell className="text-right">{r.totalQuantity}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(r.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell>{r.createdByName ?? "—"}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon-sm" asChild title="Xem chi tiết">
                          <Link href={`/dashboard/sales/revenue-reports/${r.id}`}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        {onShowAudit && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onShowAudit(r.id)}
                            title="Lịch sử thay đổi"
                          >
                            <History className="size-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDelete(r.id)}
                            disabled={isDeleting}
                            title="Xóa"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {reports.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border rounded-lg">
            Chưa có báo cáo doanh thu nào.
          </div>
        ) : (
          reports.map((r) => {
            const cfg = statusConfig[r.status] ?? { label: r.status, variant: "outline" as const };
            return (
              <div key={r.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{r.code}</p>
                    <p className="text-xs text-muted-foreground">{r.storeName}</p>
                  </div>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Ngày báo cáo</p>
                    <p className="font-medium">{formatDate(r.reportDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Số lượng</p>
                    <p className="font-medium">{r.totalQuantity}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Doanh thu</p>
                    <p className="font-semibold text-green-600">{formatCurrency(r.totalAmount)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/dashboard/sales/revenue-reports/${r.id}`}>Xem chi tiết</Link>
                  </Button>
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(r.id)}
                      disabled={isDeleting}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
