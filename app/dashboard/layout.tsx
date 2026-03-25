"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import AdminHeader from "@/components/dashboard/AdminHeader";

const pageTitles: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/dashboard/products": "Sản phẩm",
  "/dashboard/consignors": "Bên giao hàng",
  "/dashboard/stores": "Cửa hàng",
  "/dashboard/consignments": "Ký gửi",
  "/dashboard/sales": "Bán hàng",
  "/dashboard/settlements": "Đối soát",
  "/dashboard/reports": "Báo cáo",
  "/dashboard/settings": "Cài đặt",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Tổng quan";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar — fixed on mobile, static on desktop */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          title={title}
          onMenuToggle={() => setSidebarOpen((v: boolean) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
