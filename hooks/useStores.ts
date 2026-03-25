"use client";

import { useState, useMemo } from "react";
import { MOCK_STORES } from "@/lib/mock-data";
import { Store } from "@/types/store";
import { useDebounce } from "./useDebounce";

export function useStores() {
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(() => {
    return stores.filter((s) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q));
      const matchStatus =
        statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [stores, debouncedSearch, statusFilter]);

  const total = stores.length;
  const active = stores.filter((s) => s.status === "ACTIVE").length;
  const inactive = stores.filter((s) => s.status === "INACTIVE").length;

  function deleteStore(storeOrId: Store | string) {
    const id = typeof storeOrId === "string" ? storeOrId : storeOrId.id;
    setStores((prev) => prev.filter((s) => s.id !== id));
  }

  function updateStore(id: string, data: Partial<Store>) {
    setStores((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...data, updatedAt: new Date().toISOString() }
          : s
      )
    );
  }

  function addStore(data: Omit<Store, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const newStore: Store = {
      ...data,
      id: `ST-${String(Date.now()).slice(-6)}`,
      createdAt: now,
      updatedAt: now,
    };
    setStores((prev) => [newStore, ...prev]);
    return newStore;
  }

  function getStore(id: string) {
    return stores.find((s) => s.id === id) ?? null;
  }

  return {
    stores,
    filtered,
    filters: {
      search,
      statusFilter,
      setSearch,
      setStatusFilter,
    },
    counts: { total, active, inactive },
    deleteStore,
    updateStore,
    addStore,
    getStore,
  };
}
