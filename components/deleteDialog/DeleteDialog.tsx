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

export interface DeletableItem {
  id: string;
  name?: string;
  code?: string;
}

interface DeleteDialogProps<T extends DeletableItem> {
  target: T | null;
  itemLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDialog<T extends DeletableItem>({
  target,
  itemLabel,
  onClose,
  onConfirm,
}: DeleteDialogProps<T>) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            Xác nhận xóa {itemLabel}
          </DialogTitle>
          <DialogDescription className="text-md">
            Bạn có chắc chắn muốn xóa &ldquo;
            <strong className="text-foreground">
              {target?.name}
            </strong>
            &rdquo;? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="mr-4">
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xóa {itemLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
