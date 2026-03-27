// hooks/useWarehouseInventory.ts
"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api/client";
import { WarehouseInventoryWithProduct } from "@/types/warehouseInventory";

export function useWarehouseInventory() {
  const [inventory, setInventory] = useState<WarehouseInventoryWithProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async (warehouseId: string, availableOnly = true) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ warehouseId });
      if (availableOnly) params.set("availableOnly", "true");
      const res = await api.get<WarehouseInventoryWithProduct[]>(
        `/api/warehouses/inventory?${params}`
      );
      setInventory(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi lấy tồn kho");
    } finally {
      setLoading(false);
    }
  }, []);

  const upsertItem = useCallback(
    async (warehouseId: string, productId: string, quantity: number) => {
      try {
        const updated = await api.put<WarehouseInventoryWithProduct>(
          "/api/warehouses/inventory",
          { warehouseId, productId, quantity }
        );
        setInventory((prev) => {
          const idx = prev.findIndex((i) => i.productId === productId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updated;
            return next;
          }
          return [...prev, updated];
        });
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi cập nhật tồn kho");
        throw err;
      }
    },
    []
  );

  const deleteItem = useCallback(
    async (warehouseId: string, productId: string) => {
      try {
        await api.delete(`/api/warehouses/inventory?warehouseId=${warehouseId}&productId=${productId}`);
        setInventory((prev) => prev.filter((i) => i.productId !== productId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi xóa khỏi kho");
        throw err;
      }
    },
    []
  );

  const clearInventory = useCallback(() => {
    setInventory([]);
  }, []);

  return {
    inventory,
    loading,
    error,
    fetchInventory,
    upsertItem,
    deleteItem,
    clearInventory,
  };
}
