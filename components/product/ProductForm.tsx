"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface ProductFormProps {
  product?: Product;
  categories?: string[];
  onSubmit?: (data: Partial<Product>) => void;
  isLoading?: boolean;
}

const CATEGORIES = PRODUCT_CATEGORIES;

export function ProductForm({
  product,
  categories = CATEGORIES,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    category: product?.category ?? "",
    price: product?.price ?? "",
    description: product?.description ?? "",
    imageUrl: product?.imageUrl ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Tên sản phẩm là bắt buộc.";
    if (!form.sku.trim()) next.sku = "SKU là bắt buộc.";
    if (!form.category) next.category = "Danh mục là bắt buộc.";
    const price = Number(form.price);
    if (isNaN(price) || price <= 0) next.price = "Giá phải lớn hơn 0.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: Partial<Product> = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category,
      price: Number(form.price),
      description: form.description.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
    };

    onSubmit?.(payload);
  }

  function field(
    key: keyof typeof form,
    label: string,
    node: React.ReactNode,
    hint?: string
  ) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={key} className="text-sm font-medium">
          {label}
        </Label>
        {node}
        {hint && !errors[key] && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
        {errors[key] && (
          <p className="text-xs text-destructive">{errors[key]}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Row 1 */}
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "name",
          "Tên sản phẩm",
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ví dụ: Áo sơ mi nam trắng"
            className={cn(errors.name && "border-destructive")}
          />
        )}
        {field(
          "sku",
          "SKU",
          <Input
            id="sku"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            placeholder="Ví dụ: ASM-001"
            className={cn(errors.sku && "border-destructive")}
          />
        )}
      </div>

      {/* Row 2 */}
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "category",
          "Danh mục",
          <Select
            value={form.category}
            onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
          >
            <SelectTrigger id="category" className={cn(errors.category && "border-destructive")}>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Giá bán */}
      {field(
        "price",
        "Giá bán (VND)",
        <Input
          id="price"
          type="number"
          min="0"
          step="1000"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="Ví dụ: 299000"
          className={cn(errors.price && "border-destructive")}
        />,
        "Giá bán của sản phẩm tại cửa hàng."
      )}

      {/* Image upload */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium">Hình ảnh sản phẩm</Label>
        <ImageUpload
          value={form.imageUrl}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url ?? "" }))}
          maxWidth="full"
        />
        <p className="text-xs text-muted-foreground">
          Tải lên hình ảnh sản phẩm (tùy chọn).
        </p>
      </div>

      {/* Description */}
      {field(
        "description",
        "Mô tả sản phẩm",
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Mô tả chi tiết về sản phẩm..."
          rows={3}
        />,
        "Mô tả ngắn gọn về sản phẩm (tùy chọn)."
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Đang lưu..."
            : isEditing
            ? "Lưu thay đổi"
            : "Tạo sản phẩm"}
        </Button>
      </div>
    </form>
  );
}
