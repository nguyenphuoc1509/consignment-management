// app/api/consignors/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiCreated, apiError } from "@/lib/api/helpers";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const statusFilter = searchParams.get("statusFilter") ?? "";

  const consignors = await prisma.consignor.findMany({
    where: {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { contactPerson: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(statusFilter && { status: statusFilter as never }),
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(consignors);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name?.trim()) return apiError("Tên kho sản xuất là bắt buộc.", 400);
    if (!body.code?.trim()) return apiError("Mã kho là bắt buộc.", 400);

    const consignor = await prisma.consignor.create({
      data: {
        name: body.name.trim(),
        code: body.code.trim(),
        contactPerson: body.contactPerson?.trim() || undefined,
        phone: body.phone?.trim() || undefined,
        email: body.email?.trim() || undefined,
        address: body.address?.trim() || undefined,
        managerName: body.managerName?.trim() || undefined,
        managerPhone: body.managerPhone?.trim() || undefined,
        note: body.note?.trim() || undefined,
        status: body.status ?? "ACTIVE",
      },
    });

    return apiCreated(consignor);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi tạo kho sản xuất");
  }
}
