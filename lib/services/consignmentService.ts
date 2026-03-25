// lib/services/consignmentService.ts
import prisma from "@/lib/prisma";
import { InventoryService } from "./inventoryService";
import { ConsignmentStatus } from "@prisma/client";

export type ConsignmentStatusNext = typeof ConsignmentStatus;

export function determineConsignmentStatus(
  currentStatus: ConsignmentStatus,
  hasPartialActivity: boolean,
  isFullyDisposed: boolean
): ConsignmentStatus {
  if (
    currentStatus === ConsignmentStatus.SETTLED ||
    currentStatus === ConsignmentStatus.CANCELLED
  ) {
    return currentStatus;
  }

  if (isFullyDisposed) {
    return ConsignmentStatus.COMPLETED;
  }

  if (hasPartialActivity) {
    return ConsignmentStatus.PARTIAL_SOLD;
  }

  return ConsignmentStatus.SENT;
}

export class ConsignmentService {
  static async recalculateAndUpdateStatus(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    consignmentId: string
  ): Promise<ConsignmentStatus> {
    const consignment = await tx.consignment.findUniqueOrThrow({
      where: { id: consignmentId },
    });

    const isFullyDisposed = await InventoryService.isFullyDisposed(consignmentId);
    const hasPartialActivity = await InventoryService.hasPartialActivity(consignmentId);

    const newStatus = determineConsignmentStatus(
      consignment.status,
      hasPartialActivity,
      isFullyDisposed
    );

    if (newStatus !== consignment.status) {
      await tx.consignment.update({
        where: { id: consignmentId },
        data: { status: newStatus },
      });
    }

    return newStatus;
  }

  static async validateProductBelongsToConsignor(
    consignmentId: string,
    productId: string
  ): Promise<boolean> {
    const item = await prisma.consignmentItem.findUnique({
      where: {
        consignmentId_productId: { consignmentId, productId },
      },
      select: { product: { select: { consignorId: true } } },
    });

    if (!item) return false;

    const consignment = await prisma.consignment.findUnique({
      where: { id: consignmentId },
      select: { consignorId: true },
    });

    return item.product.consignorId === consignment?.consignorId;
  }

  static async getConsignmentWithItems(consignmentId: string) {
    return prisma.consignment.findUnique({
      where: { id: consignmentId },
      include: {
        consignor: true,
        store: true,
        consignmentItems: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                commissionRate: true,
                price: true,
                category: true,
              },
            },
          },
        },
        sales: {
          include: { product: true, store: true },
          orderBy: { soldAt: "desc" },
        },
        settlement: true,
      },
    });
  }

  static async checkOverdue(consignmentId: string): Promise<boolean> {
    const c = await prisma.consignment.findUnique({
      where: { id: consignmentId },
      select: { expectedReturnDate: true, status: true },
    });

    if (!c || !c.expectedReturnDate) return false;

    return (
      new Date() > c.expectedReturnDate &&
      c.status !== ConsignmentStatus.SETTLED &&
      c.status !== ConsignmentStatus.CANCELLED
    );
  }
}
