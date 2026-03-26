// app/api/consignments/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiNotFound, apiNoContent } from "@/lib/api/helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const consignment = await prisma.consignment.findUnique({
    where: { id },
    include: {
      consignor: true,
      store: true,
      consignmentItems: {
        include: { product: { select: { name: true, sku: true } } },
      },
      sales: {
        select: {
          id: true,
          quantity: true,
          soldPrice: true,
          soldAt: true,
          status: true,
        },
        orderBy: { soldAt: "desc" },
      },
      settlement: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!consignment) return apiNotFound("Không tìm thấy ký gửi");

  return apiSuccess(consignment);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { items, ...data } = body;

    if (data.sentDate) data.sentDate = new Date(data.sentDate);
    if (data.expectedReturnDate) data.expectedReturnDate = new Date(data.expectedReturnDate);

    const consignment = await prisma.consignment.update({
      where: { id },
      data,
      include: {
        consignor: { select: { name: true } },
        store: { select: { name: true } },
        consignmentItems: true,
      },
    });

    return apiSuccess(consignment);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi cập nhật ký gửi");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.consignment.delete({ where: { id } });
    return apiNoContent();
  } catch {
    return apiNotFound("Không tìm thấy ký gửi để xóa");
  }
}
