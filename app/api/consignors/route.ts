// app/api/consignors/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiCreated, apiError, apiNoContent } from "@/lib/api/helpers";

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

    const data = {
      // Map from old field name used by the form
      name: body.companyName ?? body.name,
      code: body.code,
      contactPerson: body.contactPerson,
      phone: body.phone,
      email: body.email,
      address: body.address,
      type: body.type ?? "EXTERNAL",
      managerName: body.managerName,
      managerPhone: body.managerPhone,
      note: body.note,
      status: body.status ?? "ACTIVE",
    };

    const consignor = await prisma.consignor.create({ data });
    return apiCreated(consignor);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi tạo đối tác");
  }
}
