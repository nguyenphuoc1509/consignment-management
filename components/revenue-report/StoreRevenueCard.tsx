"use client";

import Link from "next/link";
import { Building2, Phone, MapPin, ArrowRight, Package, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface StoreRevenueCardProps {
  store: {
    id: string;
    name: string;
    code: string;
    address?: string;
    phone?: string;
    totalConsignments: number;
    totalSent: number;
    totalSold: number;
    totalReturned: number;
    totalDamaged: number;
    totalAvailable: number;
    totalRevenue: number;
    totalQuantityReported: number;
    lastReportDate?: string;
    lastReportStatus?: string;
    lastReportCode?: string;
  };
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Nháp", variant: "secondary" },
  CONFIRMED: { label: "Đã xác nhận", variant: "default" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
};

export function StoreRevenueCard({ store }: StoreRevenueCardProps) {
  const lastStatusCfg = store.lastReportStatus
    ? statusConfig[store.lastReportStatus] ?? { label: store.lastReportStatus, variant: "outline" as const }
    : null;

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{store.name}</h3>
              <p className="text-xs text-muted-foreground">{store.code}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild className="shrink-0">
            <Link href={`/dashboard/sales/by-store/${store.id}`}>
              Xem chi tiết <ArrowRight className="size-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {store.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{store.address}</span>
          </div>
        )}
        {store.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-3 shrink-0" />
            <span>{store.phone}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-md bg-muted/50 p-2 text-center">
            <p className="text-xs text-muted-foreground">Lô ký gửi</p>
            <p className="font-semibold text-sm">{store.totalConsignments}</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2 text-center">
            <p className="text-xs text-muted-foreground">SP đã gửi</p>
            <p className="font-semibold text-sm">{store.totalSent}</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2 text-center">
            <p className="text-xs text-muted-foreground">Còn tồn</p>
            <p className={cn("font-semibold text-sm", store.totalAvailable === 0 ? "text-muted-foreground" : "text-amber-600")}>
              {store.totalAvailable}
            </p>
          </div>
          <div className="rounded-md bg-muted/50 p-2 text-center">
            <p className="text-xs text-muted-foreground">Đã báo cáo</p>
            <p className="font-semibold text-sm">{store.totalQuantityReported}</p>
          </div>
        </div>

        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-green-600" />
              <span className="text-xs text-muted-foreground">Doanh thu báo cáo</span>
            </div>
            <span className="font-semibold text-sm text-green-600">
              {formatCurrency(store.totalRevenue)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">BC gần nhất</span>
            <div className="flex items-center gap-2">
              {lastStatusCfg ? (
                <Badge variant={lastStatusCfg.variant} className="text-xs">
                  {lastStatusCfg.label}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Chưa có BC</Badge>
              )}
            </div>
          </div>
          {store.lastReportDate && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Ngày báo cáo</span>
              <span className="text-xs">{formatDate(store.lastReportDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
