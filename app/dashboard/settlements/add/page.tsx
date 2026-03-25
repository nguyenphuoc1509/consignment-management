"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettlementForm } from "@/components/settlement";
import { useSettlements } from "@/hooks/useSettlements";

export default function AddSettlementPage() {
  const router = useRouter();
  const {
    addSettlement,
    stores,
    consignors,
    consignments,
    salesByConsignment,
  } = useSettlements();

  function handleSubmit(data: Parameters<typeof addSettlement>[0]) {
    const result = addSettlement(data);
    if (!result) {
      alert("Không thể tạo đối soát. Vui lòng kiểm tra lại thông tin.");
      return;
    }
    router.push("/dashboard/settlements");
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/settlements">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Tạo đối soát
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Chọn lô ký gửi và nhập số liệu tài chính để tạo đối soát.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
        <SettlementForm
          stores={stores}
          consignors={consignors}
          consignments={consignments}
          salesByConsignment={salesByConsignment}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
