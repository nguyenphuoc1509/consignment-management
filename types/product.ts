export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  commissionRate: number;
  consignorId: string;
  description?: string;
  imageUrl?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
};
