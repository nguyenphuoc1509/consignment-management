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
import { SaleWithDetails, saleDisplayCode } from "@/types/sale";

interface SaleDeleteDialogProps {
  target: SaleWithDetails | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function SaleDeleteDialog({
  target,
  onClose,
  onConfirm,
}: SaleDeleteDialogProps) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            Xác nhận xóa giao dịch
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa giao dịch &ldquo;{target ? saleDisplayCode(target) : ""}&rdquo;?
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xóa giao dịch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
