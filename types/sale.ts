export type SaleStatus = "COMPLETED" | "CANCELLED";

export type Sale = {
  id: string;
  consignmentId: string;
  productId: string;
  storeId: string;
  quantity: number;
  soldPrice: number;
  soldAt: string;
  status: SaleStatus;
  notes?: string;
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
