// Types aligned with Prisma schema — WarehouseInventory.
export type WarehouseInventory = {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  reserved: number;
  createdAt: string;
  updatedAt: string;
};

export type WarehouseInventoryWithProduct = WarehouseInventory & {
  product: {
    id: string;
    sku: string;
    name: string;
    price: number;
    category?: string;
    imageUrl?: string;
  };
};

export type WarehouseInventoryWithDetails = WarehouseInventory & {
  product: {
    id: string;
    sku: string;
    name: string;
    price: number;
    category?: string;
    imageUrl?: string;
  };
  warehouse: {
    id: string;
    name: string;
    code: string;
  };
};
