"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreForm } from "@/components/store";
import { useStores } from "@/hooks/useStores";
import { Store } from "@/types/store";

export default function AddStorePage() {
  const router = useRouter();
  const { addStore } = useStores();

  function handleSubmit(data: Partial<Store>) {
    addStore(data as Omit<Store, "id" | "createdAt" | "updatedAt">);
    router.push("/dashboard/stores");
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/stores">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Thêm cửa hàng
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Nhập thông tin cửa hàng mới.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
        <StoreForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
