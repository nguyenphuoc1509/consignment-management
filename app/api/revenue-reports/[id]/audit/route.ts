// app/api/revenue-reports/[id]/audit/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api/helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, fieldChanged, oldValue, newValue } = body;

    const report = await prisma.revenueReport.findUnique({ where: { id } });
    if (!report) {
      return apiError("Không tìm thấy báo cáo.", 404);
    }

    const auditLog = await prisma.revenueAuditLog.create({
      data: {
        revenueReportId: id,
        action,
        fieldChanged,
        oldValue: oldValue != null ? String(oldValue) : null,
        newValue: newValue != null ? String(newValue) : null,
      },
      include: {
        performedByUser: { select: { name: true } },
      },
    });

    const enriched = {
      ...auditLog,
      performedByName: auditLog.performedByUser?.name ?? undefined,
    };

    return apiSuccess(enriched);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi ghi log.");
  }
}
