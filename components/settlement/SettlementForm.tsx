"use client";

import { useState } from "react";
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
import { Settlement, SettlementStatus } from "@/types/settlement";
import { Consignment } from "@/types/consignment";
import { Store } from "@/types/store";
import { Consignor } from "@/types/consignor";

interface SettlementFormProps {
  settlement?: Settlement;
  stores: Store[];
  consignors: Consignor[];
  consignments: Consignment[];
  salesByConsignment: Record<string, { count: number; totalAmount: number; commissionAmount: number; payableAmount: number }>;
  onSubmit?: (data: Omit<Settlement, "id" | "createdAt" | "updatedAt">) => void;
  isLoading?: boolean;
}

export function SettlementForm({
  settlement,
  stores,
  consignors,
  consignments,
  salesByConsignment,
  onSubmit,
  isLoading = false,
}: SettlementFormProps) {
  const router = useRouter();
  const isEditing = !!settlement;

  const [form, setForm] = useState({
    consignmentId: settlement?.consignmentId ?? "",
    storeId: settlement?.storeId ?? "",
    settledAt: settlement?.settledAt
      ? new Date(settlement.settledAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    status: settlement?.status ?? "PENDING" as SettlementStatus,
    notes: settlement?.notes ?? "",
    totalSalesAmount: settlement?.totalSalesAmount ?? 0,
    totalCommissionAmount: settlement?.totalCommissionAmount ?? 0,
    totalPayableAmount: settlement?.totalPayableAmount ?? 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>();

  // Auto-fill store and financial data when consignment is selected
  const selectedConsignment = consignments.find((c) => c.id === form.consignmentId);
  const saleData = form.consignmentId ? salesByConsignment[form.consignmentId] : null;

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.consignmentId) next.consignmentId = "Lô ký gửi là bắt buộc.";
    if (!form.storeId) next.storeId = "Cửa hàng là bắt buộc.";
    if (!form.settledAt) next.settledAt = "Ngày đối soát là bắt buộc.";
    if (form.totalSalesAmount < 0) next.totalSalesAmount = "Doanh số không hợp lệ.";
    if (form.totalCommissionAmount < 0) next.totalCommissionAmount = "Hoa hồng không hợp lệ.";
    if (form.totalPayableAmount < 0) next.totalPayableAmount = "Số phải trả không hợp lệ.";
    if (form.totalPayableAmount > form.totalSalesAmount) next.totalPayableAmount = "Số phải trả không thể lớn hơn doanh số.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const consignment = consignments.find((c) => c.id === form.consignmentId);
    if (!consignment) return;

    const payload: Omit<Settlement, "id" | "createdAt" | "updatedAt"> = {
      consignmentId: form.consignmentId,
      consignorId: consignment.consignorId,
      storeId: form.storeId,
      totalSalesAmount: form.totalSalesAmount,
      totalCommissionAmount: form.totalCommissionAmount,
      totalPayableAmount: form.totalPayableAmount,
      settledAt: new Date(form.settledAt).toISOString(),
      status: form.status,
      notes: form.notes.trim() || undefined,
    };

    if (onSubmit) {
      onSubmit(payload);
    } else {
      alert(
        isEditing
          ? `Cập nhật thành công!\n\n${JSON.stringify(payload, null, 2)}`
          : `Tạo đối soát thành công!\n\n${JSON.stringify(payload, null, 2)}`
      );
      router.push("/dashboard/settlements");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Thông tin đối soát */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Thông tin đối soát
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="consignmentId" className="text-sm font-medium">
              Lô ký gửi <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.consignmentId}
              onValueChange={(v) => {
                const c = consignments.find((c) => c.id === v);
                setForm((f) => ({
                  ...f,
                  consignmentId: v,
                  storeId: c?.storeId ?? "",
                  totalSalesAmount: saleData?.totalAmount ?? 0,
                  totalCommissionAmount: saleData?.commissionAmount ?? 0,
                  totalPayableAmount: saleData?.payableAmount ?? 0,
                }));
              }}
            >
              <SelectTrigger
                id="consignmentId"
                className={cn(errors?.consignmentId && "border-destructive")}
              >
                <SelectValue placeholder="Chọn lô ký gửi..." />
              </SelectTrigger>
              <SelectContent>
                {consignments.filter((c) => c.status !== "SETTLED" && c.status !== "PENDING").length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Không có lô ký gửi nào có giao dịch.
                  </div>
                ) : (
                  consignments
                    .filter((c) => c.status !== "SETTLED" && c.status !== "PENDING")
                    .map((c) => {
                      const consignor = consignors.find((cg) => cg.id === c.consignorId);
                      const store = stores.find((s) => s.id === c.storeId);
                      const data = salesByConsignment[c.id];
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} — {consignor?.companyName ?? c.consignorId} ({store?.name ?? c.storeId})
                          {data ? ` (${data.count} GD)` : ""}
                        </SelectItem>
                      );
                    })
                )}
              </SelectContent>
            </Select>
            {errors?.consignmentId && (
              <p className="text-xs text-destructive">{errors.consignmentId}</p>
            )}
          </div>

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
                className={cn(errors?.storeId && "border-destructive")}
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
            {errors?.storeId && (
              <p className="text-xs text-destructive">{errors.storeId}</p>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settledAt" className="text-sm font-medium">
              Ngày đối soát <span className="text-destructive">*</span>
            </Label>
            <Input
              id="settledAt"
              type="datetime-local"
              value={form.settledAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, settledAt: e.target.value }))
              }
              className={cn(errors?.settledAt && "border-destructive")}
            />
            {errors?.settledAt && (
              <p className="text-xs text-destructive">{errors.settledAt}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Trạng thái</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, status: v as SettlementStatus }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                <SelectItem value="PAID">Đã thanh toán</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Số liệu tài chính */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Số liệu tài chính
        </h3>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="totalSalesAmount" className="text-sm font-medium">
              Doanh số (VNĐ) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="totalSalesAmount"
              type="number"
              min={0}
              step={1000}
              value={form.totalSalesAmount}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  totalSalesAmount: Number(e.target.value),
                  totalPayableAmount: Math.max(
                    0,
                    Number(e.target.value) - f.totalCommissionAmount
                  ),
                }))
              }
              className={cn(errors?.totalSalesAmount && "border-destructive")}
            />
            {saleData && (
              <p className="text-xs text-muted-foreground">
                Từ giao dịch: {formatCurrency(saleData.totalAmount)}
              </p>
            )}
            {errors?.totalSalesAmount && (
              <p className="text-xs text-destructive">{errors.totalSalesAmount}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="totalCommissionAmount" className="text-sm font-medium">
              Hoa hồng cửa hàng (VNĐ)
            </Label>
            <Input
              id="totalCommissionAmount"
              type="number"
              min={0}
              step={1000}
              value={form.totalCommissionAmount}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  totalCommissionAmount: Number(e.target.value),
                  totalPayableAmount: Math.max(
                    0,
                    f.totalSalesAmount - Number(e.target.value)
                  ),
                }))
              }
              className={cn(errors?.totalCommissionAmount && "border-destructive")}
            />
            {saleData && (
              <p className="text-xs text-muted-foreground">
                Mặc định: {formatCurrency(saleData.commissionAmount)}
              </p>
            )}
            {errors?.totalCommissionAmount && (
              <p className="text-xs text-destructive">{errors.totalCommissionAmount}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="totalPayableAmount" className="text-sm font-medium">
              Phải trả bên giao (VNĐ)
            </Label>
            <div className="flex h-10 items-center rounded-md border border-border bg-muted/30 px-3">
              <span className="text-base font-bold text-green-600">
                {formatCurrency(form.totalPayableAmount)}
              </span>
            </div>
            {saleData && (
              <p className="text-xs text-muted-foreground">
                Mặc định: {formatCurrency(saleData.payableAmount)}
              </p>
            )}
            {errors?.totalPayableAmount && (
              <p className="text-xs text-destructive">{errors.totalPayableAmount}</p>
            )}
          </div>
        </div>
      </div>

      {/* Ghi chú */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Bổ sung
        </h3>
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
            : "Tạo đối soát"}
        </Button>
      </div>
    </form>
  );
}
