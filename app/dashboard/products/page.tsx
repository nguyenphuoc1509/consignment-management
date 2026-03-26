"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ProductSummaryCards,
  ProductFilters,
  ProductTable,
} from "@/components/product";
import { DeleteDialog } from "@/components/deleteDialog/DeleteDialog";
import { SuccessDialog, FailDialog } from "@/components/dialog";
import { Product } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";

export default function ProductsPage() {
  const {
    filtered,
    filters,
    counts,
    deleteProduct,
  } = useProducts();

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [failOpen, setFailOpen] = useState(false);
  const [failMessage, setFailMessage] = useState("");

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget);
      setDeleteTarget(null);
    } catch (err) {
      setFailMessage(err instanceof Error ? err.message : "Xóa sản phẩm thất bại.");
      setFailOpen(true);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Sản phẩm</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý thông tin sản phẩm ký gửi.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto shrink-0">
          <Link href="/dashboard/products/add">
            <Plus className="size-4" />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <ProductSummaryCards total={counts.total} />

      {/* Filters */}
      <ProductFilters
        search={filters.search}
        categoryFilter={filters.categoryFilter}
        onSearchChange={filters.setSearch}
        onCategoryChange={filters.setCategoryFilter}
      />

      {/* Table / Card list */}
      <ProductTable
        products={filtered}
        onSelectDelete={setDeleteTarget}
      />

      {/* Delete dialog */}
      <DeleteDialog
        target={deleteTarget}
        itemLabel="sản phẩm"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <FailDialog
        open={failOpen}
        title="Xóa thất bại"
        message={failMessage}
        onClose={() => setFailOpen(false)}
      />

      {/* Results summary */}
      <p className="text-xs text-muted-foreground text-right">
        Hiển thị {filtered.length} / {counts.total} sản phẩm
      </p>
    </div>
  );
}
