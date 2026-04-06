// app/api/settlements/route.ts
import { NextRequest } from "next/server";
import { SettlementService } from "@/lib/services/settlementService";
import { apiSuccess, apiError } from "@/lib/api/helpers";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const statusFilter = searchParams.get("statusFilter") ?? "";
  const storeFilter = searchParams.get("storeFilter") ?? "";
  const consignorFilter = searchParams.get("consignorFilter") ?? "";
  const consignmentFilter = searchParams.get("consignmentFilter") ?? "";

  const settlements = await prisma.settlement.findMany({
    where: {
      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { consignment: { code: { contains: search, mode: "insensitive" } } },
          { consignment: { consignor: { name: { contains: search, mode: "insensitive" } } } },
          { consignment: { store: { name: { contains: search, mode: "insensitive" } } } },
        ],
      }),
      ...(statusFilter && { status: statusFilter as never }),
      ...(consignorFilter && { consignment: { consignorId: consignorFilter } }),
      ...(storeFilter && { consignment: { storeId: storeFilter } }),
      ...(consignmentFilter && { consignmentId: consignmentFilter }),
    },
    include: {
      consignment: {
        select: {
          code: true,
          consignor: { select: { name: true } },
          store: { select: { name: true } },
          sales: { select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const enriched = settlements.map((s) => ({
    ...s,
    consignmentCode: s.consignment.code,
    consignorName: s.consignment.consignor.name,
    storeName: s.consignment.store.name,
    saleCount: s.consignment.sales.length,
    totalSalesAmount: s.totalSalesAmount,
    totalPayableAmount: s.totalPayableAmount,
  }));

  return apiSuccess(enriched);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await SettlementService.createSettlement(body);
    return apiSuccess(result, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("đã có settlement")) {
      return apiError(err.message, 409);
    }
    return apiError(err instanceof Error ? err.message : "Lỗi khi tạo đối toán");
  }
}
