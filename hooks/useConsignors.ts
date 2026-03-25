"use client";

import { useState, useMemo } from "react";
import { MOCK_CONSIGNORS } from "@/lib/mock-data";
import { Consignor } from "@/types/consignor";
import { useDebounce } from "./useDebounce";

export function useConsignors() {
  const [consignors, setConsignors] = useState<Consignor[]>(MOCK_CONSIGNORS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(() => {
    return consignors.filter((c) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q));
      const matchStatus =
        statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [consignors, debouncedSearch, statusFilter]);

  const total = consignors.length;
  const active = consignors.filter((c) => c.status === "ACTIVE").length;
  const inactive = consignors.filter((c) => c.status === "INACTIVE").length;

  function deleteConsignor(consignorOrId: Consignor | string) {
    const id = typeof consignorOrId === "string" ? consignorOrId : consignorOrId.id;
    setConsignors((prev) => prev.filter((c) => c.id !== id));
  }

  function updateConsignor(id: string, data: Partial<Consignor>) {
    setConsignors((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...data, updatedAt: new Date().toISOString() }
          : c
      )
    );
  }

  function addConsignor(data: Omit<Consignor, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const newConsignor: Consignor = {
      ...data,
      id: `CG-${String(Date.now()).slice(-6)}`,
      createdAt: now,
      updatedAt: now,
    };
    setConsignors((prev) => [newConsignor, ...prev]);
    return newConsignor;
  }

  function getConsignor(id: string) {
    return consignors.find((c) => c.id === id) ?? null;
  }

  return {
    consignors,
    filtered,
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
  };
}
