"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import { Store } from "@/types/store";
import { useDebounce } from "./useDebounce";

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    async function fetchStores() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get<Store[]>("/api/stores");
        setStores(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stores");
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  const filtered = useMemo(() => {
    return stores.filter((s) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.contactPerson?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.address?.toLowerCase().includes(q) ||
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

  const deleteStore = useCallback(async (storeOrId: Store | string) => {
    const id = typeof storeOrId === "string" ? storeOrId : storeOrId.id;
    try {
      await api.delete(`/api/stores/${id}`);
      setStores((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  const updateStore = useCallback(async (id: string, data: Partial<Store>) => {
    try {
      const updated = await api.put<Store>(`/api/stores/${id}`, data);
      setStores((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      );
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const addStore = useCallback(
    async (data: Omit<Store, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newStore = await api.post<Store>("/api/stores", data);
        setStores((prev) => [newStore, ...prev]);
        return newStore;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  function getStore(id: string) {
    return stores.find((s) => s.id === id) ?? null;
  }

  return {
    stores,
    filtered,
    loading,
    error,
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
