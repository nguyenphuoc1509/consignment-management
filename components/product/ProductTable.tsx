"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils";

interface ProductTableProps {
  products: Product[];
  onSelectDelete: (product: Product) => void;
}

function ProductCard({ product, onSelectDelete }: { product: Product; onSelectDelete: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
      <div className="flex items-start gap-3">
        {product.imageUrl ? (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
            <span className="text-muted-foreground text-xs">Không có ảnh</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-foreground truncate">{product.name}</p>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">{product.sku}</p>
          <p className="text-sm font-semibold text-foreground mt-1">{formatCurrency(product.price)}</p>
        </div>
      </div>

      {product.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
      )}

      <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
        <Button variant="ghost" size="icon-xs" title="Xem chi tiết" asChild>
          <Link href={`/dashboard/products/${product.id}`}>
            <Eye className="size-3" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon-xs" title="Chỉnh sửa" asChild>
          <Link href={`/dashboard/products/${product.id}?edit=true`}>
            <Edit2 className="size-3" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          title="Xóa"
          className="text-destructive hover:text-destructive"
          onClick={onSelectDelete}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}

export function ProductTable({ products, onSelectDelete }: ProductTableProps) {
  return (
    <>
      {/* Desktop table — hidden on mobile & tablet */}
      <div className="hidden md:block rounded-xl border border-border bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                  Không tìm thấy sản phẩm nào.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.imageUrl ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
                        <span className="text-muted-foreground text-[8px]">N/A</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm text-foreground">
                        {product.name}
                      </span>
                      {product.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                          {product.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category ?? "—"}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Xem chi tiết"
                        asChild
                      >
                        <Link href={`/dashboard/products/${product.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Chỉnh sửa"
                        asChild
                      >
                        <Link href={`/dashboard/products/${product.id}?edit=true`}>
                          <Edit2 className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Xóa"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onSelectDelete(product)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile & tablet cards — hidden on desktop */}
      <div className="flex flex-col gap-3 md:hidden">
        {products.length === 0 ? (
          <div className="rounded-xl border border-border bg-white dark:bg-zinc-900 px-4 py-12 text-center text-sm text-muted-foreground">
            Không tìm thấy sản phẩm nào.
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectDelete={() => onSelectDelete(product)}
            />
          ))
        )}
      </div>
    </>
  );
}
