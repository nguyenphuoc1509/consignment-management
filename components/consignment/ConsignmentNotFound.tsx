"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConsignmentNotFoundProps {
  id: string;
}

export function ConsignmentNotFound({ id }: ConsignmentNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-white px-4 py-16 text-center dark:bg-zinc-900">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">
          Không tìm thấy lô ký gửi
        </h3>
        <p className="text-sm text-muted-foreground">
          Lô ký gửi với mã &ldquo;{id}&rdquo; không tồn tại hoặc đã bị xóa.
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard/consignments">Quay lại danh sách</Link>
      </Button>
    </div>
  );
}
