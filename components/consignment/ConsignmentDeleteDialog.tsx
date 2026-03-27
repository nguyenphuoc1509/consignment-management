"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConsignmentWithItems } from "@/types/consignment";

interface ConsignmentDeleteDialogProps {
  target: ConsignmentWithItems | null;
  onClose: () => void;
  onConfirm: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Nháp",
  SHIPPED: "Đã gửi",
  PARTIAL_SOLD: "Bán một phần",
  COMPLETED: "Hoàn thành",
  RETURNED: "Đã trả về",
  SETTLED: "Đã đối soát",
  CANCELLED: "Đã hủy",
};

export function ConsignmentDeleteDialog({
  target,
  onClose,
  onConfirm,
}: ConsignmentDeleteDialogProps) {
  const isDeletable = target?.status === "DRAFT";
  const statusLabel = target?.status ? STATUS_LABEL[target.status] ?? target.status : "";

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            Xác nhận xóa lô ký gửi
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa lô ký gửi &ldquo;{target?.code}&rdquo;?
            Hành động này không thể hoàn tác.
            {target && !isDeletable && (
              <span className="mt-2 block font-medium text-destructive">
                Chỉ có thể xóa lô ở trạng thái Nháp. Lô này đang ở trạng thái &ldquo;{statusLabel}&rdquo;.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            {isDeletable ? "Hủy" : "Đóng"}
          </Button>
          {isDeletable && (
            <Button variant="destructive" onClick={onConfirm}>
              Xóa lô ký gửi
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
