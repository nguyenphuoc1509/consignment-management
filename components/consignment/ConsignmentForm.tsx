"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertCircle } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Warehouse } from "@/types/warehouse";
import { WarehouseInventoryWithProduct } from "@/types/warehouseInventory";
import { useWarehouseInventory } from "@/hooks/useWarehouseInventory";
import { api } from "@/lib/api/client";

interface ConsignmentFormProps {
  consignment?: ConsignmentWithItems;
  consignors: Consignor[];
  stores: Store[];
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
  { value: "DRAFT", label: "Nháp" },
  { value: "SHIPPED", label: "Đã gửi" },
  { value: "PARTIAL_SOLD", label: "Bán một phần" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "RETURNED", label: "Đã trả về" },
  { value: "SETTLED", label: "Đã đối soát" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export function ConsignmentForm({
  consignment,
  consignors,
  stores,
  onSubmit,
  onSubmitEdit,
  isLoading = false,
}: ConsignmentFormProps) {
  const router = useRouter();
  const isEditing = !!consignment;

  const [form, setForm] = useState({
    code: consignment?.code ?? "",
    consignorId: consignment?.consignorId ?? "",
    warehouseId: consignment?.warehouseId ?? "",
    storeId: consignment?.storeId ?? "",
    sentDate: consignment?.sentDate ?? "",
    expectedReturnDate: consignment?.expectedReturnDate ?? "",
    status: (consignment?.status ?? "SHIPPED") as ConsignmentStatus,
    note: consignment?.note ?? "",
  });

  const { inventory: warehouseInventory, fetchInventory, clearInventory } = useWarehouseInventory();

  useEffect(() => {
    if (form.consignorId !== (consignment?.consignorId ?? "")) {
      setForm((f) => ({ ...f, warehouseId: "" }));
      clearInventory();
    }
  }, [form.consignorId, consignment?.consignorId, clearInventory]);

  useEffect(() => {
    if (form.warehouseId) {
      fetchInventory(form.warehouseId, true);
    } else {
      clearInventory();
    }
  }, [form.warehouseId, fetchInventory, clearInventory]);

  useEffect(() => {
    if (isEditing && consignment?.warehouseId) {
      fetchInventory(consignment.warehouseId, false);
    }
  }, [isEditing, consignment?.warehouseId, fetchInventory]);

  const [consignorWarehouses, setConsignorWarehouses] = useState<Warehouse[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // Khi consignor thay đổi, fetch danh sách kho của consignor đó
  useEffect(() => {
    if (form.consignorId) {
      setLoadingWarehouses(true);
      api.get<Warehouse[]>(`/api/warehouses?consignorId=${form.consignorId}`)
        .then((data) => setConsignorWarehouses(data))
        .catch(() => setConsignorWarehouses([]))
        .finally(() => setLoadingWarehouses(false));
    } else {
      setConsignorWarehouses([]);
    }
  }, [form.consignorId]);

  const [items, setItems] = useState<NewItem[]>(
    (consignment?.items.map((i) => ({
      productId: i.productId,
      quantitySent: i.quantitySent,
      quantitySold: i.quantitySold,
      quantityReturned: i.quantityReturned,
      quantityDamaged: i.quantityDamaged,
      status: (i.status ?? "ACTIVE") as NewItem["status"],
      createdAt: i.createdAt ?? new Date().toISOString(),
      updatedAt: i.updatedAt ?? new Date().toISOString(),
    })) ?? []) as NewItem[]
  );

  const [productSelect, setProductSelect] = useState("");
  const [qtySent, setQtySent] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.code.trim()) next.code = "Mã lô ký gửi là bắt buộc.";
    if (!form.consignorId) next.consignorId = "Kho sản xuất là bắt buộc.";
    if (!form.warehouseId) next.warehouseId = "Kho lấy hàng là bắt buộc.";
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
      warehouseId: form.warehouseId,
      storeId: form.storeId,
      sentDate: form.sentDate,
      expectedReturnDate: form.expectedReturnDate || undefined,
      status: form.status,
      note: form.note.trim() || undefined,
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

    const invItem = warehouseInventory.find((i) => i.productId === productSelect);
    if (invItem && qtySent > invItem.quantity) {
      setErrors((prev) => ({
        ...prev,
        items: `Số lượng vượt tồn kho (tối đa ${invItem.quantity}).`,
      }));
      return;
    }

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
        status: "ACTIVE" as NewItem["status"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
    const inv = warehouseInventory.find((i) => i.productId === id);
    return inv?.product.name ?? id;
  }

  function getProductPrice(id: string) {
    const inv = warehouseInventory.find((i) => i.productId === id);
    return inv?.product.price ?? 0;
  }

  function getAvailableQty(productId: string) {
    return warehouseInventory.find((i) => i.productId === productId)?.quantity ?? null;
  }

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
              Kho sản xuất <span className="text-destructive">*</span>
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
                <SelectValue placeholder="Chọn kho sản xuất..." />
              </SelectTrigger>
              <SelectContent>
                {consignors.filter((c) => c.status === "ACTIVE").length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Chưa có kho sản xuất nào. Tạo kho trước.
                  </div>
                ) : (
                  consignors
                    .filter((c) => c.status === "ACTIVE")
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
            {errors.consignorId && (
              <p className="text-xs text-destructive">{errors.consignorId}</p>
            )}
          </div>

          {/* Chọn kho — hiện khi đã chọn consignor */}
          {form.consignorId && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="warehouseId" className="text-sm font-medium">
                Kho lấy hàng <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.warehouseId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, warehouseId: v }))
                }
                disabled={!form.consignorId || loadingWarehouses}
              >
                <SelectTrigger
                  id="warehouseId"
                  className={cn(errors.warehouseId && "border-destructive")}
                >
                  <SelectValue
                    placeholder={
                      loadingWarehouses
                        ? "Đang tải kho..."
                        : "Chọn kho lấy hàng"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {consignorWarehouses.length === 0 && !loadingWarehouses ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Kho này chưa có kho dự trữ nào. Tạo kho dự trữ trước.
                    </div>
                  ) : (
                    consignorWarehouses
                      .filter((w) => w.status === "ACTIVE")
                      .map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name} — {w.code}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {errors.warehouseId && (
                <p className="text-xs text-destructive">{errors.warehouseId}</p>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
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
          {isEditing ? (
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
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Trạng thái</Label>
              <div className="flex items-center h-10 px-3 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground">
                Đã gửi (mặc định khi tạo mới)
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="note" className="text-sm font-medium">Ghi chú</Label>
          <Textarea
            id="note"
            value={form.note}
            onChange={(e) =>
              setForm((f) => ({ ...f, note: e.target.value }))
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
            {!form.warehouseId ? (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                <AlertCircle className="size-3" />
                Chọn kho trước để hiện sản phẩm.
              </div>
            ) : warehouseInventory.length === 0 ? (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="size-3" />
                Kho này chưa có sản phẩm nào trong kho.
              </div>
            ) : (
              <Select value={productSelect} onValueChange={setProductSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sản phẩm..." />
                </SelectTrigger>
                <SelectContent>
                  {warehouseInventory.map((item) => (
                    <SelectItem key={item.productId} value={item.productId}>
                      {item.product.name} — Tồn: {item.quantity} — {formatCurrency(item.product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex flex-col gap-1.5 sm:w-32">
            <Label className="text-sm font-medium">SL gửi</Label>
            {productSelect ? (
              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  max={getAvailableQty(productSelect) ?? undefined}
                  value={qtySent}
                  onChange={(e) => setQtySent(Number(e.target.value))}
                  className="pr-12"
                />
                {getAvailableQty(productSelect) !== null && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    /{getAvailableQty(productSelect)}
                  </span>
                )}
              </div>
            ) : (
              <Input
                type="number"
                min={1}
                value={qtySent}
                onChange={(e) => setQtySent(Number(e.target.value))}
              />
            )}
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
                          <Badge variant="secondary">{item.quantitySold}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{item.quantityReturned}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{item.quantityDamaged}</Badge>
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
