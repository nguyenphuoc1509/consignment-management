"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn, formatCurrency } from "@/lib/utils";
import { Sale, SaleStatus } from "@/types/sale";
import { ConsignmentWithItems, ConsignmentItem } from "@/types/consignment";
import { Store } from "@/types/store";
import { Product } from "@/types/product";

interface SaleFormProps {
  sale?: Sale;
  stores: Store[];
  consignments: ConsignmentWithItems[];
  products: Product[];
  getAvailableQuantity: (consignmentId: string, productId: string) => number;
  onSubmit?: (data: Omit<Sale, "id" | "createdAt" | "updatedAt">) => void;
  isLoading?: boolean;
}

export function SaleForm({
  sale,
  stores,
  consignments,
  products,
  getAvailableQuantity,
  onSubmit,
  isLoading = false,
}: SaleFormProps) {
  const router = useRouter();
  const isEditing = !!sale;

  const [form, setForm] = useState({
    consignmentId: sale?.consignmentId ?? "",
    productId: sale?.productId ?? "",
    storeId: sale?.storeId ?? "",
    quantity: sale?.quantity ?? 1,
    soldPrice: sale?.soldPrice ?? 0,
    soldAt: sale?.soldAt ? sale.soldAt.slice(0, 16) : "",
    status: sale?.status ?? "COMPLETED" as SaleStatus,
    notes: sale?.notes ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availQty, setAvailQty] = useState(0);

  // Auto-fill sold price when product is selected
  useEffect(() => {
    if (form.consignmentId && form.productId) {
      const product = products.find((p) => p.id === form.productId);
      if (product) {
        setForm((f) => ({ ...f, soldPrice: product.price }));
      }
      const qty = getAvailableQuantity(form.consignmentId, form.productId);
      setAvailQty(qty);
    }
  }, [form.consignmentId, form.productId]);

  // Products available in selected consignment
  const consignmentItems = consignments
    .find((c) => c.id === form.consignmentId)
    ?.items ?? [];

  // Filter consignments: only active ones sent to a store
  const activeConsignments = consignments.filter((c) =>
    ["SHIPPED", "PARTIAL_SOLD"].includes(c.status)
  );

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.consignmentId) next.consignmentId = "Lô ký gửi là bắt buộc.";
    if (!form.productId) next.productId = "Sản phẩm là bắt buộc.";
    if (!form.storeId) next.storeId = "Cửa hàng là bắt buộc.";
    if (!form.quantity || form.quantity < 1) next.quantity = "Số lượng phải lớn hơn 0.";
    else if (form.quantity > availQty) next.quantity = `Số lượng vượt quá tồn kho (${availQty} sản phẩm khả dụng).`;
    if (!form.soldPrice || form.soldPrice <= 0) next.soldPrice = "Giá bán phải lớn hơn 0.";
    if (!form.soldAt) next.soldAt = "Ngày bán là bắt buộc.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: Omit<Sale, "id" | "createdAt" | "updatedAt"> = {
      consignmentId: form.consignmentId,
      productId: form.productId,
      storeId: form.storeId,
      quantity: form.quantity,
      soldPrice: form.soldPrice,
      soldAt: new Date(form.soldAt).toISOString(),
      status: form.status,
      notes: form.notes.trim() || undefined,
    };

    if (onSubmit) {
      onSubmit(payload);
    } else {
      alert(
        isEditing
          ? `Cập nhật thành công!\n\n${JSON.stringify(payload, null, 2)}`
          : `Ghi nhận bán thành công!\n\n${JSON.stringify(payload, null, 2)}`
      );
      router.push("/dashboard/sales");
    }
  }

  const grossAmount = form.quantity * form.soldPrice;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Thông tin giao dịch */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Thông tin giao dịch
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="consignmentId" className="text-sm font-medium">
              Lô ký gửi <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.consignmentId}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, consignmentId: v, productId: "" }))
              }
            >
              <SelectTrigger
                id="consignmentId"
                className={cn(errors.consignmentId && "border-destructive")}
              >
                <SelectValue placeholder="Chọn lô ký gửi..." />
              </SelectTrigger>
              <SelectContent>
                {activeConsignments.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Không có lô ký gửi nào đang hoạt động.
                  </div>
                ) : (
                  activeConsignments.map((c) => {
                    const store = stores.find((s) => s.id === c.storeId);
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code} — {store?.name ?? c.storeId}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
            {errors.consignmentId && (
              <p className="text-xs text-destructive">{errors.consignmentId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="productId" className="text-sm font-medium">
              Sản phẩm <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.productId}
              onValueChange={(v) => setForm((f) => ({ ...f, productId: v }))}
              disabled={!form.consignmentId}
            >
              <SelectTrigger
                id="productId"
                className={cn(errors.productId && "border-destructive")}
              >
                <SelectValue placeholder="Chọn sản phẩm..." />
              </SelectTrigger>
              <SelectContent>
                {consignmentItems.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Không có sản phẩm trong lô này.
                  </div>
                ) : (
                  consignmentItems.map((item: ConsignmentItem) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <SelectItem key={item.productId} value={item.productId}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
            {errors.productId && (
              <p className="text-xs text-destructive">{errors.productId}</p>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="storeId" className="text-sm font-medium">
              Cửa hàng <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.storeId}
              onValueChange={(v) => setForm((f) => ({ ...f, storeId: v }))}
            >
              <SelectTrigger
                id="storeId"
                className={cn(errors.storeId && "border-destructive")}
              >
                <SelectValue placeholder="Chọn cửa hàng..." />
              </SelectTrigger>
              <SelectContent>
                {stores.filter((s) => s.status === "ACTIVE").map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.storeId && (
              <p className="text-xs text-destructive">{errors.storeId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="soldAt" className="text-sm font-medium">
              Ngày bán <span className="text-destructive">*</span>
            </Label>
            <Input
              id="soldAt"
              type="datetime-local"
              value={form.soldAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, soldAt: e.target.value }))
              }
              className={cn(errors.soldAt && "border-destructive")}
            />
            {errors.soldAt && (
              <p className="text-xs text-destructive">{errors.soldAt}</p>
            )}
          </div>
        </div>
      </div>

      {/* Số lượng & giá */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Số lượng & Giá bán
        </h3>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Số lượng bán <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={availQty || undefined}
              value={form.quantity}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
              }
              className={cn(errors.quantity && "border-destructive")}
            />
            {availQty > 0 && (
              <p className="text-xs text-muted-foreground">
                Còn {availQty} sản phẩm khả dụng.
              </p>
            )}
            {errors.quantity && (
              <p className="text-xs text-destructive">{errors.quantity}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="soldPrice" className="text-sm font-medium">
              Giá bán (VNĐ) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="soldPrice"
              type="number"
              min={0}
              step={1000}
              value={form.soldPrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, soldPrice: Number(e.target.value) }))
              }
              className={cn(errors.soldPrice && "border-destructive")}
            />
            {form.soldPrice > 0 && (
              <p className="text-xs text-muted-foreground">
                Giá mặc định: {formatCurrency(
                  products.find((p) => p.id === form.productId)?.price ?? 0
                )}
              </p>
            )}
            {errors.soldPrice && (
              <p className="text-xs text-destructive">{errors.soldPrice}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Thành tiền</Label>
            <div className="flex h-10 items-center rounded-md border border-border bg-muted/30 px-3">
              <span className="text-base font-bold text-green-600">
                {formatCurrency(grossAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trạng thái & ghi chú */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Bổ sung
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          {isEditing && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Trạng thái</Label>
              <div className="flex items-center gap-3 h-10 rounded-md border border-input px-3 bg-background">
                <span
                  className={cn(
                    "text-sm",
                    form.status === "COMPLETED"
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  Hoàn thành
                </span>
                <Switch
                  checked={form.status === "CANCELLED"}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({
                      ...f,
                      status: checked ? "CANCELLED" : "COMPLETED",
                    }))
                  }
                />
                <span
                  className={cn(
                    "text-sm",
                    form.status === "CANCELLED"
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  Đã hủy
                </span>
              </div>
            </div>
          )}

          <div className={isEditing ? "" : "sm:col-span-2"}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes" className="text-sm font-medium">Ghi chú</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Nhập ghi chú nếu có (khuyến mãi, hoàn tiền...)"
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Đang lưu..."
            : isEditing
            ? "Lưu thay đổi"
            : "Ghi nhận bán hàng"}
        </Button>
      </div>
    </form>
  );
}
