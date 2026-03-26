// app/api/consignments/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiCreated, apiError, apiNotFound } from "@/lib/api/helpers";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const statusFilter = searchParams.get("statusFilter") ?? "";
  const consignorFilter = searchParams.get("consignorFilter") ?? "";
  const storeFilter = searchParams.get("storeFilter") ?? "";

  const consignments = await prisma.consignment.findMany({
    where: {
      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { consignor: { name: { contains: search, mode: "insensitive" } } },
          { store: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
      ...(statusFilter && { status: statusFilter as never }),
      ...(consignorFilter && { consignorId: consignorFilter }),
      ...(storeFilter && { storeId: storeFilter }),
    },
    include: {
      consignor: { select: { name: true } },
      store: { select: { name: true } },
      consignmentItems: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(consignments);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, ...consignmentData } = body;

    const consignment = await prisma.consignment.create({
      data: {
        ...consignmentData,
        sentDate: new Date(consignmentData.sentDate),
        expectedReturnDate: consignmentData.expectedReturnDate
          ? new Date(consignmentData.expectedReturnDate)
          : undefined,
        ...(items?.length > 0 && {
          consignmentItems: {
            create: items.map((item: { productId: string; quantitySent: number }) => ({
              productId: item.productId,
              quantitySent: item.quantitySent,
            })),
          },
        }),
      },
      include: {
        consignor: { select: { name: true } },
        store: { select: { name: true } },
        consignmentItems: true,
      },
    });

    return apiCreated(consignment);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi tạo ký gửi");
  }
}
