"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface ProductFormProps {
  product?: Product;
  consignors: { id: string; companyName: string }[];
  categories?: string[];
  onSubmit?: (data: Partial<Product>) => void;
  isLoading?: boolean;
}

const CATEGORIES = PRODUCT_CATEGORIES;

export function ProductForm({
  product,
  consignors,
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
    commissionRate: product?.commissionRate ?? "",
    consignorId: product?.consignorId ?? "",
    description: product?.description ?? "",
    imageUrl: product?.imageUrl ?? "",
    status: product?.status ?? "ACTIVE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Tên sản phẩm là bắt buộc.";
    if (!form.sku.trim()) next.sku = "SKU là bắt buộc.";
    if (!form.category) next.category = "Danh mục là bắt buộc.";
    if (!form.consignorId) next.consignorId = "Bên giao hàng là bắt buộc.";
    const price = Number(form.price);
    if (isNaN(price) || price <= 0) next.price = "Giá phải lớn hơn 0.";
    const rate = Number(form.commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100)
      next.commissionRate = "Tỷ lệ hoa hồng phải từ 0 đến 100.";
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
      commissionRate: Number(form.commissionRate),
      consignorId: form.consignorId,
      description: form.description.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      status: form.status,
    };

    if (onSubmit) {
      onSubmit(payload);
    } else {
      alert(
        isEditing
          ? `Cập nhật sản phẩm thành công!\n\n${JSON.stringify(payload, null, 2)}`
          : `Tạo sản phẩm thành công!\n\n${JSON.stringify(payload, null, 2)}`
      );
      router.push("/dashboard/products");
    }
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
        {field(
          "consignorId",
          "Bên giao hàng",
          <Select
            value={form.consignorId}
            onValueChange={(v) => setForm((f) => ({ ...f, consignorId: v }))}
          >
            <SelectTrigger id="consignorId" className={cn(errors.consignorId && "border-destructive")}>
              <SelectValue placeholder="Chọn bên giao hàng" />
            </SelectTrigger>
            <SelectContent>
              {consignors.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Chưa có bên giao hàng.{" "}
                  <Link
                    href="/dashboard/consignors"
                    className="text-primary underline"
                  >
                    Thêm mới
                  </Link>
                </div>
              ) : (
                consignors.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.companyName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Row 3 */}
      <div className="grid gap-5 sm:grid-cols-2">
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
        {field(
          "commissionRate",
          "Tỷ lệ hoa hồng (%)",
          <Input
            id="commissionRate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.commissionRate}
            onChange={(e) =>
              setForm((f) => ({ ...f, commissionRate: e.target.value }))
            }
            placeholder="Ví dụ: 20"
            className={cn(errors.commissionRate && "border-destructive")}
          />,
          "Phần trăm hoa hồng trả cho bên giao hàng (0 - 100)."
        )}
      </div>

      {/* Row 4 */}
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "imageUrl",
          "URL hình ảnh",
          <Input
            id="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            placeholder="https://example.com/image.jpg"
          />,
          "Liên kết đến hình ảnh sản phẩm (tùy chọn)."
        )}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Trạng thái</Label>
          <div className="flex items-center gap-3 h-10 rounded-md border border-input px-3 bg-background">
            <span
              className={cn(
                "text-sm",
                form.status === "ACTIVE"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              Đang hoạt động
            </span>
            <Switch
              checked={form.status === "ACTIVE"}
              onCheckedChange={(checked) =>
                setForm((f) => ({
                  ...f,
                  status: checked ? "ACTIVE" : "INACTIVE",
                }))
              }
            />
            <span
              className={cn(
                "text-sm",
                form.status === "INACTIVE"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              Tạm ngưng
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Sản phẩm ngừng hoạt động sẽ không hiển thị khi tạo ký gửi.
          </p>
        </div>
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
