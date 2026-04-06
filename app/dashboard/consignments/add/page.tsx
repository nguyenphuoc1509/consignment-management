"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsignmentForm } from "@/components/consignment";
import { useConsignments } from "@/hooks/useConsignments";
import {
  ConsignmentItem,
  ConsignmentWithItems,
  ConsignmentCreatePayload,
} from "@/types/consignment";

export default function AddConsignmentPage() {
  const router = useRouter();
  const { addConsignment, consignors, stores } = useConsignments();

  function handleSubmit(
    data: ConsignmentCreatePayload,
    items: Omit<ConsignmentItem, "id" | "consignmentId">[]
  ) {
    addConsignment(data, items);
    router.push("/dashboard/consignments");
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/consignments">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Tạo lô ký gửi mới
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Chọn bên giao hàng, cửa hàng và thêm sản phẩm vào lô.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
        <ConsignmentForm
          consignors={consignors}
          stores={stores}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
