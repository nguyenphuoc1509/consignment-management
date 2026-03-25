"use client";

import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, User, Calendar } from "lucide-react";
import { Store } from "@/types/store";

export function StoreDetailView({ store }: { store: Store }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{store.name}</h3>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            {store.code}
          </p>
        </div>
        <Badge variant={store.status === "ACTIVE" ? "default" : "secondary"}>
          {store.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
        </Badge>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <User className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Người liên hệ</p>
            <p className="text-sm font-medium text-foreground">
              {store.contactPerson}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Điện thoại</p>
            <p className="text-sm font-medium text-foreground">{store.phone}</p>
          </div>
        </div>
        {store.email && (
          <div className="flex items-center gap-3">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">
                {store.email}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3">
          <MapPin className="size-4 shrink-0 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Địa chỉ</p>
            <p className="text-sm font-medium text-foreground">
              {[
                store.address,
                store.ward,
                store.district,
                store.city,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="size-3" />
        <span>
          Ngày tạo:{" "}
          {new Date(store.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
        <span className="text-muted-foreground/50">|</span>
        <span>
          Cập nhật:{" "}
          {new Date(store.updatedAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
