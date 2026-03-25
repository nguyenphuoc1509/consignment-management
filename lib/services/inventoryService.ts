// lib/services/inventoryService.ts
import prisma from "@/lib/prisma";

export interface StockInfo {
  consignmentItemId: string;
  productId: string;
  productName: string;
  sku: string;
  quantitySent: number;
  quantitySold: number;
  quantityReturned: number;
  quantityDamaged: number;
  available: number;
}

export interface StockValidationResult {
  valid: boolean;
  error?: string;
  stockInfo?: StockInfo;
}

export class InventoryService {
  static computeAvailable(item: {
    quantitySent: number;
    quantitySold: number;
    quantityReturned: number;
    quantityDamaged: number;
  }): number {
    return (
      item.quantitySent -
      item.quantitySold -
      item.quantityReturned -
      item.quantityDamaged
    );
  }

  static async getStockInfo(
    consignmentId: string,
    productId: string
  ): Promise<StockInfo | null> {
    const item = await prisma.consignmentItem.findUnique({
      where: {
        consignmentId_productId: { consignmentId, productId },
      },
      include: { product: { select: { name: true, sku: true } } },
    });

    if (!item) return null;

    return {
      consignmentItemId: item.id,
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      quantitySent: item.quantitySent,
      quantitySold: item.quantitySold,
      quantityReturned: item.quantityReturned,
      quantityDamaged: item.quantityDamaged,
      available: this.computeAvailable(item),
    };
  }

  static async getConsignmentStockInfo(
    consignmentId: string
  ): Promise<StockInfo[]> {
    const items = await prisma.consignmentItem.findMany({
      where: { consignmentId },
      include: { product: { select: { name: true, sku: true } } },
    });

    return items.map((item) => ({
      consignmentItemId: item.id,
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      quantitySent: item.quantitySent,
      quantitySold: item.quantitySold,
      quantityReturned: item.quantityReturned,
      quantityDamaged: item.quantityDamaged,
      available: this.computeAvailable(item),
    }));
  }

  static async validateStock(
    consignmentId: string,
    productId: string,
    requestedQty: number
  ): Promise<StockValidationResult> {
    if (requestedQty <= 0) {
      return { valid: false, error: "Số lượng bán phải lớn hơn 0" };
    }

    const item = await prisma.consignmentItem.findUnique({
      where: {
        consignmentId_productId: { consignmentId, productId },
      },
      include: { product: { select: { name: true, sku: true } } },
    });

    if (!item) {
      return { valid: false, error: "Không tìm thấy sản phẩm trong lô ký gửi" };
    }

    const available = this.computeAvailable(item);

    if (requestedQty > available) {
      return {
        valid: false,
        error: `Không đủ hàng. Yêu cầu: ${requestedQty}, còn tồn: ${available}`,
        stockInfo: {
          consignmentItemId: item.id,
          productId: item.productId,
          productName: item.product.name,
          sku: item.product.sku,
          quantitySent: item.quantitySent,
          quantitySold: item.quantitySold,
          quantityReturned: item.quantityReturned,
          quantityDamaged: item.quantityDamaged,
          available,
        },
      };
    }

    return {
      valid: true,
      stockInfo: {
        consignmentItemId: item.id,
        productId: item.productId,
        productName: item.product.name,
        sku: item.product.sku,
        quantitySent: item.quantitySent,
        quantitySold: item.quantitySold,
        quantityReturned: item.quantityReturned,
        quantityDamaged: item.quantityDamaged,
        available,
      },
    };
  }

  static async decreaseStock(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    consignmentItemId: string,
    qty: number
  ): Promise<void> {
    const item = await tx.consignmentItem.update({
      where: { id: consignmentItemId },
      data: { quantitySold: { increment: qty } },
    });

    if (
      item.quantitySold + item.quantityReturned + item.quantityDamaged >
      item.quantitySent
    ) {
      throw new Error(
        `Lỗi logic: tổng sold/returned/damaged vượt quantitySent`
      );
    }

    if (
      item.quantitySold + item.quantityReturned + item.quantityDamaged ===
      item.quantitySent
    ) {
      await tx.consignmentItem.update({
        where: { id: consignmentItemId },
        data: { status: "SOLD_OUT" },
      });
    }
  }

  static async increaseStockFromRefund(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    consignmentItemId: string,
    qty: number
  ): Promise<void> {
    const item = await tx.consignmentItem.update({
      where: { id: consignmentItemId },
      data: { quantitySold: { decrement: qty } },
    });

    if (item.status === "SOLD_OUT") {
      await tx.consignmentItem.update({
        where: { id: consignmentItemId },
        data: { status: "ACTIVE" },
      });
    }
  }

  static async updateReturned(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    consignmentItemId: string,
    qty: number
  ): Promise<void> {
    const item = await tx.consignmentItem.update({
      where: { id: consignmentItemId },
      data: { quantityReturned: { increment: qty } },
    });

    if (
      item.quantitySold + item.quantityReturned + item.quantityDamaged ===
      item.quantitySent
    ) {
      await tx.consignmentItem.update({
        where: { id: consignmentItemId },
        data: { status: "RETURNED" },
      });
    }
  }

  static async updateDamaged(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    consignmentItemId: string,
    qty: number
  ): Promise<void> {
    const item = await tx.consignmentItem.update({
      where: { id: consignmentItemId },
      data: { quantityDamaged: { increment: qty } },
    });

    if (
      item.quantitySold + item.quantityReturned + item.quantityDamaged ===
      item.quantitySent
    ) {
      await tx.consignmentItem.update({
        where: { id: consignmentItemId },
        data: { status: "DAMAGED" },
      });
    }
  }

  static async isFullyDisposed(consignmentId: string): Promise<boolean> {
    const items = await prisma.consignmentItem.findMany({
      where: { consignmentId },
      select: {
        quantitySent: true,
        quantitySold: true,
        quantityReturned: true,
        quantityDamaged: true,
      },
    });

    if (items.length === 0) return false;

    return items.every((item) => this.computeAvailable(item) === 0);
  }

  static async hasPartialActivity(consignmentId: string): Promise<boolean> {
    const items = await prisma.consignmentItem.findMany({
      where: { consignmentId },
      select: {
        quantitySold: true,
        quantityReturned: true,
        quantityDamaged: true,
      },
    });

    return items.some(
      (item) =>
        item.quantitySold > 0 ||
        item.quantityReturned > 0 ||
        item.quantityDamaged > 0
    );
  }
}
