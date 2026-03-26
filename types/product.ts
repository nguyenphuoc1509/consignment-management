// Types aligned with Prisma schema.
export type Product = {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type ProductWithConsignor = Product & {
  consignor?: {
    id: string;
    name: string;
    code?: string;
    phone?: string;
    email?: string;
  };
};
