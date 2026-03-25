"use client";

import Link from "next/link";
import {
  Package,
  ArrowLeftRight,
  ShoppingCart,
  DollarSign,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Plus,
  Upload,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickAction } from "@/components/dashboard/QuickAction";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stats = [
  {
    title: "Tổng sản phẩm",
    value: "1,248",
    description: "Đang hoạt động",
    icon: Package,
    trend: { value: "12%", positive: true },
  },
  {
    title: "Lô ký gửi",
    value: "86",
    description: "Đang xử lý",
    icon: ArrowLeftRight,
    trend: { value: "5", positive: true },
  },
  {
    title: "Sản phẩm đang ký gửi",
    value: "3,521",
    description: "Tại các cửa hàng",
    icon: ShoppingBag,
    trend: { value: "8%", positive: true },
  },
  {
    title: "Đơn hàng tháng này",
    value: "412",
    description: "Tháng 3/2026",
    icon: ShoppingCart,
    trend: { value: "23%", positive: true },
  },
  {
    title: "Doanh thu tháng",
    value: "124.5M",
    description: "Tăng 18% so với tháng trước",
    icon: DollarSign,
    trend: { value: "18%", positive: true },
  },
  {
    title: "Chờ đối soát",
    value: "38.2M",
    description: "18 lô ký gửi",
    icon: Receipt,
    trend: { value: "4", positive: false },
  },
];

const recentConsignments = [
  {
    id: "KG-2026-001",
    consignor: "Công ty TNHH Thời Trang My",
    store: "Chi nhánh Quận 1",
    products: 24,
    totalQty: 120,
    sentDate: "20/03/2026",
    status: "active" as const,
  },
  {
    id: "KG-2026-002",
    consignor: "Hãng Giày Dép VietShoes",
    store: "Chi nhánh Quận 3",
    products: 12,
    totalQty: 60,
    sentDate: "18/03/2026",
    status: "active" as const,
  },
  {
    id: "KG-2026-003",
    consignor: "Cửa hàng Phụ Kiện H&L",
    store: "Chi nhánh Quận 5",
    products: 8,
    totalQty: 45,
    sentDate: "15/03/2026",
    status: "settled" as const,
  },
  {
    id: "KG-2026-004",
    consignor: "Công ty TNHH Thời Trang My",
    store: "Chi nhánh Quận 7",
    products: 30,
    totalQty: 150,
    sentDate: "12/03/2026",
    status: "active" as const,
  },
  {
    id: "KG-2026-005",
    consignor: "Hãng Giày Dép VietShoes",
    store: "Chi nhánh Bình Thạnh",
    products: 15,
    totalQty: 75,
    sentDate: "10/03/2026",
    status: "partial" as const,
  },
];

const recentActivities = [
  {
    id: "1",
    title: "Bán 5 sản phẩm áo sơ mi",
    description: "Chi nhánh Quận 1 — KG-2026-001",
    time: "10 phút trước",
    status: "success" as const,
    statusLabel: "Đã bán",
  },
  {
    id: "2",
    title: "Tạo lô ký gửi KG-2026-006",
    description: "Công ty TNHH Thời Trang My gửi 18 sản phẩm đến Quận 10",
    time: "1 giờ trước",
    status: "info" as const,
    statusLabel: "Mới tạo",
  },
  {
    id: "3",
    title: "Đối soát tháng 2/2026",
    description: "Đã thanh toán cho 4 bên giao hàng — tổng 42.5M",
    time: "3 giờ trước",
    status: "success" as const,
    statusLabel: "Hoàn thành",
  },
  {
    id: "4",
    title: "Cảnh báo: 3 sản phẩm hết hàng",
    description: "Tại Chi nhánh Quận 3 — Hãng Giày VietShoes",
    time: "5 giờ trước",
    status: "warning" as const,
    statusLabel: "Cảnh báo",
  },
  {
    id: "5",
    title: "Thêm cửa hàng mới",
    description: "Chi nhánh Thủ Đức — 123 Đại lộ Thủ Đức",
    time: "1 ngày trước",
    status: "neutral" as const,
    statusLabel: "Mới",
  },
];

const statusBadge: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Đang ký gửi", variant: "default" },
  settled: { label: "Đã đối soát", variant: "secondary" },
  partial: { label: "Một phần", variant: "outline" },
};

export default function DashboardPage() {
  return (
    <div>Dashboard</div>
    // <div className="flex flex-col gap-6">
    //   {/* Page header */}
    //   <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    //     <div>
    //       <h2 className="text-2xl font-bold text-foreground">Chào buổi sáng!</h2>
    //       <p className="text-sm text-muted-foreground mt-0.5">
    //         Đây là tổng quan hoạt động kinh doanh hôm nay.
    //       </p>
    //     </div>
    //     <div className="flex items-center gap-2">
    //       <Button variant="outline" size="sm" asChild>
    //         <Link href="/dashboard/reports">
    //           <TrendingUp className="size-4" />
    //           Xem báo cáo
    //         </Link>
    //       </Button>
    //       <Button size="sm" asChild>
    //         <Link href="/dashboard/consignments">
    //           <Plus className="size-4" />
    //           Tạo ký gửi
    //         </Link>
    //       </Button>
    //     </div>
    //   </div>

    //   {/* Stat cards */}
    //   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
    //     {stats.map((stat) => (
    //       <StatCard key={stat.title} {...stat} />
    //     ))}
    //   </div>

    //   {/* Quick actions */}
    //   <div className="flex flex-col gap-3">
    //     <h3 className="text-sm font-semibold text-foreground">Thao tác nhanh</h3>
    //     <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
    //       <QuickAction label="Tạo ký gửi" icon={Plus} href="/dashboard/consignments" />
    //       <QuickAction label="Ghi nhận bán" icon={ShoppingCart} href="/dashboard/sales" />
    //       <QuickAction label="Nhập sản phẩm" icon={Upload} href="/dashboard/products/add" />
    //       <QuickAction label="Đối soát" icon={Receipt} href="/dashboard/settlements" />
    //       <QuickAction label="Sản phẩm" icon={Package} href="/dashboard/products" />
    //       <QuickAction label="Bên giao hàng" icon={ArrowLeftRight} href="/dashboard/consignors" />
    //       <QuickAction label="Cửa hàng" icon={ShoppingBag} href="/dashboard/stores" />
    //       <QuickAction label="Báo cáo" icon={TrendingUp} href="/dashboard/reports" />
    //     </div>
    //   </div>

    //   {/* Bottom section: table + activity */}
    //   <div className="grid gap-6 lg:grid-cols-5">
    //     {/* Recent consignments */}
    //     <div className="flex flex-col gap-3 lg:col-span-3">
    //       <div className="flex items-center justify-between">
    //         <h3 className="text-sm font-semibold text-foreground">
    //           Lô ký gửi gần đây
    //         </h3>
    //         <Button variant="ghost" size="sm" asChild>
    //           <Link href="/dashboard/consignments" className="text-xs gap-1">
    //             Xem tất cả <ArrowRight className="size-3" />
    //           </Link>
    //         </Button>
    //       </div>
    //       <div className="rounded-xl border border-border bg-white dark:bg-zinc-900 overflow-hidden">
    //         <Table>
    //           <TableHeader>
    //             <TableRow>
    //               <TableHead>Mã lô</TableHead>
    //               <TableHead>Bên giao</TableHead>
    //               <TableHead>Cửa hàng</TableHead>
    //               <TableHead className="text-center">Sản phẩm</TableHead>
    //               <TableHead className="text-center">SL</TableHead>
    //               <TableHead>Ngày gửi</TableHead>
    //               <TableHead>Trạng thái</TableHead>
    //             </TableRow>
    //           </TableHeader>
    //           <TableBody>
    //             {recentConsignments.map((item) => (
    //               <TableRow key={item.id}>
    //                 <TableCell className="font-medium text-xs">{item.id}</TableCell>
    //                 <TableCell className="text-xs max-w-[140px] truncate">
    //                   {item.consignor}
    //                 </TableCell>
    //                 <TableCell className="text-xs max-w-[120px] truncate">
    //                   {item.store}
    //                 </TableCell>
    //                 <TableCell className="text-center text-xs">{item.products}</TableCell>
    //                 <TableCell className="text-center text-xs">{item.totalQty}</TableCell>
    //                 <TableCell className="text-xs text-muted-foreground">
    //                   {item.sentDate}
    //                 </TableCell>
    //                 <TableCell>
    //                   <Badge variant={statusBadge[item.status].variant}>
    //                     {statusBadge[item.status].label}
    //                   </Badge>
    //                 </TableCell>
    //               </TableRow>
    //             ))}
    //           </TableBody>
    //         </Table>
    //       </div>
    //     </div>

    //     {/* Activity feed */}
    //     <div className="flex flex-col gap-3 lg:col-span-2 rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
    //       <ActivityFeed items={recentActivities} />
    //     </div>
    //   </div>
    // </div>
  );
}
