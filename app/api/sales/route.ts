// app/api/sales/route.ts
import { NextRequest } from "next/server";
import { SaleService, CreateSaleInput } from "@/lib/services/saleService";
import { apiSuccess, apiError } from "@/lib/api/helpers";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const consignmentId = searchParams.get("consignmentId") ?? "";

  if (consignmentId) {
    const sales = await SaleService.getSalesByConsignment(consignmentId);
    return apiSuccess(sales);
  }

  // For all sales, build enriched list
  const { prisma } = await import("@/lib/prisma");
  const search = searchParams.get("search") ?? "";
  const statusFilter = searchParams.get("statusFilter") ?? "";
  const storeFilter = searchParams.get("storeFilter") ?? "";

  const sales = await prisma.sale.findMany({
    where: {
      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { consignment: { code: { contains: search, mode: "insensitive" } } },
          { product: { name: { contains: search, mode: "insensitive" } } },
          { store: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
      ...(statusFilter && { status: statusFilter as never }),
      ...(storeFilter && { storeId: storeFilter }),
    },
    include: {
      product: { select: { name: true, sku: true } },
      store: { select: { name: true } },
      consignment: {
        select: {
          code: true,
          consignor: { select: { name: true } },
        },
      },
    },
    orderBy: { soldAt: "desc" },
  });

  const enriched = sales.map((s) => ({
    ...s,
    consignmentCode: s.consignment.code,
    consignorName: s.consignment.consignor.name,
    productName: s.product.name,
    productSku: s.product.sku,
    storeName: s.store.name,
  }));

  return apiSuccess(enriched);
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateSaleInput = await req.json();
    const result = await SaleService.createSale(body);
    return apiSuccess(result, { status: 201 });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi ghi nhận bán");
  }
}
