// Types aligned with Prisma schema — Warehouse.
export type Warehouse = {
  id: string;
  consignorId: string;
  code: string;
  name: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  note?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type WarehouseWithDetails = Warehouse & {
  consignor: {
    id: string;
    name: string;
    code: string;
    phone?: string;
    email?: string;
  };
};
