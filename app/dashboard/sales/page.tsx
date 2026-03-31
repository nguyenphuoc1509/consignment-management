"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, ListOrdered, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoreSalesTable } from "@/components/sale";
import { useStoreRevenue } from "@/hooks/useRevenueReports";
import { useSales } from "@/hooks/useSales";
import { formatCurrency } from "@/lib/utils";
import { saleCountsTowardRevenue } from "@/types/sale";

export default function SalesPage() {
  const { stores, filtered, loading, error, search, setSearch, refetch } = useStoreRevenue();
  const { filtered: allSales } = useSales();

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Compute sales-based revenue and transaction count per store
  const storeSalesMap = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number; lastDate: string | null }>();
    for (const s of allSales) {
      if (!saleCountsTowardRevenue(s.status)) continue;
      const existing = map.get(s.storeId) ?? { revenue: 0, count: 0, lastDate: null };
      existing.revenue += s.quantity * s.soldPrice;
      existing.count += 1;
      if (!existing.lastDate || s.soldAt > existing.lastDate) {
        existing.lastDate = s.soldAt;
      }
      map.set(s.storeId, existing);
    }
    return map;
  }, [allSales]);

  const totals = useMemo(() => {
    let consignments = 0;
    let revenue = 0;
    for (const s of filtered) {
      consignments += s.totalConsignments;
      const salesData = storeSalesMap.get(s.id);
      revenue += salesData?.revenue ?? 0;
    }
    return { consignments, revenue };
  }, [filtered, storeSalesMap]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Bán hàng theo cửa hàng</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Chọn cửa hàng có lô ký gửi để xem lịch sử giao dịch.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button className="w-full sm:w-auto shrink-0" variant="outline" asChild>
            <Link href="/dashboard/sales/transactions">
              <ListOrdered className="size-4" />
              Lịch sử giao dịch
            </Link>
          </Button>
          <Button className="w-full sm:w-auto shrink-0" asChild>
            <Link href="/dashboard/sales/add">
              <Plus className="size-4" />
              Ghi nhận bán hàng
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
            <Building2 className="size-4 sm:size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-foreground sm:text-2xl">{filtered.length}</p>
            <p className="text-xs text-muted-foreground">Cửa hàng có ký gửi</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 sm:size-10">
            <Building2 className="size-4 sm:size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-foreground sm:text-2xl">{totals.consignments}</p>
            <p className="text-xs text-muted-foreground">Tổng lô (đang lọc)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-zinc-900">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 sm:size-10">
            <Building2 className="size-4 sm:size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-foreground sm:text-2xl truncate">
              {formatCurrency(totals.revenue)}
            </p>
            <p className="text-xs text-muted-foreground">Tổng doanh thu</p>
          </div>
        </div>
      </div>

      <Input
        placeholder="Tìm kiếm cửa hàng..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Đang tải...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-destructive text-sm">{error}</p>
          <Button variant="outline" onClick={refetch}>Thử lại</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed rounded-xl">
          <p className="text-muted-foreground text-sm">Không có cửa hàng nào được ký gửi hàng hóa.</p>
          <Button variant="outline" asChild>
            <Link href="/dashboard/consignments/add">Tạo lô ký gửi mới</Link>
          </Button>
        </div>
      ) : (
        <StoreSalesTable stores={filtered} storeSalesMap={storeSalesMap} />
      )}

      <p className="text-xs text-muted-foreground text-right">
        Hiển thị {filtered.length} / {stores.length} cửa hàng
      </p>
    </div>
  );
}
