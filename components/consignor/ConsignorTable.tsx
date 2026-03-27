"use client";

import Link from "next/link";
import { Eye, Edit2, Trash2, Building2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Consignor } from "@/types/consignor";

interface ConsignorTableProps {
  consignors: Consignor[];
  onSelectDelete: (consignor: Consignor) => void;
}

function ConsignorCard({
  consignor,
  onSelectDelete,
}: {
  consignor: Consignor;
  onSelectDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-foreground truncate">
                        {consignor.name}
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            {consignor.code}
          </p>
        </div>
        <Badge
          variant={consignor.status === "ACTIVE" ? "default" : "secondary"}
          className="shrink-0 text-xs"
        >
          {consignor.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
        </Badge>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Building2 className="size-3 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground truncate">
            {consignor.address}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="size-3 shrink-0 text-muted-foreground" />
          <p className="text-xs text-foreground">{consignor.phone}</p>
        </div>
        {consignor.email && (
          <div className="flex items-center gap-2">
            <Mail className="size-3 shrink-0 text-muted-foreground" />
            <p className="text-xs text-foreground truncate">{consignor.email}</p>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          Người liên hệ:{" "}
          <span className="text-foreground">{consignor.contactPerson}</span>
        </p>
      </div>

      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon-xs" title="Xem chi tiết" asChild>
          <Link href={`/dashboard/consignors/${consignor.id}`}>
            <Eye className="size-3" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon-xs" title="Chỉnh sửa" asChild>
          <Link href={`/dashboard/consignors/${consignor.id}?edit=true`}>
            <Edit2 className="size-3" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          title="Xóa"
          className="text-destructive hover:text-destructive"
          onClick={onSelectDelete}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}

export function ConsignorTable({
  consignors,
  onSelectDelete,
}: ConsignorTableProps) {
  return (
    <>
      {/* Desktop table — hidden on mobile & tablet */}
      <div className="hidden md:block rounded-xl border border-border bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Công ty</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Người quản lý</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead className="max-w-[180px] truncate">Địa chỉ</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consignors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  Không tìm thấy kho cung cấp nào.
                </TableCell>
              </TableRow>
            ) : (
              consignors.map((consignor) => (
                <TableRow key={consignor.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm text-foreground">
                        {consignor.name}
                      </span>
                      {consignor.email && (
                        <span className="text-xs text-muted-foreground truncate max-w-[180px] block">
                          {consignor.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {consignor.code}
                  </TableCell>
                  <TableCell className="text-sm">{consignor.contactPerson}</TableCell>
                  <TableCell className="text-sm">{consignor.phone}</TableCell>
                  <TableCell className="text-xs max-w-[180px] truncate">
                    {consignor.address}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        consignor.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {consignor.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Xem chi tiết"
                        asChild
                      >
                        <Link href={`/dashboard/consignors/${consignor.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Chỉnh sửa"
                        asChild
                      >
                        <Link href={`/dashboard/consignors/${consignor.id}?edit=true`}>
                          <Edit2 className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Xóa"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onSelectDelete(consignor)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile & tablet cards — hidden on desktop */}
      <div className="flex flex-col gap-3 md:hidden">
        {consignors.length === 0 ? (
          <div className="rounded-xl border border-border bg-white dark:bg-zinc-900 px-4 py-12 text-center text-sm text-muted-foreground">
            Không tìm thấy kho cung cấp nào.
          </div>
        ) : (
          consignors.map((consignor) => (
            <ConsignorCard
              key={consignor.id}
              consignor={consignor}
              onSelectDelete={() => onSelectDelete(consignor)}
            />
          ))
        )}
      </div>
    </>
  );
}
