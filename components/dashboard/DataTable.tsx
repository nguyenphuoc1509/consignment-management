import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  columns: {
    key: string;
    label: string;
    className?: string;
  }[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  renderRow,
  emptyMessage = "Không có dữ liệu",
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-white dark:bg-zinc-900", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-accent/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id ?? index}
                  className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                >
                  {renderRow(item, index)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
