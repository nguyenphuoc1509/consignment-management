// app/api/settlements/[id]/route.ts
import { NextRequest } from "next/server";
import { SettlementService } from "@/lib/services/settlementService";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api/helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await SettlementService.getWithBreakdown(id);
  if (!result) return apiNotFound("Không tìm thấy đối toán");
  return apiSuccess(result);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { prisma } = await import("@/lib/prisma");

    if (body.action === "approve") {
      const settlement = await SettlementService.approve(id, body.approvedBy ?? 0);
      return apiSuccess(settlement);
    }

    if (body.action === "markPaid") {
      const result = await SettlementService.markPaid(id);
      return apiSuccess(result);
    }

    if (body.action === "cancel") {
      const result = await SettlementService.cancelSettlement(id);
      return apiSuccess(result);
    }

    // Generic update (note, dueDate, etc.)
    const settlement = await prisma.settlement.update({
      where: { id },
      data: body,
    });
    return apiSuccess(settlement);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi cập nhật đối toán");
  }
}
