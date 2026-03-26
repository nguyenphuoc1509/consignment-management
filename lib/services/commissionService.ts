// lib/services/commissionService.ts
import prisma from "@/lib/prisma";

export interface SettlementSummary {
  totalSoldQuantity: number;
  totalReturnedQuantity: number;
  totalDamagedQuantity: number;
  totalSoldAmount: number; // tổng doanh số = sum(quantity * soldPrice)
  breakdown: {
    saleId: string;
    productId: string;
    productName: string;
    quantity: number;
    soldPrice: number;
    soldAmount: number;
  }[];
}

export class CommissionService {
  static async calculateConsignmentSettlement(
    consignmentId: string
  ): Promise<SettlementSummary> {
    const sales = await prisma.sale.findMany({
      where: { consignmentId, status: "CONFIRMED" },
      include: { product: { select: { name: true } } },
    });

    const itemSummaries = await prisma.consignmentItem.findMany({
      where: { consignmentId },
      select: { quantityReturned: true, quantityDamaged: true },
    });

    let totalSoldQuantity = 0;
    let totalSoldAmount = 0;
    const breakdown: SettlementSummary["breakdown"] = [];

    for (const sale of sales) {
      const soldPriceNum = Number(sale.soldPrice);
      totalSoldQuantity += sale.quantity;
      totalSoldAmount += soldPriceNum * sale.quantity;

      breakdown.push({
        saleId: sale.id,
        productId: sale.productId,
        productName: sale.product.name,
        quantity: sale.quantity,
        soldPrice: soldPriceNum,
        soldAmount: soldPriceNum * sale.quantity,
      });
    }

    const totalReturnedQuantity = itemSummaries.reduce(
      (sum, item) => sum + item.quantityReturned,
      0
    );
    const totalDamagedQuantity = itemSummaries.reduce(
      (sum, item) => sum + item.quantityDamaged,
      0
    );

    return {
      totalSoldQuantity,
      totalReturnedQuantity,
      totalDamagedQuantity,
      totalSoldAmount,
      breakdown,
    };
  }

  static async previewSettlement(consignmentId: string): Promise<SettlementSummary> {
    return this.calculateConsignmentSettlement(consignmentId);
  }
}