"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Consignor } from "@/types/consignor";

interface ConsignorFormProps {
  consignor?: Consignor;
  onSubmit?: (data: Partial<Consignor>) => void;
  isLoading?: boolean;
}

export function ConsignorForm({
  consignor,
  onSubmit,
  isLoading = false,
}: ConsignorFormProps) {
  const router = useRouter();
  const isEditing = !!consignor;

  const [form, setForm] = useState({
    name: consignor?.name ?? "",
    code: consignor?.code ?? "",
    contactPerson: consignor?.contactPerson ?? "",
    phone: consignor?.phone ?? "",
    email: consignor?.email ?? "",
    address: consignor?.address ?? "",
    status: consignor?.status ?? "ACTIVE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Tên kho sản xuất là bắt buộc.";
    if (!form.code.trim()) next.code = "Mã là bắt buộc.";
    if (!form.contactPerson.trim())
      next.contactPerson = "Người quản lý là bắt buộc.";
    if (!form.phone.trim()) next.phone = "Điện thoại là bắt buộc.";
    else if (!/^0\d{9,10}$/.test(form.phone.trim()))
      next.phone = "Số điện thoại không hợp lệ (09/08/07xxxxxxxx).";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Email không hợp lệ.";
    if (!form.address.trim()) next.address = "Địa chỉ là bắt buộc.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: Partial<Consignor> = {
      name: form.name.trim(),
      code: form.code.trim(),
      contactPerson: form.contactPerson.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim(),
      status: form.status,
    };

    if (onSubmit) {
      onSubmit(payload);
    } else {
      alert(
        isEditing
          ? `Cập nhật thành công!\n\n${JSON.stringify(payload, null, 2)}`
          : `Tạo mới thành công!\n\n${JSON.stringify(payload, null, 2)}`
      );
      router.push("/dashboard/consignors");
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
          "Tên kho sản xuất",
          <Input
            id="name"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            placeholder="Ví dụ: Kho Sản Xuất My Fashion"
            className={cn(errors.name && "border-destructive")}
          />
        )}
        {field(
          "code",
          "Mã kho",
          <Input
            id="code"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="Ví dụ: KHO-001"
            disabled={isEditing}
            className={cn(errors.code && "border-destructive")}
          />,
          "Mã duy nhất dùng để nhận diện kho sản xuất."
        )}
      </div>

      {/* Row 2 */}
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "contactPerson",
          "Người quản lý",
          <Input
            id="contactPerson"
            value={form.contactPerson}
            onChange={(e) =>
              setForm((f) => ({ ...f, contactPerson: e.target.value }))
            }
            placeholder="Ví dụ: Trần Minh Thanh"
            className={cn(errors.contactPerson && "border-destructive")}
          />
        )}
        {field(
          "phone",
          "Điện thoại",
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) =>
              setForm((f) => ({ ...f, phone: e.target.value }))
            }
            placeholder="Ví dụ: 0901234567"
            className={cn(errors.phone && "border-destructive")}
          />
        )}
      </div>

      {/* Row 3 */}
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "email",
          "Email",
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            placeholder="Ví dụ: contact@company.vn"
            className={cn(errors.email && "border-destructive")}
          />,
          "Địa chỉ email liên hệ (tùy chọn)."
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
            Kho bị tạm ngưng sẽ không hiển thị khi tạo ký gửi.
          </p>
        </div>
      </div>

      {/* Address */}
      {field(
        "address",
        "Địa chỉ",
        <Input
          id="address"
          value={form.address}
          onChange={(e) =>
            setForm((f) => ({ ...f, address: e.target.value }))
          }
          placeholder="Ví dụ: 123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh"
          className={cn(errors.address && "border-destructive")}
        />
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
          {isLoading ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo kho sản xuất"}
        </Button>
      </div>
    </form>
  );
}
