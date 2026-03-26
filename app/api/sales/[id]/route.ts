// app/api/sales/[id]/route.ts
import { NextRequest } from "next/server";
import { SaleService } from "@/lib/services/saleService";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api/helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sale = await SaleService.getSaleWithDetails(id);
  if (!sale) return apiNotFound("Không tìm thấy bán");
  return apiSuccess(sale);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { prisma } = await import("@/lib/prisma");
    await prisma.sale.delete({ where: { id } });
    return apiSuccess({ id });
  } catch {
    return apiNotFound("Không tìm thấy bán để xóa");
  }
}
