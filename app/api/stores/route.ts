// app/api/stores/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiCreated, apiError, apiNoContent } from "@/lib/api/helpers";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const statusFilter = searchParams.get("statusFilter") ?? "";

  const stores = await prisma.store.findMany({
    where: {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
          { ward: { contains: search, mode: "insensitive" } },
          { district: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { contactPerson: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(statusFilter && { status: statusFilter as never }),
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(stores);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = await prisma.store.create({ data: body });
    return apiCreated(store);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi tạo cửa hàng");
  }
}
