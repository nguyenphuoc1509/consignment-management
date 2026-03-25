"use client";

import { DollarSign, Percent } from "lucide-react";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils";

interface ProductCommissionCardProps {
  product: Product;
}

export function ProductCommissionCard({ product }: ProductCommissionCardProps) {
  const commissionAmount = (product.price * product.commissionRate) / 100;

  return (
    <div className="rounded-xl border border-border bg-white px-4 py-5 dark:bg-zinc-900">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Thông tin hoa hồng
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-4 text-center">
          <DollarSign className="size-5 text-muted-foreground" />
          <p className="text-sm font-bold text-foreground">
            {formatCurrency(product.price)}
          </p>
          <p className="text-xs text-muted-foreground">Giá bán</p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-4 text-center">
          <Percent className="size-5 text-muted-foreground" />
          <p className="text-sm font-bold text-primary">
            {product.commissionRate}%
          </p>
          <p className="text-xs text-muted-foreground">Tỷ lệ hoa hồng</p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-4 text-center">
          <DollarSign className="size-5 text-primary" />
          <p className="text-sm font-bold text-primary">
            {formatCurrency(commissionAmount)}
          </p>
          <p className="text-xs text-muted-foreground">Tiền hoa hồng</p>
        </div>
      </div>
    </div>
  );
}
