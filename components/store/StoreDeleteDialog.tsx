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
import { Store } from "@/types/store";

interface StoreDeleteDialogProps {
  target: Store | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function StoreDeleteDialog({
  target,
  onClose,
  onConfirm,
}: StoreDeleteDialogProps) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            Xác nhận xóa cửa hàng
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa cửa hàng &ldquo;{target?.name}&rdquo;?
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xóa cửa hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
