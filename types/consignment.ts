// Types aligned with Prisma schema — DO NOT add non-schema fields here.
// API response enrichment happens in the hooks layer.

export type ConsignmentStatus =
  | "DRAFT"
  | "SHIPPED"
  | "PARTIAL_SOLD"
  | "COMPLETED"
  | "RETURNED"
  | "SETTLED"
  | "CANCELLED";

export type Consignment = {
  id: string;
  code: string;
  consignorId: string;
  warehouseId?: string;
  storeId: string;
  sentDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  reportReceivedAt?: string;
  reportNote?: string;
  note?: string;
  status: ConsignmentStatus;
  createdAt: string;
  updatedAt: string;
  consignorName?: string;
  storeName?: string;
  warehouseName?: string;
  consignor?: { name: string };
  store?: { name: string };
  warehouse?: { name: string };
  consignmentItems?: ConsignmentItem[];
};

export type ConsignmentCreatePayload = Omit<Consignment, "id" | "createdAt" | "updatedAt" | "code">;

export type ConsignmentItem = {
  id: string;
  consignmentId: string;
  productId: string;
  quantitySent: number;
  quantitySold: number;
  quantityReturned: number;
  quantityDamaged: number;
  status: "ACTIVE" | "SOLD_OUT" | "RETURNED" | "DAMAGED";
  createdAt: string;
  updatedAt: string;
};

export type ConsignmentWithItems = Consignment & {
  items: ConsignmentItem[];
};

export type ConsignmentWithDetails = Consignment & {
  consignorName: string;
  storeName: string;
  items: (ConsignmentItem & { productName: string; productSku: string })[];
  sales: {
    id: string;
    quantity: number;
    soldPrice: number;
    soldAt: string;
    status: string;
  }[];
  settlement?: {
    id: string;
    status: string;
    totalPayableAmount?: number;
  };
};
