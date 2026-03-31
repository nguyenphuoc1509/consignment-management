// app/api/revenue-reports/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  apiNotFound,
  apiNoContent,
} from "@/lib/api/helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await prisma.revenueReport.findUnique({
    where: { id },
    include: {
      store: { select: { name: true, code: true } },
      items: {
        include: {
          product: { select: { name: true, sku: true } },
          consignment: { select: { code: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      createdByUser: { select: { name: true } },
      auditLogs: {
        include: { performedByUser: { select: { name: true } } },
        orderBy: { performedAt: "desc" },
      },
    },
  });
  if (!report) return apiNotFound("Không tìm thấy báo cáo.");
  const enriched = {
    ...report,
    storeName: report.store.name,
    storeCode: report.store.code,
    totalAmount: report.items.reduce(
      (sum, i) => sum + Number(i.totalAmount),
      0
    ),
    totalQuantity: report.items.reduce((sum, i) => sum + i.quantity, 0),
    createdByName: report.createdByUser?.name,
    items: report.items.map((i) => ({
      ...i,
      productName: i.product.name,
      productSku: i.product.sku,
      consignmentCode: i.consignment.code,
      soldPrice: Number(i.soldPrice),
      totalAmount: Number(i.totalAmount),
    })),
    auditLogs: report.auditLogs.map((a) => ({
      ...a,
      performedByName: a.performedByUser?.name,
    })),
  };
  return apiSuccess(enriched);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.revenueReport.delete({ where: { id } });
    return apiNoContent();
  } catch {
    return apiNotFound("Không tìm thấy báo cáo để xóa.");
  }
}
