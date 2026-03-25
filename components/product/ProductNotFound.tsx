"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductNotFoundProps {
  id: string;
}

export function ProductNotFound({ id }: ProductNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Package className="size-7 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">
          Không tìm thấy sản phẩm
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Sản phẩm với mã &quot;{id}&quot; không tồn tại.
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link href="/dashboard/products">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Quay lại danh sách
        </Link>
      </Button>
    </div>
  );
}
