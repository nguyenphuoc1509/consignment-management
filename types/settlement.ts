// Types aligned with Prisma schema.
export type SettlementStatus = "PENDING" | "CONFIRMED" | "PAID" | "CANCELLED";

export type Settlement = {
  id: string;
  code: string;
  consignmentId: string;
  totalSoldQuantity: number;
  totalReturnedQuantity: number;
  totalDamagedQuantity: number;
  dueDate?: string;
  note?: string;
  status: SettlementStatus;
  approvedBy?: number;
  approvedAt?: string;
  paidAt?: string;
  settledAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SettlementWithDetails = Settlement & {
  consignmentCode: string;
  consignorName: string;
  storeName: string;
  saleCount: number;
  totalSoldAmount: number;
};

export type SettlementPreview = {
  totalSoldQuantity: number;
  totalReturnedQuantity: number;
  totalDamagedQuantity: number;
  totalSoldAmount: number;
  breakdown: {
    saleId: string;
    productId: string;
    productName: string;
    quantity: number;
    soldPrice: number;
    soldAmount: number;
  }[];
};
