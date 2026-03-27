// components/warehouse/WarehouseForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Consignor } from "@/types/consignor";

interface WarehouseFormProps {
  warehouse?: {
    id: string;
    code: string;
    name: string;
    address?: string;
    contactPerson?: string;
    phone?: string;
    note?: string;
    consignorId: string;
  };
  consignors: Consignor[];
  onSubmit?: (data: {
    consignorId: string;
    code: string;
    name: string;
    address?: string;
    contactPerson?: string;
    phone?: string;
    note?: string;
  }) => void;
  onSubmitEdit?: (data: Partial<{
    code: string;
    name: string;
    address: string;
    contactPerson: string;
    phone: string;
    note: string;
  }>) => void;
  isLoading?: boolean;
}

export function WarehouseForm({
  warehouse,
  consignors,
  onSubmit,
  onSubmitEdit,
  isLoading = false,
}: WarehouseFormProps) {
  const router = useRouter();
  const isEditing = !!warehouse;

  const [form, setForm] = useState({
    consignorId: warehouse?.consignorId ?? "",
    code: warehouse?.code ?? "",
    name: warehouse?.name ?? "",
    address: warehouse?.address ?? "",
    contactPerson: warehouse?.contactPerson ?? "",
    phone: warehouse?.phone ?? "",
    note: warehouse?.note ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.consignorId) next.consignorId = "Kho cung cấp là bắt buộc.";
    if (!form.code.trim()) next.code = "Mã kho là bắt buộc.";
    if (!form.name.trim()) next.name = "Tên kho là bắt buộc.";
    if (!form.address.trim()) {
      // Address is optional for internal warehouses
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      consignorId: form.consignorId,
      code: form.code.trim(),
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      contactPerson: form.contactPerson.trim() || undefined,
      phone: form.phone.trim() || undefined,
      note: form.note.trim() || undefined,
    };

    if (isEditing && onSubmitEdit) {
      onSubmitEdit(payload);
    } else if (onSubmit) {
      onSubmit(payload);
    } else {
      router.push("/dashboard/warehouses");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Kho sản xuất */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="consignorId" className="text-sm font-medium">
          Kho sản xuất <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.consignorId}
          onValueChange={(v) => setForm((f) => ({ ...f, consignorId: v }))}
          disabled={isEditing}
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
                Chưa có kho sản xuất nào. Tạo kho sản xuất trước.
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
        <p className="text-xs text-muted-foreground">
          Kho sản xuất là bên cung cấp hàng cho kho này.
        </p>
      </div>

      {/* Mã kho + Tên kho */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code" className="text-sm font-medium">
            Mã kho <span className="text-destructive">*</span>
          </Label>
          <Input
            id="code"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="Ví dụ: KHO-001"
            disabled={isEditing}
            className={cn(errors.code && "border-destructive")}
          />
          {errors.code && (
            <p className="text-xs text-destructive">{errors.code}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-sm font-medium">
            Tên kho <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ví dụ: Kho HCM — Tầng 2"
            className={cn(errors.name && "border-destructive")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>
      </div>

      {/* Người liên hệ + Điện thoại */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactPerson" className="text-sm font-medium">
            Người liên hệ
          </Label>
          <Input
            id="contactPerson"
            value={form.contactPerson}
            onChange={(e) =>
              setForm((f) => ({ ...f, contactPerson: e.target.value }))
            }
            placeholder="Ví dụ: Trần Văn A"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone" className="text-sm font-medium">
            Điện thoại
          </Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Ví dụ: 0901234567"
          />
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address" className="text-sm font-medium">
          Địa chỉ
        </Label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder="Ví dụ: 123 Nguyễn Trãi, Quận 1, TP.HCM"
          className={cn(errors.address && "border-destructive")}
        />
        {errors.address && (
          <p className="text-xs text-destructive">{errors.address}</p>
        )}
      </div>

      {/* Ghi chú */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="note" className="text-sm font-medium">Ghi chú</Label>
        <Textarea
          id="note"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          placeholder="Ghi chú thêm nếu có..."
          rows={2}
        />
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
            : "Tạo kho"}
        </Button>
      </div>
    </form>
  );
}
