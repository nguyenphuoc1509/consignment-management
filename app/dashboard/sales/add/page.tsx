"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaleForm } from "@/components/sale";
import { useSales } from "@/hooks/useSales";

export default function AddSalePage() {
  const router = useRouter();
  const {
    addSale,
    stores,
    consignments,
    products,
    getAvailableQuantity,
  } = useSales();

  function handleSubmit(data: Parameters<typeof addSale>[0]) {
    const result = addSale(data as Parameters<typeof addSale>[0]);
    if (!result) {
      alert("Không thể tạo giao dịch. Vui lòng kiểm tra lại thông tin.");
      return;
    }
    router.push("/dashboard/sales");
  }

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
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Ghi nhận bán hàng
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Chọn lô ký gửi, sản phẩm và nhập số lượng bán.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
        <SaleForm
          stores={stores}
          consignments={consignments}
          products={products}
          getAvailableQuantity={getAvailableQuantity}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
