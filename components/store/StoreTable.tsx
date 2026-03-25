"use client";

import Link from "next/link";
import { Eye, Edit2, Trash2, MapPin, Phone, Mail } from "lucide-react";
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
import { Store } from "@/types/store";

interface StoreTableProps {
  stores: Store[];
  onDelete: (store: Store) => void;
}

function StoreCard({
  store,
  onDelete,
}: {
  store: Store;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-foreground truncate">
            {store.name}
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            {store.code}
          </p>
        </div>
        <Badge
          variant={store.status === "ACTIVE" ? "default" : "secondary"}
          className="shrink-0 text-xs"
        >
          {store.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
        </Badge>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <MapPin className="size-3 shrink-0 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground line-clamp-2">
            {store.address}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="size-3 shrink-0 text-muted-foreground" />
          <p className="text-xs text-foreground">{store.phone}</p>
        </div>
        {store.email && (
          <div className="flex items-center gap-2">
            <Mail className="size-3 shrink-0 text-muted-foreground" />
            <p className="text-xs text-foreground truncate">{store.email}</p>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          Người liên hệ:{" "}
          <span className="text-foreground">{store.contactPerson}</span>
        </p>
      </div>

      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon-xs" title="Xem chi tiết" asChild>
          <Link href={`/dashboard/stores/${store.id}`}>
            <Eye className="size-3" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon-xs" title="Chỉnh sửa" asChild>
          <Link href={`/dashboard/stores/${store.id}?edit=true`}>
            <Edit2 className="size-3" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          title="Xóa"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}

export function StoreTable({ stores, onDelete }: StoreTableProps) {
  return (
    <>
      {/* Desktop table — hidden on mobile & tablet */}
      <div className="hidden md:block rounded-xl border border-border bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cửa hàng</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead className="max-w-[200px] truncate">Địa chỉ</TableHead>
              <TableHead>Người liên hệ</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  Không tìm thấy cửa hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm text-foreground">
                        {store.name}
                      </span>
                      {store.email && (
                        <span className="text-xs text-muted-foreground truncate max-w-[180px] block">
                          {store.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {store.code}
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">
                    {store.address}
                  </TableCell>
                  <TableCell className="text-sm">{store.contactPerson}</TableCell>
                  <TableCell className="text-sm">{store.phone}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        store.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {store.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
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
                        <Link href={`/dashboard/stores/${store.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Chỉnh sửa"
                        asChild
                      >
                        <Link href={`/dashboard/stores/${store.id}?edit=true`}>
                          <Edit2 className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Xóa"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(store)}
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
        {stores.length === 0 ? (
          <div className="rounded-xl border border-border bg-white dark:bg-zinc-900 px-4 py-12 text-center text-sm text-muted-foreground">
            Không tìm thấy cửa hàng nào.
          </div>
        ) : (
          stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onDelete={() => onDelete(store)}
            />
          ))
        )}
      </div>
    </>
  );
}
