// lib/services/warehouseInventoryService.ts
import prisma from "@/lib/prisma";

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class WarehouseInventoryService {
  static async getInventory(warehouseId: string) {
    return prisma.warehouseInventory.findMany({
      where: { warehouseId },
      include: {
        product: {
          select: { id: true, sku: true, name: true, price: true, category: true, imageUrl: true },
        },
      },
      orderBy: { product: { name: "asc" } },
    });
  }

  static async getAvailableProducts(warehouseId: string) {
    return prisma.warehouseInventory.findMany({
      where: { warehouseId, quantity: { gt: 0 } },
      include: {
        product: {
          select: { id: true, sku: true, name: true, price: true, category: true, imageUrl: true },
        },
      },
      orderBy: { product: { name: "asc" } },
    });
  }

  static async upsertItem(warehouseId: string, productId: string, quantity: number) {
    return prisma.warehouseInventory.upsert({
      where: { warehouseId_productId: { warehouseId, productId } },
      create: { warehouseId, productId, quantity, reserved: 0 },
      update: { quantity },
    });
  }

  static async updateQuantity(warehouseId: string, productId: string, delta: number) {
    return prisma.warehouseInventory.upsert({
      where: { warehouseId_productId: { warehouseId, productId } },
      create: { warehouseId, productId, quantity: Math.max(0, delta), reserved: 0 },
      update: { quantity: { increment: delta } },
    });
  }

  static async reserve(tx: TxClient, warehouseId: string, productId: string, qty: number) {
    await tx.warehouseInventory.upsert({
      where: { warehouseId_productId: { warehouseId, productId } },
      create: { warehouseId, productId, quantity: 0, reserved: qty },
      update: { reserved: { increment: qty } },
    });
  }

  static async deleteItem(warehouseId: string, productId: string) {
    return prisma.warehouseInventory.delete({
      where: { warehouseId_productId: { warehouseId, productId } },
    });
  }
}
