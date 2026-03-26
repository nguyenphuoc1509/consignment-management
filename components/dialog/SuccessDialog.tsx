"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SuccessDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}

export function SuccessDialog({
  open,
  title = "Thành công",
  message,
  onClose,
}: SuccessDialogProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <CheckCircle2 className="size-12 text-green-500 mb-2" />
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {message && (
            <DialogDescription className="text-center text-sm">
              {message}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} className="min-w-[120px]">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
