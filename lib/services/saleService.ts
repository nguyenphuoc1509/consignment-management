// lib/services/saleService.ts
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { InventoryService } from "./inventoryService";
import { CommissionService } from "./commissionService";
import { ConsignmentService } from "./consignmentService";

function generateSaleCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `SALE-${timestamp}-${random}`;
}

export interface CreateSaleInput {
  consignmentId: string;
  productId: string;
  storeId: string;
  quantity: number;
  soldPrice: Decimal | number;
  soldAt?: Date;
  note?: string;
}

export class SaleService {
  static async createSale(input: CreateSaleInput) {
    const { consignmentId, productId, storeId, quantity, soldPrice, soldAt, note } =
      input;

    return prisma.$transaction(async (tx) => {
      const item = await tx.consignmentItem.findUnique({
        where: {
          consignmentId_productId: { consignmentId, productId },
        },
        include: {
          product: { select: { commissionRate: true, name: true } },
        },
      });

      if (!item) {
        throw new Error("Không tìm thấy sản phẩm trong lô ký gửi này");
      }

      const available = InventoryService.computeAvailable(item);
      if (quantity > available) {
        throw new Error(
          `Không đủ hàng. Yêu cầu: ${quantity}, còn tồn: ${available} (${item.product.name})`
        );
      }

      if (quantity <= 0) {
        throw new Error("Số lượng bán phải lớn hơn 0");
      }

      await InventoryService.decreaseStock(tx, item.id, quantity);

      const commission = CommissionService.calculateSaleCommission(
        quantity,
        soldPrice,
        item.product.commissionRate
      );

      const sale = await tx.sale.create({
        data: {
          quantity,
          soldPrice: new Decimal(soldPrice),
          grossAmount: commission.grossAmount,
          soldAt: soldAt ?? new Date(),
          note,
          status: "COMPLETED",
          consignmentId,
          productId,
          storeId,
        },
      });

      const newStatus = await ConsignmentService.recalculateAndUpdateStatus(
        tx,
        consignmentId
      );

      return { sale, consignmentStatus: newStatus, commission };
    });
  }

  static async refundSale(saleId: string) {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUniqueOrThrow({
        where: { id: saleId },
      });

      if (sale.status === "CANCELLED") {
        throw new Error("Sale này đã được hoàn tiền");
      }

      await InventoryService.increaseStockFromRefund(tx, sale.consignmentItemId, sale.quantity);

      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: { status: "CANCELLED" },
      });

      const newStatus = await ConsignmentService.recalculateAndUpdateStatus(
        tx,
        sale.consignmentId
      );

      return { sale: updatedSale, consignmentStatus: newStatus };
    });
  }

  static async getSalesByConsignment(consignmentId: string) {
    return prisma.sale.findMany({
      where: { consignmentId },
      include: {
        product: { select: { name: true, sku: true } },
        store: { select: { name: true } },
      },
      orderBy: { soldAt: "desc" },
    });
  }

  static async getSaleWithDetails(saleId: string) {
    return prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        product: true,
        store: true,
        consignment: {
          include: { consignor: true },
        },
      },
    });
  }
}
