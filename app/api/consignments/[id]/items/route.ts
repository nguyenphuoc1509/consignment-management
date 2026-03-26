// app/api/consignments/[id]/items/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiCreated, apiError, apiNotFound } from "@/lib/api/helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const items = await prisma.consignmentItem.findMany({
    where: { consignmentId: id },
    include: { product: { select: { name: true, sku: true } } },
    orderBy: { createdAt: "asc" },
  });
  return apiSuccess(items);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: consignmentId } = await params;
    const body = await req.json();

    const item = await prisma.consignmentItem.create({
      data: {
        consignmentId,
        productId: body.productId,
        quantitySent: body.quantitySent,
      },
      include: { product: { select: { name: true, sku: true } } },
    });

    return apiCreated(item);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi thêm sản phẩm vào ký gửi");
  }
}
