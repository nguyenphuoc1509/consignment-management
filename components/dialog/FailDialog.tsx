"use client";

import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FailDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}

export function FailDialog({
  open,
  title = "Thất bại",
  message,
  onClose,
}: FailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <XCircle className="size-12 text-destructive mb-2" />
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {message && (
            <DialogDescription className="text-center text-sm text-destructive">
              {message}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={onClose} className="min-w-[120px]">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
