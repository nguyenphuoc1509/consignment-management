"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Store,
  ArrowLeftRight,
  ShoppingCart,
  Receipt,
  BarChart3,
  Settings,
  ChevronDown,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Sản phẩm", icon: Package },
  { href: "/dashboard/consignors", label: "Kho cung cấp", icon: Warehouse },
  { href: "/dashboard/stores", label: "Cửa hàng", icon: Store },
  { href: "/dashboard/consignments", label: "Ký gửi", icon: ArrowLeftRight },
  { href: "/dashboard/sales", label: "Bán hàng", icon: ShoppingCart },
  { href: "/dashboard/settlements", label: "Đối soát", icon: Receipt },
  { href: "/dashboard/reports", label: "Báo cáo", icon: BarChart3 },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay backdrop — only on mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white dark:bg-zinc-950
          transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto lg:shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Logo / Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-2.5 border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ArrowLeftRight className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight text-foreground">
                ConsignPro
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                Quản lý ký gửi
              </span>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-[18px] shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-border px-3 py-4">
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Settings className="size-[18px] shrink-0" />
            Cài đặt
          </Link>

          {/* User card */}
          <div className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5 bg-accent/50">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              NV
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight truncate text-foreground">
                Nguyễn Văn Admin
              </p>
              <p className="text-xs text-muted-foreground leading-tight truncate">
                admin@consignpro.vn
              </p>
            </div>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </div>
        </div>
      </aside>
    </>
  );
}
