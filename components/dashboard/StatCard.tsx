import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-zinc-900",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <span className="text-3xl font-bold text-foreground">{value}</span>
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "text-xs font-semibold",
              trend.positive ? "text-green-600" : "text-red-500"
            )}
          >
            {trend.positive ? "+" : ""}
            {trend.value}
          </span>
          <span className="text-xs text-muted-foreground">so với tháng trước</span>
        </div>
      )}
    </div>
  );
}
