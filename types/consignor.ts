// Types aligned with Prisma schema.
export type Consignor = {
  id: string;
  type: "WAREHOUSE" | "EXTERNAL";
  code: string;
  name: string;
  address: string;
  managerName?: string;
  managerPhone?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  note?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};
