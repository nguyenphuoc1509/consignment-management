"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import { Consignor } from "@/types/consignor";
import { useDebounce } from "./useDebounce";

export function useConsignors() {
  const [consignors, setConsignors] = useState<Consignor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedSearch = useDebounce(search);

  const fetchConsignors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Consignor[]>("/api/consignors");
      setConsignors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch consignors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsignors();
  }, [fetchConsignors]);

  const filtered = useMemo(() => {
    return consignors.filter((c) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.managerName && c.managerName.toLowerCase().includes(q)) ||
        (c.managerPhone && c.managerPhone.includes(q)) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q));
      const matchStatus =
        statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [consignors, debouncedSearch, statusFilter]);

  const total = consignors.length;
  const active = consignors.filter((c) => c.status === "ACTIVE").length;
  const inactive = consignors.filter((c) => c.status === "INACTIVE").length;

  async function deleteConsignor(consignorOrId: Consignor | string) {
    const id = typeof consignorOrId === "string" ? consignorOrId : consignorOrId.id;
    try {
      await api.delete(`/api/consignors/${id}`);
      setConsignors((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to delete consignor");
    }
  }

  async function updateConsignor(id: string, data: Partial<Consignor>) {
    try {
      const updated = await api.put<Consignor>(`/api/consignors/${id}`, data);
      setConsignors((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update consignor");
    }
  }

  async function addConsignor(data: Omit<Consignor, "id" | "createdAt" | "updatedAt">) {
    try {
      const newConsignor = await api.post<Consignor>("/api/consignors", data);
      setConsignors((prev) => [newConsignor, ...prev]);
      return newConsignor;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to add consignor");
    }
  }

  function getConsignor(id: string) {
    return consignors.find((c) => c.id === id) ?? null;
  }

  return {
    consignors,
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
    deleteConsignor,
    updateConsignor,
    addConsignor,
    getConsignor,
    refetch: fetchConsignors,
  };
}
