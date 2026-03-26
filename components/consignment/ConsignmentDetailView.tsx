"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConsignmentWithItems, ConsignmentStatus } from "@/types/consignment";
import { Consignor } from "@/types/consignor";
import { Store } from "@/types/store";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Store as StoreIcon,
  Calendar,
  Package,
  User,
  Phone,
  Mail,
} from "lucide-react";

const STATUS_CONFIG: Record<ConsignmentStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PENDING: { label: "Chờ gửi", variant: "secondary" },
  SENT: { label: "Đã gửi", variant: "default" },
  PARTIAL_SOLD: { label: "Bán một phần", variant: "outline" },
  COMPLETED: { label: "Hoàn thành", variant: "default" },
  RETURNED: { label: "Đã trả về", variant: "secondary" },
  SETTLED: { label: "Đã đối soát", variant: "secondary" },
};

interface ConsignmentDetailViewProps {
  consignment: ConsignmentWithItems;
  consignor: Consignor;
  store: Store;
  products: Product[];
}

export function ConsignmentDetailView({
  consignment,
  consignor,
  store,
  products,
}: ConsignmentDetailViewProps) {
  const statusCfg = STATUS_CONFIG[consignment.status];

  function getProduct(id: string) {
    return products.find((p) => p.id === id);
  }

  const totals = consignment.items.reduce(
    (acc, i) => ({
      sent: acc.sent + i.quantitySent,
      sold: acc.sold + i.quantitySold,
      returned: acc.returned + i.quantityReturned,
      damaged: acc.damaged + i.quantityDamaged,
    }),
    { sent: 0, sold: 0, returned: 0, damaged: 0 }
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Consignor card */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Bên giao hàng</h3>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-sm text-foreground">{consignor.companyName ?? consignor.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{consignor.code}</p>
            </div>
            <div className="flex items-center gap-2">
              <User className="size-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{consignor.contactPerson}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{consignor.phone}</p>
            </div>
            {consignor.email && (
              <div className="flex items-center gap-2">
                <Mail className="size-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{consignor.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Store card */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <StoreIcon className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Cửa hàng nhận</h3>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-sm text-foreground">{store.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{store.code}</p>
            </div>
            <div className="flex items-center gap-2">
              <User className="size-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{store.contactPerson}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{store.phone}</p>
            </div>
            <div className="flex items-start gap-2">
              <Package className="size-3 shrink-0 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">{store.address}, {store.city}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment dates */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Ngày gửi:</span>
          <span className="font-medium text-foreground">
            {new Date(consignment.sentDate).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>
        {consignment.expectedReturnDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Ngày dự kiến trả:</span>
            <span className="font-medium text-foreground">
              {new Date(consignment.expectedReturnDate).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        )}
        {consignment.notes && (
          <div className="flex items-center gap-2 text-sm w-full">
            <span className="text-muted-foreground">Ghi chú:</span>
            <span className="text-foreground">{consignment.notes}</span>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Tổng SP", value: consignment.items.length },
          { label: "Đã gửi", value: totals.sent, color: "text-foreground" },
          { label: "Đã bán", value: totals.sold, color: "text-green-600" },
          { label: "Trả về", value: totals.returned, color: "text-orange-500" },
          { label: "Hư hỏng", value: totals.damaged, color: "text-destructive" },
        ].map(({ label, value, color = "text-foreground" }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-0.5 rounded-lg border border-border bg-white px-3 py-2.5 dark:bg-zinc-900"
          >
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground text-center">{label}</p>
          </div>
        ))}
      </div>

      {/* Items table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Giá bán</TableHead>
              <TableHead className="text-center">SL gửi</TableHead>
              <TableHead className="text-center">Đã bán</TableHead>
              <TableHead className="text-center">Trả về</TableHead>
              <TableHead className="text-center">Hư hỏng</TableHead>
              <TableHead className="text-right">Còn lại</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consignment.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-sm text-muted-foreground">
                  Không có sản phẩm nào.
                </TableCell>
              </TableRow>
            ) : (
              consignment.items.map((item, idx) => {
                const product = getProduct(item.productId);
                const remaining =
                  item.quantitySent -
                  item.quantitySold -
                  item.quantityReturned -
                  item.quantityDamaged;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm text-foreground">
                          {product?.name ?? item.productId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product?.sku ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {product ? formatCurrency(product.price) : "—"}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">
                      {item.quantitySent}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium text-green-600">
                      {item.quantitySold}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium text-orange-500">
                      {item.quantityReturned}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium text-destructive">
                      {item.quantityDamaged}
                    </TableCell>
                    <TableCell
                      className={`text-right text-sm font-bold ${
                        remaining > 0 ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {remaining}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
