// lib/services/commissionService.ts
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export interface SaleCommissionResult {
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  soldPrice: Decimal;
  grossAmount: Decimal;
  commissionRate: Decimal;
  commissionAmount: Decimal;
  payableAmount: Decimal;
}

export interface SettlementCommissionResult {
  totalSalesAmount: Decimal;
  totalCommissionAmount: Decimal;
  totalPayableAmount: Decimal;
  totalQuantitySold: number;
  totalQuantityReturned: number;
  totalQuantityDamaged: number;
  breakdown: SaleCommissionResult[];
}

export class CommissionService {
  static calculateSaleCommission(
    quantity: number,
    soldPrice: Decimal | number,
    commissionRate: Decimal | number
  ): { grossAmount: Decimal; commissionAmount: Decimal; payableAmount: Decimal } {
    const soldPriceNum =
      typeof soldPrice === "number" ? soldPrice : Number(soldPrice);
    const rateNum =
      typeof commissionRate === "number" ? commissionRate : Number(commissionRate);

    const grossAmount = new Decimal(soldPriceNum * quantity);
    const commissionAmount = grossAmount.mul(rateNum).round(2);
    const payableAmount = grossAmount.sub(commissionAmount);

    return { grossAmount, commissionAmount, payableAmount };
  }

  static async calculateConsignmentCommission(
    consignmentId: string
  ): Promise<SettlementCommissionResult> {
    const sales = await prisma.sale.findMany({
      where: {
        consignmentId,
        status: "COMPLETED",
      },
      include: {
        product: { select: { commissionRate: true, name: true } },
      },
    });

    const itemSummaries = await prisma.consignmentItem.findMany({
      where: { consignmentId },
      select: { quantityReturned: true, quantityDamaged: true },
    });

    let totalSalesAmount = new Decimal(0);
    let totalCommissionAmount = new Decimal(0);
    let totalPayableAmount = new Decimal(0);
    let totalQuantitySold = 0;

    const breakdown: SaleCommissionResult[] = sales.map((sale) => {
      const { grossAmount, commissionAmount, payableAmount } =
        this.calculateSaleCommission(
          sale.quantity,
          sale.soldPrice,
          sale.product.commissionRate
        );

      totalSalesAmount = totalSalesAmount.add(grossAmount);
      totalCommissionAmount = totalCommissionAmount.add(commissionAmount);
      totalPayableAmount = totalPayableAmount.add(payableAmount);
      totalQuantitySold += sale.quantity;

      return {
        saleId: sale.id,
        productId: sale.productId,
        productName: sale.product.name,
        quantity: sale.quantity,
        soldPrice: sale.soldPrice,
        grossAmount,
        commissionRate: sale.product.commissionRate,
        commissionAmount,
        payableAmount,
      };
    });

    const totalQuantityReturned = itemSummaries.reduce(
      (sum, item) => sum + item.quantityReturned,
      0
    );
    const totalQuantityDamaged = itemSummaries.reduce(
      (sum, item) => sum + item.quantityDamaged,
      0
    );

    return {
      totalSalesAmount,
      totalCommissionAmount,
      totalPayableAmount,
      totalQuantitySold,
      totalQuantityReturned,
      totalQuantityDamaged,
      breakdown,
    };
  }

  static async previewSettlement(
    consignmentId: string
  ): Promise<SettlementCommissionResult> {
    return this.calculateConsignmentCommission(consignmentId);
  }
}
