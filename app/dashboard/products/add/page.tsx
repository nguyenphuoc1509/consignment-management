"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/product/ProductForm";
import { SuccessDialog, FailDialog } from "@/components/dialog";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/product";

export default function AddProductPage() {
  const { addProduct } = useProducts();

  const [successOpen, setSuccessOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const [failMessage, setFailMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: Partial<Product>) {
    setIsLoading(true);
    try {
      await addProduct(data as Omit<Product, "id" | "createdAt" | "updatedAt">);
      setSuccessOpen(true);
    } catch (err) {
      setFailMessage(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.");
      setFailOpen(true);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSuccessClose() {
    setSuccessOpen(false);
    window.location.href = "/dashboard/products";
  }

  return (
    <>
      <div className="flex flex-col gap-5 max-w-3xl mx-auto">
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
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>

      <SuccessDialog
        open={successOpen}
        title="Tạo sản phẩm thành công"
        message="Sản phẩm mới đã được thêm vào hệ thống."
        onClose={handleSuccessClose}
      />

      <FailDialog
        open={failOpen}
        title="Tạo sản phẩm thất bại"
        message={failMessage}
        onClose={() => setFailOpen(false)}
      />
    </>
  );
}
