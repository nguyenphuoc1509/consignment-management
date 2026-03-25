import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ActivityStatus = "success" | "warning" | "info" | "neutral";

interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  status?: ActivityStatus;
  statusLabel?: string;
}

interface ActivityFeedProps {
  title?: string;
  items: ActivityItem[];
  className?: string;
}

const statusStyles: Record<ActivityStatus, string> = {
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  neutral: "bg-muted text-muted-foreground",
};

export function ActivityFeed({ title = "Hoạt động gần đây", items, className }: ActivityFeedProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      )}
      <div className="flex flex-col">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 py-3",
              index < items.length - 1 && "border-b border-border"
            )}
          >
            <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground leading-snug">
                  {item.title}
                </p>
                <span className="text-xs text-muted-foreground shrink-0">
                  {item.time}
                </span>
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  {item.description}
                </p>
              )}
              {item.status && (
                <Badge
                  variant="secondary"
                  className={cn("mt-1.5 text-[10px] px-1.5 py-0", statusStyles[item.status])}
                >
                  {item.statusLabel}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
