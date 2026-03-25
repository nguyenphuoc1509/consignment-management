"use client";

import { useState, useMemo } from "react";
import {
  MOCK_CONSIGNMENTS,
  MOCK_CONSIGNMENT_ITEMS,
  MOCK_CONSIGNORS,
  MOCK_STORES,
  MOCK_PRODUCTS,
} from "@/lib/mock-data";
import {
  Consignment,
  ConsignmentItem,
  ConsignmentStatus,
  ConsignmentWithItems,
} from "@/types/consignment";
import { useDebounce } from "./useDebounce";

export function useConsignments() {
  const [consignments, setConsignments] = useState<Consignment[]>(MOCK_CONSIGNMENTS);
  const [items, setItems] = useState<ConsignmentItem[]>(MOCK_CONSIGNMENT_ITEMS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [consignorFilter, setConsignorFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");

  const debouncedSearch = useDebounce(search);

  const enriched = useMemo((): ConsignmentWithItems[] => {
    return consignments.map((c) => ({
      ...c,
      items: items.filter((i) => i.consignmentId === c.id),
    }));
  }, [consignments, items]);

  const filtered = useMemo(() => {
    return enriched.filter((c) => {
      const q = debouncedSearch.toLowerCase();
      const consignor = MOCK_CONSIGNORS.find((cg) => cg.id === c.consignorId);
      const store = MOCK_STORES.find((s) => s.id === c.storeId);
      const matchSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        (consignor?.companyName.toLowerCase().includes(q) ?? false) ||
        (store?.name.toLowerCase().includes(q) ?? false);
      const matchStatus =
        statusFilter === "all" || c.status === statusFilter;
      const matchConsignor =
        consignorFilter === "all" || c.consignorId === consignorFilter;
      const matchStore =
        storeFilter === "all" || c.storeId === storeFilter;
      return matchSearch && matchStatus && matchConsignor && matchStore;
    });
  }, [enriched, debouncedSearch, statusFilter, consignorFilter, storeFilter]);

  const total = consignments.length;
  const byStatus = useMemo(() => {
    const counts: Record<ConsignmentStatus, number> = {
      PENDING: 0,
      SENT: 0,
      PARTIAL_SOLD: 0,
      COMPLETED: 0,
      RETURNED: 0,
      SETTLED: 0,
    };
    for (const c of consignments) {
      counts[c.status]++;
    }
    return counts;
  }, [consignments]);

  function deleteConsignment(consignmentOrId: ConsignmentWithItems | string) {
    const id = typeof consignmentOrId === "string" ? consignmentOrId : consignmentOrId.id;
    setConsignments((prev) => prev.filter((c) => c.id !== id));
    setItems((prev) => prev.filter((i) => i.consignmentId !== id));
  }

  function updateConsignment(id: string, data: Partial<Consignment>) {
    setConsignments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...data, updatedAt: new Date().toISOString() }
          : c
      )
    );
  }

  function updateConsignmentItem(id: string, data: Partial<ConsignmentItem>) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...data } : i))
    );
  }

  function addConsignment(
    data: Omit<Consignment, "id" | "createdAt" | "updatedAt">,
    newItems: Omit<ConsignmentItem, "id" | "consignmentId">[]
  ) {
    const now = new Date().toISOString();
    const id = `KG-${String(Date.now()).slice(-6)}`;
    const created: Consignment = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setConsignments((prev) => [created, ...prev]);
    const createdItems: ConsignmentItem[] = newItems.map((item, idx) => ({
      ...item,
      id: `KI-${Date.now()}-${idx}`,
      consignmentId: id,
    }));
    setItems((prev) => [...createdItems, ...prev]);
    return created;
  }

  function getConsignment(id: string): ConsignmentWithItems | null {
    const c = consignments.find((c) => c.id === id);
    if (!c) return null;
    return {
      ...c,
      items: items.filter((i) => i.consignmentId === id),
    };
  }

  function getItemsForConsignment(consignmentId: string): ConsignmentItem[] {
    return items.filter((i) => i.consignmentId === consignmentId);
  }

  return {
    consignments: enriched,
    filtered,
    items,
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
    consignors: MOCK_CONSIGNORS,
    stores: MOCK_STORES,
    products: MOCK_PRODUCTS,
  };
}
