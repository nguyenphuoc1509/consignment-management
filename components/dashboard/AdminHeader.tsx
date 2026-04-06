"use client";

import { Bell, Search, ChevronDown, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import LogoutButton from "@/components/auth/LogoutButton";
import { useSession } from "next-auth/react";

export default function AdminHeader({
  title = "Tổng quan",
  onMenuToggle,
}: {
  title?: string;
  onMenuToggle?: () => void;
}) {
  const { data: session } = useSession();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-white px-4 sm:px-6 dark:bg-zinc-950">
      {/* Left side: hamburger + page title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Mở menu"
        >
          <Menu className="size-5" />
        </button>

        <h1 className="text-base font-semibold text-foreground leading-none sm:text-lg">
          {title}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search — hidden on small mobile */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Tìm kiếm..."
            className="w-48 md:w-64 pl-9 h-9 bg-accent/30 dark:bg-input/30"
          />
        </div>

        {/* Notifications */}
        <button className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Bell className="size-[18px]" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
        </button>

        {/* User menu */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium leading-none">
                {session?.user?.name ?? "Nguoi dung"}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize">
                {session?.user?.role?.toLowerCase() ?? "staff"}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
