export type SaleStatus = "COMPLETED" | "CANCELLED" | "CONFIRMED" | "DRAFT";

export function saleCountsTowardRevenue(status: string): boolean {
  return status === "CONFIRMED" || status === "COMPLETED";
}

export function saleDisplayCode(sale: { code?: string | null; id: string }): string {
  const c = sale.code?.trim();
  return c && c.length > 0 ? c : sale.id;
}

export type Sale = {
  id: string;
  code: string;
  consignmentId: string;
  productId: string;
  storeId: string;
  consignmentItemId: string;
  quantity: number;
  soldPrice: number;
  soldAt: string;
  note?: string;
  status: SaleStatus;
  salesReportDate?: string;
  salesReportRef?: string;
  reportedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type SaleWithDetails = Sale & {
  consignmentCode: string;
  consignorName: string;
  productName: string;
  productSku: string;
  storeName: string;
};
