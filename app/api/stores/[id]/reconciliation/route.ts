// app/api/stores/[id]/reconciliation/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api/helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) return apiError("Không tìm thấy cửa hàng.", 404);

  // Fetch consignments for this store with their items
  const consignments = await prisma.consignment.findMany({
    where: {
      storeId: id,
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
    orderBy: { sentDate: "desc" },
  });

  const consignmentItemIds = consignments.flatMap((c) => c.consignmentItems.map((i) => i.id));
  const productIds = [...new Set(consignments.flatMap((c) => c.consignmentItems.map((i) => i.productId)))];

  // Fetch revenue reports for this store
  const revenueReports = await prisma.revenueReport.findMany({
    where: { storeId: id },
    include: {
      items: { select: { consignmentItemId: true, quantity: true } },
    },
  });

  // Build soldViaReport map: consignmentItemId -> total reported quantity
  const soldViaReportMap = new Map<string, number>();
  for (const report of revenueReports) {
    for (const item of report.items) {
      const prev = soldViaReportMap.get(item.consignmentItemId) ?? 0;
      soldViaReportMap.set(item.consignmentItemId, prev + item.quantity);
    }
  }

  // Fetch returns for products in these consignments
  const returns = await prisma.consignmentReturnItem.findMany({
    where: {
      consignmentReturn: {
        consignment: { storeId: id },
      },
      productId: { in: productIds },
    },
    include: {
      consignmentReturn: { select: { consignmentId: true } },
    },
  });

  // Map returns by productId
  const returnedByProductMap = new Map<string, { qty: number; condition: string }>();
  for (const item of returns) {
    const prev = returnedByProductMap.get(item.productId);
    if (prev) {
      prev.qty += item.quantity;
    } else {
      returnedByProductMap.set(item.productId, { qty: item.quantity, condition: item.condition });
    }
  }

  const result = {
    storeId: store.id,
    storeName: store.name,
    storeCode: store.code,
    consignments: consignments.map((c) => {
      const items = c.consignmentItems.map((i) => {
        const soldViaReport = soldViaReportMap.get(i.id) ?? 0;
        const returnedInfo = returnedByProductMap.get(i.productId);
        const returnedQty = returnedInfo?.qty ?? 0;
        const available =
          i.quantitySent - i.quantitySold - i.quantityReturned - i.quantityDamaged;
        const discrepancy = available - soldViaReport;
        return {
          consignmentItemId: i.id,
          productId: i.productId,
          productName: i.product.name,
          productSku: i.product.sku,
          price: Number(i.product.price),
          quantitySent: i.quantitySent,
          quantitySold: i.quantitySold,
          quantityReturned: i.quantityReturned,
          quantityDamaged: i.quantityDamaged,
          available,
          soldViaReport,
          discrepancy,
          returnedQty,
        };
      });

      const totalSent = items.reduce((sum, i) => sum + i.quantitySent, 0);
      const totalSold = items.reduce((sum, i) => sum + i.quantitySold, 0);
      const totalReturned = items.reduce((sum, i) => sum + i.quantityReturned, 0);
      const totalDamaged = items.reduce((sum, i) => sum + i.quantityDamaged, 0);
      const totalAvailable = items.reduce((sum, i) => sum + i.available, 0);

      return {
        consignmentId: c.id,
        consignmentCode: c.code,
        consignorName: c.consignor.name,
        sentDate: c.sentDate,
        status: c.status,
        items,
        totalSent,
        totalSold,
        totalReturned,
        totalDamaged,
        totalAvailable,
      };
    }),
    grandTotals: (() => {
      const allItems = consignments.flatMap((c) => c.consignmentItems);
      const totalSent = allItems.reduce((sum, i) => sum + i.quantitySent, 0);
      const totalSold = allItems.reduce((sum, i) => sum + i.quantitySold, 0);
      const totalReturned = allItems.reduce((sum, i) => sum + i.quantityReturned, 0);
      const totalDamaged = allItems.reduce((sum, i) => sum + i.quantityDamaged, 0);
      const totalAvailable = allItems.reduce(
        (sum, i) => sum + (i.quantitySent - i.quantitySold - i.quantityReturned - i.quantityDamaged),
        0
      );
      return { totalSent, totalSold, totalReturned, totalDamaged, totalAvailable };
    })(),
  };

  return apiSuccess(result);
}
