// lib/services/inventoryService.ts
import prisma from "@/lib/prisma";

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
