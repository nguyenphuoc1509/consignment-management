export type ConsignmentStatus =
  | "PENDING"
  | "SENT"
  | "PARTIAL_SOLD"
  | "COMPLETED"
  | "RETURNED"
  | "SETTLED";

export type Consignment = {
  id: string;
  code: string;
  consignorId: string;
  storeId: string;
  sentDate: string;
  expectedReturnDate?: string;
  status: ConsignmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ConsignmentItem = {
  id: string;
  consignmentId: string;
  productId: string;
  quantitySent: number;
  quantitySold: number;
  quantityReturned: number;
  quantityDamaged: number;
};

export type ConsignmentWithItems = Consignment & {
  items: ConsignmentItem[];
};
