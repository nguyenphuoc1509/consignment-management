// app/api/stores/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiNotFound, apiNoContent } from "@/lib/api/helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) return apiNotFound("Không tìm thấy cửa hàng");
  return apiSuccess(store);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const store = await prisma.store.update({
      where: { id },
      data: body,
    });
    return apiSuccess(store);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi cập nhật cửa hàng");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.store.delete({ where: { id } });
    return apiNoContent();
  } catch {
    return apiNotFound("Không tìm thấy cửa hàng để xóa");
  }
}
