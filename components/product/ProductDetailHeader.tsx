"use client";

import Link from "next/link";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";

interface ProductDetailHeaderProps {
  product: Product;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

export function ProductDetailHeader({
  product,
  isEditing,
  onEdit,
  onCancelEdit,
  onDelete,
}: ProductDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 w-full">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-foreground sm:text-xl truncate max-w-[280px] sm:max-w-none">
              {product.name}
            </h2>
            <Badge
              variant={product.status === "ACTIVE" ? "default" : "secondary"}
            >
              {product.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Mã: {product.sku}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-11 sm:pl-0 sm:shrink-0">
        {isEditing ? (
          <Button variant="outline" size="sm" onClick={onCancelEdit}>
            Hủy chỉnh sửa
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="size-4" />
              <span className="hidden sm:inline">Chỉnh sửa</span>
              <span className="sm:hidden">Sửa</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">Xóa</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
