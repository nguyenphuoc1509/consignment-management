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
    const { items, warehouseId, ...data } = body;

    if (data.sentDate) data.sentDate = new Date(data.sentDate);
    if (data.expectedReturnDate) data.expectedReturnDate = new Date(data.expectedReturnDate);

    const existing = await prisma.consignment.findUnique({
      where: { id },
      include: { consignmentItems: true },
    });

    if (!existing) return apiNotFound("Không tìm thấy ký gửi");

    const consignment = await prisma.$transaction(async (tx) => {
      if (items?.length > 0 && existing.warehouseId) {
        for (const item of items) {
          const existingItem = existing.consignmentItems.find(
            (ei) => ei.productId === item.productId
          );
          const oldQty = existingItem?.quantitySent ?? 0;
          const newQty = item.quantitySent ?? oldQty;
          const diff = newQty - oldQty;

          if (diff !== 0) {
            await tx.warehouseInventory.upsert({
              where: {
                warehouseId_productId: {
                  warehouseId: existing.warehouseId,
                  productId: item.productId,
                },
              },
              create: {
                warehouseId: existing.warehouseId,
                productId: item.productId,
                quantity: 0,
                reserved: 0,
              },
              update: {
                quantity: { increment: -diff },
              },
            });

            await tx.consignmentItem.updateMany({
              where: { consignmentId: id, productId: item.productId },
              data: { quantitySent: newQty },
            });
          }
        }
      }

      const updated = await tx.consignment.update({
        where: { id },
        data,
        include: {
          consignor: { select: { name: true } },
          store: { select: { name: true } },
          warehouse: { select: { name: true } },
          consignmentItems: true,
        },
      });

      return updated;
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

    const consignment = await prisma.consignment.findUnique({
      where: { id },
      select: { status: true, code: true },
    });

    if (!consignment) return apiNotFound("Không tìm thấy ký gửi để xóa");

    if (consignment.status !== "DRAFT") {
      return apiError(
        `Không thể xóa lô ký gửi đã gửi. Chỉ có thể xóa lô ở trạng thái Nháp.`
      );
    }

    await prisma.consignment.delete({ where: { id } });
    return apiNoContent();
  } catch {
    return apiNotFound("Không tìm thấy ký gửi để xóa");
  }
}
