export type SettlementStatus = "PENDING" | "CONFIRMED" | "PAID";

export type Settlement = {
  id: string;
  code: string;
  consignmentId: string;
  consignorId: string;
  storeId: string;
  totalSalesAmount: number;
  totalCommissionAmount: number;
  totalPayableAmount: number;
  settledAt: string;
  status: SettlementStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type SettlementWithDetails = Settlement & {
  consignmentCode: string;
  consignorName: string;
  storeName: string;
  saleCount: number;
};