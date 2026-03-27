// lib/services/saleService.ts
import prisma from "@/lib/prisma";
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
  soldPrice: number;
  soldAt?: Date;
  note?: string;
  salesReportDate?: Date;
  salesReportRef?: string;
  reportedBy?: string;
}

export interface CreateSaleResult {
  sale: Awaited<ReturnType<typeof prisma.sale.create>>;
  consignmentStatus: string;
  warnings: string[];
}

export class SaleService {
  static async createSale(input: CreateSaleInput) {
    const {
      consignmentId, productId, storeId, quantity, soldPrice,
      soldAt, note, salesReportDate, salesReportRef, reportedBy,
    } = input;

    return prisma.$transaction(async (tx) => {
      const item = await tx.consignmentItem.findUnique({
        where: { consignmentId_productId: { consignmentId, productId } },
        include: { product: { select: { name: true, sku: true } } },
      });

      if (!item) {
        throw new Error("Không tìm thấy sản phẩm trong lô ký gửi này");
      }

      if (quantity <= 0) {
        throw new Error("Số lượng bán phải lớn hơn 0");
      }

      // TODO: kiểm tra hàng tồn kho trước khi bán
      const warnings: string[] = [];

      // Cập nhật quantitySold trong ConsignmentItem
      await tx.consignmentItem.update({
        where: { id: item.id },
        data: { quantitySold: { increment: quantity } },
      });

      const sale = await tx.sale.create({
        data: {
          code: generateSaleCode(),
          quantity,
          soldPrice: soldPrice.toString(),
          soldAt: soldAt ? new Date(soldAt) : new Date(),
          note,
          status: "CONFIRMED",
          consignmentId,
          productId,
          storeId,
          consignmentItemId: item.id,
          salesReportDate,
          salesReportRef,
          reportedBy,
        },
      });

      const newStatus = await ConsignmentService.recalculateAndUpdateStatus(
        tx,
        consignmentId
      );

      return { sale, consignmentStatus: newStatus, warnings };
    });
  }

  static async refundSale(saleId: string) {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUniqueOrThrow({ where: { id: saleId } });

      if (sale.status === "CANCELLED") {
        throw new Error("Sale này đã được hoàn tiền");
      }

      // TODO: kiểm tra và cập nhật hàng tồn kho khi hoàn tiền
      await tx.consignmentItem.update({
        where: { id: sale.consignmentItemId },
        data: { quantitySold: { decrement: sale.quantity } },
      });

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
        consignment: { include: { consignor: true } },
      },
    });
  }
}
