"use client";

import Link from "next/link";
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
import { MOCK_CONSIGNORS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

function getConsignorName(id: string) {
  return MOCK_CONSIGNORS.find((c) => c.id === id)?.companyName ?? id;
}

interface ProductTableProps {
  products: Product[];
  onSelectDelete: (product: Product) => void;
}

function ProductCard({ product, onSelectDelete }: { product: Product; onSelectDelete: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-foreground truncate">{product.name}</p>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">{product.sku}</p>
        </div>
        <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"} className="shrink-0 text-xs">
          {product.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
        </Badge>
      </div>

      {product.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <div>
          <p className="text-xs text-muted-foreground">Danh mục</p>
          <Badge variant="secondary" className="mt-0.5 text-xs">{product.category}</Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Bên giao hàng</p>
          <p className="text-xs text-foreground mt-0.5 truncate">{getConsignorName(product.consignorId)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Giá</p>
          <p className="text-sm font-semibold text-foreground">{formatCurrency(product.price)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Hoa hồng</p>
          <p className="text-sm font-semibold text-primary">{product.commissionRate}%</p>
        </div>
      </div>

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
              <TableHead>Sản phẩm</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Bên giao hàng</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead className="text-center">Hoa hồng</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
                  Không tìm thấy sản phẩm nào.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
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
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs max-w-[150px] truncate">
                    {getConsignorName(product.consignorId)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium text-primary">
                      {product.commissionRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={product.status === "ACTIVE" ? "default" : "secondary"}
                    >
                      {product.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
                    </Badge>
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
