"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function QuickAction({
  label,
  icon: Icon,
  href,
  onClick,
  className,
}: QuickActionProps) {
  const content = (
    <>
      <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </div>
      <span className="text-xs font-medium text-foreground leading-tight text-center">
        {label}
      </span>
    </>
  );

  return (
    <>
      {href ? (
        <Link
          href={href}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-white p-4 text-center transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm dark:bg-zinc-900",
            className
          )}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-white p-4 text-center transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm dark:bg-zinc-900",
            className
          )}
        >
          {content}
        </button>
      )}
    </>
  );
}
