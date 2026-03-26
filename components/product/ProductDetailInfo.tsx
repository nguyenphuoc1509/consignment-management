"use client";

import Image from "next/image";
import {
  Hash,
  Tag,
  DollarSign,
  FileText,
  ImageIcon,
  Calendar,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground leading-tight">
          {value ?? "—"}
        </span>
      </div>
    </div>
  );
}

interface ProductDetailInfoProps {
  product: Product;
}

export function ProductDetailInfo({ product }: ProductDetailInfoProps) {
  return (
    <>
      {/* Image + info in one card */}
      <div className="grid gap-4 sm:grid-cols-5 sm:items-stretch">
        {/* Product image */}
        <div className="flex min-h-0 flex-col sm:col-span-2 sm:h-full">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-white dark:bg-zinc-900">
            <div className="relative aspect-square w-full min-h-[200px] sm:min-h-0 sm:flex-1 sm:aspect-auto">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-2 bg-muted/30 text-muted-foreground">
                  <ImageIcon className="size-10" />
                  <span className="text-xs">Không có hình ảnh</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="sm:col-span-3 rounded-xl border border-border bg-white px-2 dark:bg-zinc-900 sm:px-0">
          <InfoRow icon={Hash} label="SKU" value={product.sku} />
          <div className="mx-4 border-t border-border" />
          <InfoRow
            icon={Tag}
            label="Danh mục"
            value={<Badge variant="secondary">{product.category ?? "—"}</Badge>}
          />
          <div className="mx-4 border-t border-border" />
          <InfoRow
            icon={DollarSign}
            label="Giá bán"
            value={
              <span className="text-primary font-semibold">
                {formatCurrency(product.price)}
              </span>
            }
          />
          <div className="mx-4 border-t border-border" />
          <InfoRow
            icon={Calendar}
            label="Ngày tạo"
            value={formatDate(product.createdAt)}
          />
          <div className="mx-4 border-t border-border" />
          <InfoRow
            icon={Clock}
            label="Cập nhật cuối"
            value={formatDate(product.updatedAt)}
          />
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="rounded-xl border border-border bg-white px-4 py-4 dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Mô tả sản phẩm
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>
      )}
    </>
  );
}
