"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Consignment,
  ConsignmentItem,
  ConsignmentStatus,
  ConsignmentWithItems,
} from "@/types/consignment";
import { Consignor } from "@/types/consignor";
import { Store } from "@/types/store";
import { Product } from "@/types/product";

interface ConsignmentFormProps {
  consignment?: ConsignmentWithItems;
  consignors: Consignor[];
  stores: Store[];
  products: Product[];
  onSubmit?: (
    data: Omit<Consignment, "id" | "createdAt" | "updatedAt">,
    items: Omit<ConsignmentItem, "id" | "consignmentId">[]
  ) => void;
  onSubmitEdit?: (
    data: Partial<Consignment>,
    items: Omit<ConsignmentItem, "id" | "consignmentId">[]
  ) => void;
  isLoading?: boolean;
}

type NewItem = Omit<ConsignmentItem, "id" | "consignmentId">;

const STATUS_OPTIONS: { value: ConsignmentStatus; label: string }[] = [
  { value: "PENDING", label: "Chờ gửi" },
  { value: "SENT", label: "Đã gửi" },
  { value: "PARTIAL_SOLD", label: "Bán một phần" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "RETURNED", label: "Đã trả về" },
  { value: "SETTLED", label: "Đã đối soát" },
];

export function ConsignmentForm({
  consignment,
  consignors,
  stores,
  products,
  onSubmit,
  onSubmitEdit,
  isLoading = false,
}: ConsignmentFormProps) {
  const router = useRouter();
  const isEditing = !!consignment;

  const [form, setForm] = useState({
    code: consignment?.code ?? "",
    consignorId: consignment?.consignorId ?? "",
    storeId: consignment?.storeId ?? "",
    sentDate: consignment?.sentDate ?? "",
    expectedReturnDate: consignment?.expectedReturnDate ?? "",
    status: consignment?.status ?? "PENDING",
    notes: consignment?.notes ?? "",
  });

  const [items, setItems] = useState<NewItem[]>(
    consignment?.items.map((i) => ({
      productId: i.productId,
      quantitySent: i.quantitySent,
      quantitySold: i.quantitySold,
      quantityReturned: i.quantityReturned,
      quantityDamaged: i.quantityDamaged,
    })) ?? []
  );

  const [productSelect, setProductSelect] = useState("");
  const [qtySent, setQtySent] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.code.trim()) next.code = "Mã lô ký gửi là bắt buộc.";
    if (!form.consignorId) next.consignorId = "Bên giao hàng là bắt buộc.";
    if (!form.storeId) next.storeId = "Cửa hàng nhận hàng là bắt buộc.";
    if (!form.sentDate) next.sentDate = "Ngày gửi là bắt buộc.";
    if (items.length === 0) next.items = "Phải thêm ít nhất một sản phẩm.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const consignmentData = {
      code: form.code.trim(),
      consignorId: form.consignorId,
      storeId: form.storeId,
      sentDate: form.sentDate,
      expectedReturnDate: form.expectedReturnDate || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
    };

    if (isEditing && onSubmitEdit) {
      onSubmitEdit(consignmentData, items);
    } else if (onSubmit) {
      onSubmit(consignmentData, items);
    } else {
      alert(
        isEditing
          ? `Cập nhật thành công!\n\n${JSON.stringify({ ...consignmentData, items }, null, 2)}`
          : `Tạo mới thành công!\n\n${JSON.stringify({ ...consignmentData, items }, null, 2)}`
      );
      router.push("/dashboard/consignments");
    }
  }

  function addItem() {
    if (!productSelect) return;
    if (items.some((i) => i.productId === productSelect)) {
      setErrors((prev) => ({ ...prev, items: "Sản phẩm đã có trong danh sách." }));
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        productId: productSelect,
        quantitySent: qtySent,
        quantitySold: 0,
        quantityReturned: 0,
        quantityDamaged: 0,
      },
    ]);
    setProductSelect("");
    setQtySent(1);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.items;
      return next;
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateItemQty(productId: string, field: keyof NewItem, value: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, [field]: value } : i
      )
    );
  }

  function getProductName(id: string) {
    return products.find((p) => p.id === id)?.name ?? id;
  }

  function getProductPrice(id: string) {
    return products.find((p) => p.id === id)?.price ?? 0;
  }

  const activeProducts = products;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Step 1: Thông tin lô hàng */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Thông tin lô ký gửi
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="consignorId" className="text-sm font-medium">
              Bên giao hàng <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.consignorId}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, consignorId: v }))
              }
            >
              <SelectTrigger
                id="consignorId"
                className={cn(errors.consignorId && "border-destructive")}
              >
                <SelectValue placeholder="Chọn bên giao hàng" />
              </SelectTrigger>
              <SelectContent>
                {consignors.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Chưa có bên giao hàng.
                  </div>
                ) : (
                  consignors
                    .filter((c) => c.status === "ACTIVE")
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.companyName}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
            {errors.consignorId && (
              <p className="text-xs text-destructive">{errors.consignorId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="storeId" className="text-sm font-medium">
              Cửa hàng nhận <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.storeId}
              onValueChange={(v) => setForm((f) => ({ ...f, storeId: v }))}
            >
              <SelectTrigger
                id="storeId"
                className={cn(errors.storeId && "border-destructive")}
              >
                <SelectValue placeholder="Chọn cửa hàng nhận hàng" />
              </SelectTrigger>
              <SelectContent>
                {stores
                  .filter((s) => s.status === "ACTIVE")
                  .map((s) => (
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
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code" className="text-sm font-medium">
              Mã lô ký gửi <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value }))
              }
              placeholder="Ví dụ: KG-2026-006"
              className={cn(errors.code && "border-destructive")}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sentDate" className="text-sm font-medium">
              Ngày gửi <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sentDate"
              type="date"
              value={form.sentDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, sentDate: e.target.value }))
              }
              className={cn(errors.sentDate && "border-destructive")}
            />
            {errors.sentDate && (
              <p className="text-xs text-destructive">{errors.sentDate}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expectedReturnDate" className="text-sm font-medium">
              Ngày dự kiến trả
            </Label>
            <Input
              id="expectedReturnDate"
              type="date"
              value={form.expectedReturnDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, expectedReturnDate: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Trạng thái</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, status: v as ConsignmentStatus }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes" className="text-sm font-medium">Ghi chú</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) =>
              setForm((f) => ({ ...f, notes: e.target.value }))
            }
            placeholder="Nhập ghi chú nếu có..."
            rows={2}
          />
        </div>
      </div>

      {/* Step 2: Danh sách sản phẩm */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Danh sách sản phẩm
        </h3>

        {/* Add item row */}
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5 flex-1">
            <Label className="text-sm font-medium">Sản phẩm</Label>
            <Select value={productSelect} onValueChange={setProductSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn sản phẩm..." />
              </SelectTrigger>
              <SelectContent>
                  {activeProducts.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Chưa có sản phẩm nào.
                    </div>
                ) : (
                  activeProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 sm:w-32">
            <Label className="text-sm font-medium">SL gửi</Label>
            <Input
              type="number"
              min={1}
              value={qtySent}
              onChange={(e) => setQtySent(Number(e.target.value))}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="size-4" />
            Thêm
          </Button>
        </div>

        {errors.items && (
          <p className="text-xs text-destructive">{errors.items}</p>
        )}

        {/* Items table */}
        {items.length > 0 ? (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-center">SL gửi</TableHead>
                  {isEditing && (
                    <>
                      <TableHead className="text-center">Đã bán</TableHead>
                      <TableHead className="text-center">Trả về</TableHead>
                      <TableHead className="text-center">Hư hỏng</TableHead>
                    </>
                  )}
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={item.productId}>
                    <TableCell className="text-xs text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {getProductName(item.productId)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(getProductPrice(item.productId))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          min={0}
                          className="w-20 mx-auto text-center"
                          value={item.quantitySent}
                          onChange={(e) =>
                            updateItemQty(item.productId, "quantitySent", Number(e.target.value))
                          }
                        />
                      ) : (
                        <Badge variant="secondary">{item.quantitySent}</Badge>
                      )}
                    </TableCell>
                    {isEditing && (
                      <>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min={0}
                            className="w-20 mx-auto text-center"
                            value={item.quantitySold}
                            onChange={(e) =>
                              updateItemQty(item.productId, "quantitySold", Number(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min={0}
                            className="w-20 mx-auto text-center"
                            value={item.quantityReturned}
                            onChange={(e) =>
                              updateItemQty(item.productId, "quantityReturned", Number(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min={0}
                            className="w-20 mx-auto text-center"
                            value={item.quantityDamaged}
                            onChange={(e) =>
                              updateItemQty(item.productId, "quantityDamaged", Number(e.target.value))
                            }
                          />
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Chưa có sản phẩm nào. Chọn sản phẩm bên trên để thêm.
          </div>
        )}
      </div>

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
            : "Tạo lô ký gửi"}
        </Button>
      </div>
    </form>
  );
}
