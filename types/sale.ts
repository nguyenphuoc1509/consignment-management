// SaleStatus uses COMPLETED/CANCELLED to match Prisma's CONFIRMED/CANCELLED.
// Conversion: Prisma CONFIRMED = API COMPLETED (same concept, different naming)
// API layer handles the Prisma enum internally.
export type SaleStatus = "COMPLETED" | "CANCELLED";

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
