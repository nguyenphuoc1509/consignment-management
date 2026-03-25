"use client";

import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
} from "lucide-react";
import { Consignor } from "@/types/consignor";

export function ConsignorDetailView({
  consignor,
}: {
  consignor: Consignor;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <User className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Người quản lý</p>
            <p className="text-sm font-medium text-foreground">
              {consignor.contactPerson}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Điện thoại</p>
            <p className="text-sm font-medium text-foreground">
              {consignor.phone}
            </p>
          </div>
        </div>
        {consignor.email && (
          <div className="flex items-center gap-3">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">
                {consignor.email}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3">
          <MapPin className="size-4 shrink-0 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Địa chỉ</p>
            <p className="text-sm font-medium text-foreground">
              {consignor.address}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="size-3" />
        <span>
          Ngày tạo:{" "}
          {new Date(consignor.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
        <span className="text-muted-foreground/50">|</span>
        <span>
          Cập nhật:{" "}
          {new Date(consignor.updatedAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
