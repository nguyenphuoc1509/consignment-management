// app/api/stores/with-consignments/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api/helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";

    const stores = await prisma.store.findMany({
      where: {
        status: "ACTIVE",
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        consignments: {
          where: {
            status: { in: ["SHIPPED", "PARTIAL_SOLD", "COMPLETED"] },
          },
          include: {
            consignor: { select: { name: true } },
            consignmentItems: {
              include: {
                product: { select: { name: true, sku: true, price: true } },
              },
            },
          },
        },
        revenueReports: {
          select: {
            id: true,
            code: true,
            reportDate: true,
            status: true,
            items: { select: { quantity: true, totalAmount: true } },
          },
          orderBy: { reportDate: "desc" },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    const enriched = stores
      .filter((s) => s.consignments.length > 0)
      .map((s) => {
        const allItems = s.consignments.flatMap((c) => c.consignmentItems);
        const totalSent = allItems.reduce((sum, i) => sum + i.quantitySent, 0);
        const totalSold = allItems.reduce((sum, i) => sum + i.quantitySold, 0);
        const totalReturned = allItems.reduce(
          (sum, i) => sum + i.quantityReturned,
          0
        );
        const totalDamaged = allItems.reduce(
          (sum, i) => sum + i.quantityDamaged,
          0
        );
        const totalAvailable = allItems.reduce(
          (sum, i) =>
            sum +
            (i.quantitySent -
              i.quantitySold -
              i.quantityReturned -
              i.quantityDamaged),
          0
        );
        const lastReport = s.revenueReports[0];
        return {
          id: s.id,
          name: s.name,
          code: s.code,
          address: s.address,
          phone: s.phone,
          totalConsignments: s.consignments.length,
          totalSent,
          totalSold,
          totalReturned,
          totalDamaged,
          totalAvailable,
          totalRevenue: lastReport
            ? lastReport.items.reduce((sum, i) => sum + Number(i.totalAmount), 0)
            : 0,
          totalQuantityReported: lastReport
            ? lastReport.items.reduce((sum, i) => sum + i.quantity, 0)
            : 0,
          lastReportDate: lastReport?.reportDate ?? null,
          lastReportStatus: lastReport?.status ?? null,
          lastReportCode: lastReport?.code ?? null,
          consignments: s.consignments.map((c) => ({
            id: c.id,
            code: c.code,
            status: c.status,
            sentDate: c.sentDate,
            consignorName: c.consignor.name,
            items: c.consignmentItems.map((i) => ({
              id: i.id,
              productId: i.productId,
              productName: i.product.name,
              productSku: i.product.sku,
              price: Number(i.product.price),
              quantitySent: i.quantitySent,
              quantitySold: i.quantitySold,
              quantityReturned: i.quantityReturned,
              quantityDamaged: i.quantityDamaged,
              available:
                i.quantitySent -
                i.quantitySold -
                i.quantityReturned -
                i.quantityDamaged,
            })),
          })),
        };
      });

    return apiSuccess(enriched);
  } catch (err) {
    console.error("[/api/stores/with-consignments]", err);
    return apiError(err instanceof Error ? err.message : String(err), 500);
  }
}
