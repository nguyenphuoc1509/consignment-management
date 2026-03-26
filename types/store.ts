// Types aligned with Prisma schema.
export type Store = {
  id: string;
  code: string;
  name: string;
  taxCode?: string;
  address?: string;
  ward?: string;
  district?: string;
  city: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  paymentInfo?: string;
  note?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};
