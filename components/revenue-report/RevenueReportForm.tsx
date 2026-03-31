"use client";

import { useState, useEffect, useMemo } from "react";
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
import { cn, formatCurrency } from "@/lib/utils";
import { StoreInventoryReconciliation } from "@/types/revenueReport";
import { useRevenueReports } from "@/hooks/useRevenueReports";

interface RevenueReportFormProps {
  storeId?: string;
  storeName?: string;
  reconciliation?: StoreInventoryReconciliation | null;
  onSubmit?: (data: RevenueReportFormData) => void;
  isLoading?: boolean;
}

export interface RevenueReportFormData {
  storeId: string;
  reportDate: string;
  note?: string;
  items: RevenueReportItemData[];
}

interface RevenueReportItemData {
  consignmentId: string;
  consignmentItemId: string;
  productId: string;
  quantity: number;
  soldPrice: number;
}

interface LineItem {
  consignmentItemId: string;
  consignmentId: string;
  consignmentCode: string;
  productId: string;
  productName: string;
  productSku: string;
  available: number;
  soldPrice: number;
  quantity: number;
  totalAmount: number;
}

export function RevenueReportForm({
  storeId: initialStoreId,
  storeName: initialStoreName,
  reconciliation,
  onSubmit,
  isLoading = false,
}: RevenueReportFormProps) {
  const router = useRouter();
  const { addReport } = useRevenueReports();

  const [selectedStoreId, setSelectedStoreId] = useState(initialStoreId ?? "");
  const [reportDate, setReportDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [note, setNote] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Build line items from reconciliation data
  useEffect(() => {
    if (!reconciliation) return;
    const lineItems: LineItem[] = [];
    for (const c of reconciliation.consignments) {
      for (const i of c.items) {
        if (i.available > 0) {
          lineItems.push({
            consignmentItemId: i.consignmentItemId,
            consignmentId: c.consignmentId,
            consignmentCode: c.consignmentCode,
            productId: i.productId,
            productName: i.productName,
            productSku: i.productSku,
            available: i.available,
            soldPrice: 0,
            quantity: 0,
            totalAmount: 0,
          });
        }
      }
    }
    setItems(lineItems);
  }, [reconciliation]);

  const grandTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.totalAmount, 0),
    [items]
  );

  const totalQuantity = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  function updateItem(index: number, field: keyof LineItem, value: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "soldPrice") {
          updated.totalAmount = updated.quantity * updated.soldPrice;
        }
        return updated;
      })
    );
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!selectedStoreId) next.storeId = "Cửa hàng là bắt buộc.";
    if (!reportDate) next.reportDate = "Ngày báo cáo là bắt buộc.";
    if (totalQuantity === 0) next.items = "Phải nhập ít nhất 1 sản phẩm bán được.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: RevenueReportFormData = {
        storeId: selectedStoreId,
        reportDate: new Date(reportDate).toISOString(),
        note: note.trim() || undefined,
        items: items
          .filter((i) => i.quantity > 0)
          .map((i) => ({
            consignmentId: i.consignmentId,
            consignmentItemId: i.consignmentItemId,
            productId: i.productId,
            quantity: i.quantity,
            soldPrice: i.soldPrice,
          })),
      };
      if (onSubmit) {
        onSubmit(payload);
      } else {
        await addReport(payload);
        router.push("/dashboard/sales/by-store");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi lưu báo cáo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Thông tin báo cáo */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Thông tin báo cáo
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          {!initialStoreId && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storeId" className="text-sm font-medium">
                Cửa hàng <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedStoreId}
                onValueChange={(v) => setSelectedStoreId(v)}
              >
                <SelectTrigger
                  id="storeId"
                  className={cn(errors.storeId && "border-destructive")}
                >
                  <SelectValue placeholder="Chọn cửa hàng..." />
                </SelectTrigger>
                <SelectContent>
                  {/* Stores loaded via parent component */}
                  <SelectItem value={initialStoreId ?? ""} disabled>
                    {initialStoreName ?? "Chọn cửa hàng..."}
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.storeId && (
                <p className="text-xs text-destructive">{errors.storeId}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reportDate" className="text-sm font-medium">
              Ngày báo cáo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reportDate"
              type="datetime-local"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className={cn(errors.reportDate && "border-destructive")}
            />
            {errors.reportDate && (
              <p className="text-xs text-destructive">{errors.reportDate}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="note" className="text-sm font-medium">Ghi chú</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú thêm nếu có (VD: lý do chênh lệch, khuyến mãi...)"
            rows={2}
          />
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Sản phẩm bán được
        </h3>

        {items.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
            Không có sản phẩm nào được ký gửi tại cửa hàng này.
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium text-muted-foreground">Lô</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Sản phẩm</th>
                    <th className="p-3 text-right font-medium text-muted-foreground w-24">Tồn kho</th>
                    <th className="p-3 text-right font-medium text-muted-foreground w-32">SL bán</th>
                    <th className="p-3 text-right font-medium text-muted-foreground w-36">Giá bán (VNĐ)</th>
                    <th className="p-3 text-right font-medium text-muted-foreground w-36">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={`${item.consignmentItemId}-${idx}`} className="border-b last:border-0">
                      <td className="p-3 text-xs text-muted-foreground">{item.consignmentCode}</td>
                      <td className="p-3">
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.productSku}</p>
                      </td>
                      <td className="p-3 text-right text-sm">{item.available}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min={0}
                          max={item.available}
                          value={item.quantity || ""}
                          onChange={(e) =>
                            updateItem(idx, "quantity", Number(e.target.value))
                          }
                          className="w-20 text-right"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min={0}
                          step={1000}
                          value={item.soldPrice || ""}
                          onChange={(e) =>
                            updateItem(idx, "soldPrice", Number(e.target.value))
                          }
                          className="w-32 text-right"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-3 text-right font-medium text-green-600">
                        {item.totalAmount > 0 ? formatCurrency(item.totalAmount) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30 font-semibold">
                    <td colSpan={3} className="p-3 text-right">Tổng cộng</td>
                    <td className="p-3 text-right">{totalQuantity}</td>
                    <td />
                    <td className="p-3 text-right text-green-600">
                      {grandTotal > 0 ? formatCurrency(grandTotal) : "—"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3 p-3">
              {items.map((item, idx) => (
                <div key={`${item.consignmentItemId}-${idx}`} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.consignmentCode} · {item.productSku}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      Tồn: {item.available}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">SL bán</Label>
                      <Input
                        type="number"
                        min={0}
                        max={item.available}
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateItem(idx, "quantity", Number(e.target.value))
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">Giá bán</Label>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={item.soldPrice || ""}
                        onChange={(e) =>
                          updateItem(idx, "soldPrice", Number(e.target.value))
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-sm font-medium text-green-600">
                      {item.totalAmount > 0 ? formatCurrency(item.totalAmount) : "—"}
                    </span>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between items-center font-semibold">
                <span>Tổng: {totalQuantity} sản phẩm</span>
                <span className="text-green-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {errors.items && (
          <p className="text-xs text-destructive">{errors.items}</p>
        )}
      </div>

      {/* Tổng kết */}
      {grandTotal > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-green-50 dark:bg-green-950/20 p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {totalQuantity} sản phẩm được báo cáo
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(grandTotal)}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Hủy
        </Button>
        <Button type="submit" disabled={submitting || isLoading}>
          {submitting || isLoading ? "Đang lưu..." : "Lưu báo cáo"}
        </Button>
      </div>
    </form>
  );
}
