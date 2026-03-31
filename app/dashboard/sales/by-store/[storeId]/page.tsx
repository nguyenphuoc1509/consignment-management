"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Package,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  SaleTable,
} from "@/components/sale";
import { useSales } from "@/hooks/useSales";
import { api } from "@/lib/api/client";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { saleCountsTowardRevenue } from "@/types/sale";

interface StoreInfo {
  id: string;
  name: string;
  code: string;
  address?: string;
  totalConsignments: number;
  totalAvailable: number;
  consignments: {
    id: string;
    code: string;
    status: string;
    sentDate: string;
    consignorName: string;
    items: {
      id: string;
      productId: string;
      productName: string;
      productSku: string;
      price: number;
      quantitySent: number;
      quantitySold: number;
      quantityReturned: number;
      quantityDamaged: number;
      available: number;
    }[];
  }[];
}

const consignmentStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  SHIPPED: { label: "Đang bán", variant: "default" },
  PARTIAL_SOLD: { label: "Bán 1 phần", variant: "secondary" },
  COMPLETED: { label: "Hoàn tất", variant: "outline" },
};

export default function StoreRevenueDetailPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);

  const {
    filtered: allStoreSales,
    deleteSale,
    cancelSale,
    refetch: refetchSales,
  } = useSales();

  const storeSales = allStoreSales.filter((s) => s.storeId === storeId);

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeError, setStoreError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setStoreLoading(true);
        const data = await api.get<{
          storeId: string;
          storeName: string;
          storeCode: string;
          consignments: {
            consignmentId: string;
            consignmentCode: string;
            status: string;
            sentDate: string;
            consignorName: string;
            items: {
              consignmentItemId: string;
              productId: string;
              productName: string;
              productSku: string;
              price?: number;
              quantitySent: number;
              quantitySold: number;
              quantityReturned: number;
              quantityDamaged: number;
              available: number;
            }[];
          }[];
        }>(`/api/stores/${storeId}/reconciliation`);
        const consignments: StoreInfo["consignments"] = data.consignments.map((c) => ({
          id: c.consignmentId,
          code: c.consignmentCode,
          status: c.status,
          sentDate: c.sentDate,
          consignorName: c.consignorName,
          items: c.items.map((i) => ({
            id: i.consignmentItemId,
            productId: i.productId,
            productName: i.productName,
            productSku: i.productSku,
            price: Number.isFinite(Number(i.price)) ? Number(i.price) : 0,
            quantitySent: i.quantitySent,
            quantitySold: i.quantitySold,
            quantityReturned: i.quantityReturned,
            quantityDamaged: i.quantityDamaged,
            available: i.available,
          })),
        }));
        setStoreInfo({
          id: data.storeId,
          name: data.storeName,
          code: data.storeCode,
          totalConsignments: consignments.length,
          totalAvailable: consignments.reduce((s, c) => s + c.items.reduce((a, i) => a + i.available, 0), 0),
          consignments,
        });
      } catch (err) {
        setStoreError(err instanceof Error ? err.message : "Lỗi khi tải cửa hàng");
      } finally {
        setStoreLoading(false);
      }
    }
    load();
  }, [storeId]);

  const totalRevenue = storeSales
    .filter((s) => saleCountsTowardRevenue(s.status))
    .reduce((sum, s) => sum + s.quantity * Number(s.soldPrice), 0);

  const tabsInstanceKey = storeInfo
    ? `${storeId}:ready:${storeInfo.consignments.map((c) => c.id).join("|")}`
    : `${storeId}:pending`;

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/sales">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-0.5">
            {storeLoading ? (
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
            ) : (
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                {storeInfo?.name ?? "Cửa hàng"}
              </h2>
            )}
            <p className="text-xs text-muted-foreground sm:text-sm">
              Lịch sử giao dịch và tồn kho của cửa hàng
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {storeInfo && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/sales/add?storeId=${storeId}`}>
                <ShoppingCart className="size-4 mr-2" />
                Ghi nhận bán hàng
              </Link>
            </Button>
          )}
        </div>
      </div>

      {storeError && !storeLoading && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {storeError}
        </div>
      )}

      {/* Summary Cards */}
      {!storeLoading && storeInfo && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <div className="rounded-xl border bg-white dark:bg-zinc-900 p-4 text-center">
            <Building2 className="size-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{storeInfo.code}</p>
            <p className="text-xs text-muted-foreground">Mã cửa hàng</p>
          </div>
          <div className="rounded-xl border bg-white dark:bg-zinc-900 p-4 text-center">
            <Package className="size-5 mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold">{storeInfo.totalConsignments}</p>
            <p className="text-xs text-muted-foreground">Lô ký gửi</p>
          </div>
          <div className="rounded-xl border bg-white dark:bg-zinc-900 p-4 text-center">
            <Package className="size-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold">{storeSales.length}</p>
            <p className="text-xs text-muted-foreground">Giao dịch</p>
          </div>
          <div className="rounded-xl border bg-white dark:bg-zinc-900 p-4 text-center">
            <Package className="size-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">Doanh thu</p>
          </div>
          <div className="rounded-xl border bg-white dark:bg-zinc-900 p-4 text-center">
            <Package className="size-5 mx-auto mb-1 text-amber-600" />
            <p className="text-2xl font-bold">{storeInfo.totalAvailable}</p>
            <p className="text-xs text-muted-foreground">SP tồn kho</p>
          </div>
        </div>
      )}

      {/* Tabs — key remounts when consignment list loads so triggers/values stay in sync */}
      <Tabs key={tabsInstanceKey} defaultValue="all" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TabsList className="flex flex-wrap h-auto min-h-9 py-1">
            <TabsTrigger value="all" className="shrink-0">
              <Package className="size-3.5 mr-1.5 shrink-0" />
              Tất cả ({storeSales.length})
            </TabsTrigger>
            {(storeInfo?.consignments ?? []).map((c) => {
              const salesCount = storeSales.filter((s) => s.consignmentId === c.id).length;
              const label = c.code?.trim() || c.id.slice(0, 8);
              return (
                <TabsTrigger key={c.id} value={c.id} className="shrink-0 max-w-[200px]">
                  <Package className="size-3.5 mr-1.5 shrink-0" />
                  <span className="truncate">{label}</span>
                  <span className="shrink-0">({salesCount})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab: Tất cả giao dịch */}
        <TabsContent value="all">
          {storeSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed rounded-xl">
              <Package className="size-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">
                Chưa có giao dịch nào cho cửa hàng này.
              </p>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/sales/add?storeId=${storeId}`}>
                  <ShoppingCart className="size-4 mr-2" />
                  Ghi nhận bán hàng đầu tiên
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <SaleTable
                sales={storeSales}
                onDelete={deleteSale}
                onCancel={(s) => cancelSale(s.id)}
              />
              <p className="text-xs text-muted-foreground text-right">
                Hiển thị {storeSales.length} giao dịch
              </p>
            </>
          )}
        </TabsContent>

        {/* Tabs: Giao dịch theo từng lô ký gửi */}
        {(storeInfo?.consignments ?? []).map((c) => {
          const cfg = consignmentStatusConfig[c.status] ?? {
            label: c.status,
            variant: "outline" as const,
          };
          const consignmentSales = storeSales.filter((s) => s.consignmentId === c.id);
          return (
            <TabsContent key={c.id} value={c.id}>
              {/* Lô ký gửi info header */}
              <div className="rounded-xl border mb-4">
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{c.code}</span>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      · {c.consignorName} · Gửi {formatDate(c.sentDate)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Tồn: {c.items.reduce((s, i) => s + i.available, 0)}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className="text-right">Giá</TableHead>
                        <TableHead className="text-right">Đã gửi</TableHead>
                        <TableHead className="text-right">Đã bán</TableHead>
                        <TableHead className="text-right">Trả về</TableHead>
                        <TableHead className="text-right">Hư hỏng</TableHead>
                        <TableHead className="text-right">Còn tồn</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {c.items.map((item) => (
                        <TableRow key={`${c.id}-${item.id}`}>
                          <TableCell>
                            <p className="font-medium text-sm">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">{item.productSku}</p>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {formatCurrency(Number.isFinite(item.price) ? item.price : 0)}
                          </TableCell>
                          <TableCell className="text-right">{item.quantitySent}</TableCell>
                          <TableCell className="text-right text-green-600">
                            {item.quantitySold}
                          </TableCell>
                          <TableCell className="text-right text-blue-600">
                            {item.quantityReturned}
                          </TableCell>
                          <TableCell className="text-right text-red-500">
                            {item.quantityDamaged}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-medium",
                              item.available === 0
                                ? "text-muted-foreground"
                                : "text-amber-600"
                            )}
                          >
                            {item.available}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Sales for this consignment */}
              <div className="rounded-xl border bg-white dark:bg-zinc-900 p-5">
                <h3 className="text-sm font-semibold mb-3">
                  Giao dịch của lô {c.code}
                </h3>
                {consignmentSales.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Chưa có giao dịch nào cho lô này.
                  </p>
                ) : (
                  <>
                    <SaleTable
                      sales={consignmentSales}
                      onDelete={deleteSale}
                      onCancel={(s) => cancelSale(s.id)}
                    />
                    <p className="text-xs text-muted-foreground text-right mt-2">
                      Hiển thị {consignmentSales.length} giao dịch
                    </p>
                  </>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
