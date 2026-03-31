"use client";

import { History, User, Clock, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { RevenueAuditLogWithUser } from "@/types/revenueReport";

const actionLabels: Record<string, string> = {
  CREATED: "Tạo báo cáo",
  UPDATED: "Cập nhật",
  ITEM_ADDED: "Thêm sản phẩm",
  ITEM_REMOVED: "Xóa sản phẩm",
  ITEM_UPDATED: "Cập nhật sản phẩm",
  STATUS_CHANGED: "Đổi trạng thái",
};

interface RevenueReportAuditLogDialogProps {
  open: boolean;
  onClose: () => void;
  auditLogs: RevenueAuditLogWithUser[];
  isLoading?: boolean;
}

export function RevenueReportAuditLogDialog({
  open,
  onClose,
  auditLogs,
  isLoading,
}: RevenueReportAuditLogDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Lịch sử thay đổi
          </DialogTitle>
          <DialogDescription>
            Theo dõi tất cả thay đổi được thực hiện trên báo cáo doanh thu này.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Đang tải...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Chưa có thay đổi nào được ghi nhận.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex gap-3 p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  {log.action === "CREATED" ? (
                    <Plus className="size-4 text-primary" />
                  ) : (
                    <History className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {actionLabels[log.action] ?? log.action}
                    </span>
                    {log.fieldChanged && (
                      <>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-xs text-muted-foreground">
                          Trường: <code className="text-xs bg-muted px-1 rounded">{log.fieldChanged}</code>
                        </span>
                      </>
                    )}
                  </div>
                  {(log.oldValue || log.newValue) && (
                    <div className="flex items-center gap-2 text-xs">
                      {log.oldValue != null && (
                        <span className="text-destructive line-through">
                          {log.oldValue}
                        </span>
                      )}
                      {log.oldValue != null && log.newValue != null && (
                        <span className="text-muted-foreground">→</span>
                      )}
                      {log.newValue != null && (
                        <span className="text-green-600 font-medium">
                          {log.newValue}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {log.performedByName && (
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {log.performedByName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatDate(log.performedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
