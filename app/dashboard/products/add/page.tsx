"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/product/ProductForm";
import { useConsignors } from "@/hooks/useConsignors";

export default function AddProductPage() {
  const { consignors } = useConsignors();

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xl font-bold text-foreground">Thêm sản phẩm mới</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Điền thông tin bên dưới để thêm sản phẩm ký gửi.
            </p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-border bg-white p-6 dark:bg-zinc-900">
        <ProductForm
          consignors={consignors.map((c) => ({ id: c.id, companyName: c.companyName }))}
        />
      </div>
    </div>
  );
}
