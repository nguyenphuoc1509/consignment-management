// app/api/products/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiNotFound, apiNoContent } from "@/lib/api/helpers";

function serializeProduct(p: Record<string, unknown>) {
  return {
    ...p,
    price: Number(p.price),
    createdAt: (p.createdAt as Date).toISOString(),
    updatedAt: (p.updatedAt as Date).toISOString(),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return apiNotFound("Không tìm thấy sản phẩm");
  return apiSuccess(serializeProduct(product as unknown as Record<string, unknown>));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { consignorId: _removed, ...data } = body;
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    return apiSuccess(serializeProduct(product as unknown as Record<string, unknown>));
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi cập nhật sản phẩm");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return apiNoContent();
  } catch {
    return apiNotFound("Không tìm thấy sản phẩm để xóa");
  }
}
