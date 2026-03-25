"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Store } from "@/types/store";

interface StoreFormProps {
  store?: Store;
  onSubmit?: (data: Partial<Store>) => void;
  isLoading?: boolean;
}

export function StoreForm({ store, onSubmit, isLoading = false }: StoreFormProps) {
  const router = useRouter();
  const isEditing = !!store;

  const [form, setForm] = useState({
    name: store?.name ?? "",
    code: store?.code ?? "",
    contactPerson: store?.contactPerson ?? "",
    phone: store?.phone ?? "",
    email: store?.email ?? "",
    address: store?.address ?? "",
    ward: store?.ward ?? "",
    district: store?.district ?? "",
    city: store?.city ?? "",
    status: store?.status ?? "ACTIVE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Tên cửa hàng là bắt buộc.";
    if (!form.code.trim()) next.code = "Mã cửa hàng là bắt buộc.";
    if (!form.contactPerson.trim())
      next.contactPerson = "Người liên hệ là bắt buộc.";
    if (!form.phone.trim()) next.phone = "Điện thoại là bắt buộc.";
    else if (!/^0\d{9,10}$/.test(form.phone.trim()))
      next.phone = "Số điện thoại không hợp lệ (09/08/07xxxxxxxx).";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Email không hợp lệ.";
    if (!form.address.trim()) next.address = "Địa chỉ là bắt buộc.";
    if (!form.city.trim()) next.city = "Thành phố / Tỉnh là bắt buộc.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: Partial<Store> = {
      name: form.name.trim(),
      code: form.code.trim(),
      contactPerson: form.contactPerson.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim(),
      ward: form.ward.trim() || undefined,
      district: form.district.trim() || undefined,
      city: form.city.trim(),
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
      router.push("/dashboard/stores");
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
          "Tên cửa hàng",
          <Input
            id="name"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            placeholder="Ví dụ: Cửa hàng Central Park"
            className={cn(errors.name && "border-destructive")}
          />
        )}
        {field(
          "code",
          "Mã cửa hàng",
          <Input
            id="code"
            value={form.code}
            onChange={(e) =>
              setForm((f) => ({ ...f, code: e.target.value }))
            }
            placeholder="Ví dụ: CP-STORE"
            className={cn(errors.code && "border-destructive")}
          />,
          "Mã duy nhất dùng để nhận diện cửa hàng."
        )}
      </div>

      {/* Row 2 */}
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "contactPerson",
          "Người liên hệ",
          <Input
            id="contactPerson"
            value={form.contactPerson}
            onChange={(e) =>
              setForm((f) => ({ ...f, contactPerson: e.target.value }))
            }
            placeholder="Ví dụ: Trần Thu Trang"
            className={cn(errors.contactPerson && "border-destructive")}
          />
        )}
        {field(
          "phone",
          "Số điện thoại",
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) =>
              setForm((f) => ({ ...f, phone: e.target.value }))
            }
            placeholder="Ví dụ: 0902111222"
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
            placeholder="Ví dụ: centralpark@stores.vn"
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
            Cửa hàng tạm ngưng sẽ không hiển thị khi tạo ký gửi.
          </p>
        </div>
      </div>

      {/* Address row */}
      <div className="grid gap-5 sm:grid-cols-3">
        {field(
          "city",
          "Thành phố / Tỉnh",
          <Input
            id="city"
            value={form.city}
            onChange={(e) =>
              setForm((f) => ({ ...f, city: e.target.value }))
            }
            placeholder="Ví dụ: TP. Hồ Chí Minh"
            className={cn(errors.city && "border-destructive")}
          />
        )}
        {field(
          "district",
          "Quận / Huyện",
          <Input
            id="district"
            value={form.district}
            onChange={(e) =>
              setForm((f) => ({ ...f, district: e.target.value }))
            }
            placeholder="Ví dụ: Quận 1"
          />,
          "Tùy chọn."
        )}
        {field(
          "ward",
          "Phường / Xã",
          <Input
            id="ward"
            value={form.ward}
            onChange={(e) =>
              setForm((f) => ({ ...f, ward: e.target.value }))
            }
            placeholder="Ví dụ: Bến Nghé"
          />,
          "Tùy chọn."
        )}
      </div>

      {/* Full address */}
      {field(
        "address",
        "Địa chỉ chi tiết",
        <Input
          id="address"
          value={form.address}
          onChange={(e) =>
            setForm((f) => ({ ...f, address: e.target.value }))
          }
          placeholder="Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé"
          className={cn(errors.address && "border-destructive")}
        />,
        "Số nhà, tên đường, phường/xã."
      )}

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
            : "Tạo cửa hàng"}
        </Button>
      </div>
    </form>
  );
}
