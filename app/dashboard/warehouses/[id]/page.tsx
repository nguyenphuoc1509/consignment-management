"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WarehouseInventoryTable } from "@/components/warehouse";
import { api } from "@/lib/api/client";
import { Warehouse } from "@/types/warehouse";

type WarehouseWithInventory = Warehouse & {
  inventory?: {
    id: string;
    productId: string;
    quantity: number;
    reserved: number;
    product: { id: string; sku: string; name: string; price: number };
  }[];
  consignor?: { id: string; name: string; code: string };
};

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [warehouse, setWarehouse] = useState<WarehouseWithInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  async function fetchWarehouse() {
    setLoading(true);
    try {
      const found = await api.get<WarehouseWithInventory>(`/api/warehouses/${id}`);
      setWarehouse(found);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchWarehouse();
  }, [id]);

  async function refetch() {
    if (!id) return;
    setLoading(true);
    try {
      const found = await api.get<WarehouseWithInventory>(`/api/warehouses/${id}`);
      setWarehouse(found);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col gap-5 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/warehouses">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="text-lg font-bold text-foreground">Không tìm thấy kho</h2>
        </div>
        <div className="rounded-xl border border-border bg-white dark:bg-zinc-900 p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Kho bạn đang tìm không tồn tại hoặc đã bị xóa.
          </p>
          <Button asChild>
            <Link href="/dashboard/warehouses">Quay lại danh sách kho</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !warehouse) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/warehouses">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                {warehouse.name}
              </h2>
              {warehouse.consignor && (
                <span className="text-xs text-muted-foreground border border-border rounded px-2 py-0.5">
                  {warehouse.consignor.name}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Nhập và quản lý tồn kho
            </p>
          </div>
        </div>
      </div>

      {/* Inventory management */}
      <div className="rounded-xl border border-border bg-white dark:bg-zinc-900 p-4">
        <WarehouseInventoryTable
          warehouseId={warehouse.id}
          warehouseName={warehouse.name}
          onInventoryChange={refetch}
        />
      </div>
    </div>
  );
}
