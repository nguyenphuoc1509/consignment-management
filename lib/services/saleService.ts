// lib/services/saleService.ts
import prisma from "@/lib/prisma";
import { ConsignmentService } from "./consignmentService";

function datePartForCode(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function allocateSaleCode(tx: Tx, soldAt: Date): Promise<string> {
  const prefix = `GD-${datePartForCode(soldAt)}-`;
  const latest = await tx.sale.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: "desc" },
    select: { code: true },
  });

  let seq = 1;
  if (latest?.code?.startsWith(prefix)) {
    const n = parseInt(latest.code.slice(prefix.length), 10);
    if (!Number.isNaN(n)) seq = n + 1;
  }

  for (let bump = 0; bump < 8; bump++) {
    const code = `${prefix}${String(seq + bump).padStart(4, "0")}`;
    const clash = await tx.sale.findUnique({ where: { code }, select: { id: true } });
    if (!clash) return code;
  }

  return `${prefix}${Date.now().toString(36).toUpperCase().slice(-6)}`;
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

      const warnings: string[] = [];

      await tx.consignmentItem.update({
        where: { id: item.id },
        data: { quantitySold: { increment: quantity } },
      });

      const at = soldAt ? new Date(soldAt) : new Date();
      const sale = await tx.sale.create({
        data: {
          code: await allocateSaleCode(tx, at),
          quantity,
          soldPrice: soldPrice.toString(),
          soldAt: at,
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
