"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsignorForm } from "@/components/consignor";
import { useConsignors } from "@/hooks/useConsignors";
import { Consignor } from "@/types/consignor";

export default function AddConsignorPage() {
  const router = useRouter();
  const { addConsignor } = useConsignors();

  function handleSubmit(data: Partial<Consignor>) {
    addConsignor(data as Omit<Consignor, "id" | "createdAt" | "updatedAt">);
    router.push("/dashboard/consignors");
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/consignors">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Thêm kho sản xuất
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Tạo kho sản xuất để cung cấp hàng cho các kho dự trữ.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
        <ConsignorForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
