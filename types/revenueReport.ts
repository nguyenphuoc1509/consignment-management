// Types aligned with Prisma schema — DO NOT add non-schema fields here.
// API response enrichment happens in the hooks layer.

export type RevenueReportStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export type RevenueReport = {
  id: string;
  code: string;
  storeId: string;
  reportDate: string;
  note?: string;
  status: RevenueReportStatus;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
};

export type RevenueReportItem = {
  id: string;
  revenueReportId: string;
  consignmentId: string;
  consignmentItemId: string;
  productId: string;
  quantity: number;
  soldPrice: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type RevenueAuditLog = {
  id: string;
  revenueReportId: string;
  action: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  performedBy?: number;
  performedAt: string;
};

export type RevenueReportWithDetails = RevenueReport & {
  storeName: string;
  items: RevenueReportItemWithProduct[];
  createdByName?: string;
  auditLogs: RevenueAuditLogWithUser[];
};

export type RevenueReportItemWithProduct = RevenueReportItem & {
  productName: string;
  productSku: string;
  consignmentCode: string;
};

export type RevenueAuditLogWithUser = RevenueAuditLog & {
  performedByName?: string;
};

export type RevenueSummaryByStore = {
  storeId: string;
  storeName: string;
  storeCode: string;
  totalReports: number;
  totalRevenue: number;
  totalQuantity: number;
  lastReportDate?: string;
  lastReportStatus?: RevenueReportStatus;
};

export type StoreInventoryReconciliation = {
  storeId: string;
  storeName: string;
  consignments: {
    consignmentId: string;
    consignmentCode: string;
    consignorName: string;
    sentDate: string;
    status: string;
    items: {
      consignmentItemId: string;
      productId: string;
      productName: string;
      productSku: string;
      quantitySent: number;
      quantitySold: number;
      quantityReturned: number;
      quantityDamaged: number;
      available: number;
      soldViaReport: number;
      discrepancy: number;
      returnedQty?: number;
    }[];
    totalSent: number;
    totalSold: number;
    totalReturned: number;
    totalDamaged: number;
    totalAvailable: number;
  }[];
  grandTotals: {
    totalSent: number;
    totalSold: number;
    totalReturned: number;
    totalDamaged: number;
    totalAvailable: number;
  };
};
