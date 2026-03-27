"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WarehouseForm } from "@/components/warehouse";
import { useConsignors } from "@/hooks/useConsignors";
import { useWarehouses } from "@/hooks/useWarehouses";
import { api } from "@/lib/api/client";

export default function AddWarehousePage() {
  const router = useRouter();
  const { consignors } = useConsignors();
  const { fetchWarehouses } = useWarehouses();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: {
    consignorId: string;
    code: string;
    name: string;
    address?: string;
    contactPerson?: string;
    phone?: string;
    note?: string;
  }) {
    setLoading(true);
    try {
      await api.post("/api/warehouses", data);
      await fetchWarehouses();
      router.push("/dashboard/warehouses");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi tạo kho");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/warehouses">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Tạo kho dự trữ mới
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Thêm kho nội bộ để quản lý hàng nhập từ kho sản xuất.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
        <WarehouseForm
          consignors={consignors}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
