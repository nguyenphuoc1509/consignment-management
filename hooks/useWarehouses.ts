// hooks/useWarehouses.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api/client";
import { Warehouse } from "@/types/warehouse";

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehouses = useCallback(async (consignorId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = consignorId ? `?consignorId=${consignorId}` : "";
      const data = await api.get<Warehouse[]>(`/api/warehouses${params}`);
      setWarehouses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải kho");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const stats = useMemo(() => {
    const totalProducts = warehouses.reduce(
      (s, w) => s + ((w as Warehouse & { inventory?: { quantity: number }[] }).inventory?.length ?? 0),
      0
    );
    const totalStock = warehouses.reduce(
      (s, w) =>
        s +
        ((w as Warehouse & { inventory?: { quantity: number }[] }).inventory?.reduce(
          (ps, i) => ps + i.quantity,
          0
        ) ?? 0),
      0
    );
    const totalReserved = warehouses.reduce(
      (s, w) =>
        s +
        ((w as Warehouse & { inventory?: { reserved: number }[] }).inventory?.reduce(
          (ps, i) => ps + i.reserved,
          0
        ) ?? 0),
      0
    );
    return { totalWarehouses: warehouses.length, totalProducts, totalStock, totalReserved };
  }, [warehouses]);

  return { warehouses, loading, error, fetchWarehouses, stats };
}
