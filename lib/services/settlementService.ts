// lib/services/settlementService.ts
import prisma from "@/lib/prisma";
import { CommissionService } from "./commissionService";

function generateCode(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export interface CreateSettlementInput {
  consignmentId: string;
  dueDate?: Date;
  note?: string;
}

export class SettlementService {
  static async createSettlement(input: CreateSettlementInput) {
    const { consignmentId, dueDate, note } = input;

    const existing = await prisma.settlement.findUnique({
      where: { consignmentId },
    });

    if (existing && existing.status !== "CANCELLED") {
      throw new Error(
        `Consignment này đã có settlement (${existing.code}) ở trạng thái ${existing.status}`
      );
    }

    const summary = await CommissionService.calculateConsignmentSettlement(consignmentId);

    const settlement = await prisma.settlement.create({
      data: {
        code: generateCode("ST"),
        consignmentId,
        totalSoldQuantity: summary.totalSoldQuantity,
        totalReturnedQuantity: summary.totalReturnedQuantity,
        totalDamagedQuantity: summary.totalDamagedQuantity,
        dueDate,
        note,
        settledAt: new Date(),
      },
    });

    return { settlement, summary };
  }

  static async approve(settlementId: string, approvedBy: number) {
    const settlement = await prisma.settlement.findUniqueOrThrow({
      where: { id: settlementId },
    });

    if (settlement.status !== "PENDING") {
      throw new Error(`Chỉ settlement ở trạng thái PENDING mới có thể duyệt (hiện tại: ${settlement.status})`);
    }

    return prisma.settlement.update({
      where: { id: settlementId },
      data: {
        status: "CONFIRMED",
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  static async markPaid(settlementId: string) {
    return prisma.$transaction(async (tx) => {
      const settlement = await tx.settlement.findUniqueOrThrow({
        where: { id: settlementId },
      });

      if (settlement.status === "CANCELLED") {
        throw new Error("Không thể thanh toán settlement đã huỷ");
      }

      if (settlement.status === "PENDING") {
        throw new Error("Settlement cần được duyệt (CONFIRMED) trước khi thanh toán");
      }

      if (settlement.status === "PAID") {
        throw new Error("Settlement này đã được thanh toán");
      }

      const [updatedSettlement, updatedConsignment] = await Promise.all([
        tx.settlement.update({
          where: { id: settlementId },
          data: { status: "PAID", paidAt: new Date() },
        }),
        tx.consignment.update({
          where: { id: settlement.consignmentId },
          data: { status: "SETTLED", actualReturnDate: new Date() },
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
        throw new Error("Không thể huỷ settlement đã thanh toán");
      }

      const [cancelledSettlement, updatedConsignment] = await Promise.all([
        tx.settlement.update({
          where: { id: settlementId },
          data: { status: "CANCELLED" },
        }),
        tx.consignment.update({
          where: { id: settlement.consignmentId },
          data: { status: "COMPLETED" },
        }),
      ]);

      return { settlement: cancelledSettlement, consignment: updatedConsignment };
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

    const summary = await CommissionService.calculateConsignmentSettlement(
      settlement.consignmentId
    );

    return { settlement, breakdown: summary };
  }
}