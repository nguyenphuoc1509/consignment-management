// app/api/consignors/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiNotFound, apiNoContent } from "@/lib/api/helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const consignor = await prisma.consignor.findUnique({
    where: { id },
    include: { warehouses: { select: { id: true } } },
  });
  if (!consignor) return apiNotFound("Không tìm thấy đối tác");
  return apiSuccess(consignor);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.code !== undefined) data.code = body.code;
    if (body.contactPerson !== undefined) data.contactPerson = body.contactPerson;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;
    if (body.address !== undefined) data.address = body.address;
    if (body.managerName !== undefined) data.managerName = body.managerName;
    if (body.managerPhone !== undefined) data.managerPhone = body.managerPhone;
    if (body.note !== undefined) data.note = body.note;
    if (body.status !== undefined) data.status = body.status;

    const consignor = await prisma.consignor.update({
      where: { id },
      data,
    });
    return apiSuccess(consignor);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi cập nhật đối tác");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.consignor.delete({ where: { id } });
    return apiNoContent();
  } catch {
    return apiNotFound("Không tìm thấy đối tác để xóa");
  }
}
