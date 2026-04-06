// lib/services/warehouseService.ts
import prisma from "@/lib/prisma";
import { RecordStatus } from "@prisma/client";

export class WarehouseService {
  static async getAll(consignorId?: string) {
    return prisma.warehouse.findMany({
      where: {
        deletedAt: null,
        ...(consignorId ? { consignorId } : {}),
      },
      include: {
        consignor: {
          select: { id: true, name: true, code: true, phone: true, email: true },
        },
        inventory: {
          include: {
            product: {
              select: { id: true, sku: true, name: true, price: true, category: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.warehouse.findFirst({
      where: { id, deletedAt: null },
      include: {
        consignor: {
          select: { id: true, name: true, code: true, phone: true, email: true },
        },
        inventory: {
          include: {
            product: {
              select: { id: true, sku: true, name: true, price: true, category: true, imageUrl: true },
            },
          },
          orderBy: { product: { name: "asc" } },
        },
      },
    });
  }

  static async create(data: {
    consignorId: string;
    code: string;
    name: string;
    address?: string;
    contactPerson?: string;
    phone?: string;
    note?: string;
  }) {
    return prisma.warehouse.create({
      data,
      include: {
        consignor: { select: { id: true, name: true } },
        inventory: true,
      },
    });
  }

  static async update(id: string, data: Partial<{
    code: string;
    name: string;
    address: string;
    contactPerson: string;
    phone: string;
    note: string;
    status: RecordStatus;
  }>) {
    return prisma.warehouse.update({
      where: { id },
      data,
      include: {
        consignor: { select: { id: true, name: true } },
        inventory: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.warehouse.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
