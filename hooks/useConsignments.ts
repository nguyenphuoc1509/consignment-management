"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import {
  Consignment,
  ConsignmentItem,
  ConsignmentStatus,
  ConsignmentWithItems,
} from "@/types/consignment";
import { Consignor } from "@/types/consignor";
import { Store } from "@/types/store";
import { Product } from "@/types/product";
import { useDebounce } from "./useDebounce";

export function useConsignments() {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [items, setItems] = useState<ConsignmentItem[]>([]);
  const [consignors, setConsignors] = useState<Consignor[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [consignorFilter, setConsignorFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [consignmentsRes, consignorsRes, storesRes, productsRes] = await Promise.all([
          api.get<Consignment[]>("/api/consignments"),
          api.get<Consignor[]>("/api/consignors"),
          api.get<Store[]>("/api/stores"),
          api.get<Product[]>("/api/products"),
        ]);

        // Cast: API returns consignment + nested consignmentItems from Prisma include
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = consignmentsRes as any[];
        const allItems: ConsignmentItem[] = [];
        const consignmentList: Consignment[] = [];

        for (const c of raw) {
          if (c.consignmentItems && Array.isArray(c.consignmentItems)) {
            allItems.push(...c.consignmentItems);
            const { consignmentItems: _ci, consignor, store, ...rest } = c;
            consignmentList.push({ ...rest, consignorName: consignor?.name, storeName: store?.name });
          } else {
            consignmentList.push(c);
          }
        }

        setItems(allItems);
        setConsignments(consignmentList.length > 0 ? consignmentList : consignmentsRes);
        setConsignors(consignorsRes);
        setStores(storesRes);
        setProducts(productsRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const enriched = useMemo((): ConsignmentWithItems[] => {
    return consignments.map((c) => ({
      ...c,
      items: items.filter((i) => i.consignmentId === c.id),
    }));
  }, [consignments, items]);

  const filtered = useMemo(() => {
    return enriched.filter((c) => {
      const q = debouncedSearch.toLowerCase();
      const consignor = consignors.find((cg) => cg.id === c.consignorId);
      const store = stores.find((s) => s.id === c.storeId);
      const matchSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        (consignor?.name.toLowerCase().includes(q) ?? false) ||
        (store?.name.toLowerCase().includes(q) ?? false);
      const matchStatus =
        statusFilter === "all" || c.status === statusFilter;
      const matchConsignor =
        consignorFilter === "all" || c.consignorId === consignorFilter;
      const matchStore =
        storeFilter === "all" || c.storeId === storeFilter;
      return matchSearch && matchStatus && matchConsignor && matchStore;
    });
  }, [enriched, debouncedSearch, statusFilter, consignorFilter, storeFilter, consignors, stores]);

  const total = consignments.length;
  const byStatus = useMemo(() => {
    const counts: Record<ConsignmentStatus, number> = {
      DRAFT: 0,
      SHIPPED: 0,
      PARTIAL_SOLD: 0,
      COMPLETED: 0,
      RETURNED: 0,
      SETTLED: 0,
      CANCELLED: 0,
    };
    for (const c of consignments) {
      if (c.status in counts) {
        counts[c.status]++;
      }
    }
    return counts;
  }, [consignments]);

  const deleteConsignment = useCallback(async (consignmentOrId: ConsignmentWithItems | string) => {
    const id = typeof consignmentOrId === "string" ? consignmentOrId : consignmentOrId.id;
    try {
      await api.delete(`/api/consignments/${id}`);
      setConsignments((prev) => prev.filter((c) => c.id !== id));
      setItems((prev) => prev.filter((i) => i.consignmentId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete consignment");
      throw err;
    }
  }, []);

  const updateConsignment = useCallback(async (id: string, data: Partial<Consignment>) => {
    try {
      const updated = await api.put<Consignment>(`/api/consignments/${id}`, data);
      setConsignments((prev) =>
        prev.map((c) => (c.id === id ? { ...updated, updatedAt: new Date().toISOString() } : c))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update consignment");
      throw err;
    }
  }, []);

  const updateConsignmentItem = useCallback(async (id: string, data: Partial<ConsignmentItem>) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    try {
      const updated = await api.put<ConsignmentItem>(
        `/api/consignments/${item.consignmentId}/items`,
        { ...data, id }
      );
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...updated, updatedAt: new Date().toISOString() } : i))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update consignment item");
      throw err;
    }
  }, [items]);

  const addConsignment = useCallback(
    async (
      data: Omit<Consignment, "id" | "createdAt" | "updatedAt">,
      newItems: Omit<ConsignmentItem, "id" | "consignmentId">[]
    ) => {
      try {
        const created = await api.post<Consignment>("/api/consignments", {
          ...data,
          items: newItems,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = created as any;
        setConsignments((prev) => [raw, ...prev]);
        if (raw.consignmentItems && Array.isArray(raw.consignmentItems)) {
          setItems((prev) => [...raw.consignmentItems, ...prev]);
        }

        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add consignment");
        throw err;
      }
    },
    []
  );

  const getConsignment = useCallback(
    (id: string): ConsignmentWithItems | null => {
      const c = consignments.find((c) => c.id === id);
      if (!c) return null;
      return {
        ...c,
        items: items.filter((i) => i.consignmentId === id),
      };
    },
    [consignments, items]
  );

  const getItemsForConsignment = useCallback(
    (consignmentId: string): ConsignmentItem[] => {
      return items.filter((i) => i.consignmentId === consignmentId);
    },
    [items]
  );

  return {
    consignments: enriched,
    filtered,
    items,
    loading,
    error,
    filters: {
      search,
      statusFilter,
      consignorFilter,
      storeFilter,
      setSearch,
      setStatusFilter,
      setConsignorFilter,
      setStoreFilter,
    },
    counts: { total, byStatus },
    deleteConsignment,
    updateConsignment,
    updateConsignmentItem,
    addConsignment,
    getConsignment,
    getItemsForConsignment,
    consignors,
    stores,
    products,
  };
}
