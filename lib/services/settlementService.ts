// lib/services/settlementService.ts
import prisma from "@/lib/prisma";
import { CommissionService } from "./commissionService";
import { Decimal } from "@prisma/client/runtime/library";
import { SettlementStatus } from "@prisma/client";

function generateCode(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export interface CreateSettlementInput {
  consignmentId: string;
  adjustmentAmount?: Decimal | number;
  adjustmentReason?: string;
  dueDate?: Date;
  note?: string;
}

export class SettlementService {
  static async createSettlement(input: CreateSettlementInput) {
    const { consignmentId, adjustmentAmount, adjustmentReason, dueDate, note } =
      input;

    const existing = await prisma.settlement.findUnique({
      where: { consignmentId },
    });

    if (existing && existing.status !== "CANCELLED") {
      throw new Error(
        `Consignment này đã có settlement (${existing.code}) ở trạng thái ${existing.status}`
      );
    }

    const commissionResult =
      await CommissionService.calculateConsignmentCommission(consignmentId);

    const adjAmount = adjustmentAmount
      ? new Decimal(adjustmentAmount)
      : new Decimal(0);

    const settlement = await prisma.settlement.create({
      data: {
        code: generateCode("ST"),
        consignmentId,
        totalSalesAmount: commissionResult.totalSalesAmount,
        totalCommissionAmount: commissionResult.totalCommissionAmount,
        totalPayableAmount: commissionResult.totalPayableAmount.add(adjAmount),
        totalQuantitySold: commissionResult.totalQuantitySold,
        totalQuantityReturned: commissionResult.totalQuantityReturned,
        totalQuantityDamaged: commissionResult.totalQuantityDamaged,
        adjustmentAmount: adjAmount,
        adjustmentReason,
        dueDate,
        note,
        settledAt: new Date(),
      },
    });

    return { settlement, commissionResult };
  }

  static async updateAdjustment(
    settlementId: string,
    adjustmentAmount: Decimal | number,
    adjustmentReason: string
  ) {
    const settlement = await prisma.settlement.findUniqueOrThrow({
      where: { id: settlementId },
    });

    if (settlement.status === "PAID") {
      throw new Error("Không thể điều chỉnh settlement đã thanh toán");
    }

    const adjAmount = new Decimal(adjustmentAmount);

    return prisma.settlement.update({
      where: { id: settlementId },
      data: {
        adjustmentAmount: adjAmount,
        adjustmentReason,
      },
    });
  }

  static async markPaid(settlementId: string) {
    return prisma.$transaction(async (tx) => {
      const settlement = await tx.settlement.findUniqueOrThrow({
        where: { id: settlementId },
      });

      if (settlement.status === "PAID") {
        throw new Error("Settlement này đã được thanh toán");
      }

      if (settlement.status === "CANCELLED") {
        throw new Error("Không thể thanh toán settlement đã huỷ");
      }

      const [updatedSettlement, updatedConsignment] = await Promise.all([
        tx.settlement.update({
          where: { id: settlementId },
          data: {
            status: SettlementStatus.PAID,
            paidAt: new Date(),
          },
        }),
        tx.consignment.update({
          where: { id: settlement.consignmentId },
          data: {
            status: "SETTLED",
            actualReturnDate: new Date(),
          },
        }),
      ]);

      return { settlement: updatedSettlement, consignment: updatedConsignment };
    });
  }

  static async cancelSettlement(settlementId: string) {
    return prisma.$transaction(async (tx) => {
      const settlement = await tx.settlement.findUniqueOrThrow({
        where: { id: settlementId },
      });

      if (settlement.status === "PAID") {
        throw new Error(
          "Không thể huỷ settlement đã thanh toán. Cần tạo settlement mới."
        );
      }

      const consignment = await tx.consignment.update({
        where: { id: settlement.consignmentId },
        data: { status: "COMPLETED" },
      });

      const cancelledSettlement = await tx.settlement.update({
        where: { id: settlementId },
        data: { status: "CANCELLED" },
      });

      return { settlement: cancelledSettlement, consignment };
    });
  }

  static async preview(consignmentId: string) {
    return CommissionService.previewSettlement(consignmentId);
  }

  static async getWithBreakdown(settlementId: string) {
    const settlement = await prisma.settlement.findUniqueOrThrow({
      where: { id: settlementId },
      include: { consignment: true },
    });

    const commissionResult =
      await CommissionService.calculateConsignmentCommission(
        settlement.consignmentId
      );

    return { settlement, breakdown: commissionResult.breakdown };
  }
}
