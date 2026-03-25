"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Báo cáo</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Phân tích và tổng hợp dữ liệu kinh doanh.
          </p>
        </div>
        <Button className="w-full sm:w-auto shrink-0">
          <FileText className="size-4" />
          Xuất báo cáo
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Chưa có báo cáo nào.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Dữ liệu sẽ hiển thị sau khi có sản phẩm ký gửi và bán hàng.
        </p>
      </div>
    </div>
  );
}
