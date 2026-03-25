"use client";

import { useState, useMemo } from "react";
import {
  MOCK_SETTLEMENTS,
  MOCK_CONSIGNMENTS,
  MOCK_CONSIGNORS,
  MOCK_STORES,
  MOCK_SALES,
  MOCK_PRODUCTS,
} from "@/lib/mock-data";
import { Settlement, SettlementStatus, SettlementWithDetails } from "@/types/settlement";
import { useDebounce } from "./useDebounce";

export function useSettlements() {
  const [settlements, setSettlements] = useState<Settlement[]>(MOCK_SETTLEMENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [consignorFilter, setConsignorFilter] = useState("all");
  const [consignmentFilter, setConsignmentFilter] = useState("all");

  const debouncedSearch = useDebounce(search);

  const enriched = useMemo((): SettlementWithDetails[] => {
    return settlements.map((s) => {
      const consignment = MOCK_CONSIGNMENTS.find((c) => c.id === s.consignmentId);
      const consignor = consignment
        ? MOCK_CONSIGNORS.find((cg) => cg.id === consignment.consignorId)
        : undefined;
      const store = MOCK_STORES.find((st) => st.id === s.storeId);
      const consignmentSales = MOCK_SALES.filter(
        (sl) => sl.consignmentId === s.consignmentId && sl.status === "COMPLETED"
      );
      return {
        ...s,
        consignmentCode: consignment?.code ?? s.consignmentId,
        consignorName: consignor?.companyName ?? consignor?.id ?? s.consignmentId,
        storeName: store?.name ?? s.storeId,
        saleCount: consignmentSales.length,
      };
    });
  }, [settlements]);

  const filtered = useMemo(() => {
    return enriched.filter((s) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        s.code.toLowerCase().includes(q) ||
        s.consignmentCode.toLowerCase().includes(q) ||
        s.consignorName.toLowerCase().includes(q) ||
        s.storeName.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" || s.status === statusFilter;
      const matchStore =
        storeFilter === "all" || s.storeId === storeFilter;
      const matchConsignor =
        consignorFilter === "all" || s.consignorId === consignorFilter;
      const matchConsignment =
        consignmentFilter === "all" || s.consignmentId === consignmentFilter;
      return matchSearch && matchStatus && matchStore && matchConsignor && matchConsignment;
    });
  }, [enriched, debouncedSearch, statusFilter, storeFilter, consignorFilter, consignmentFilter]);

  const total = settlements.length;
  const totalPayable = useMemo(
    () =>
      settlements
        .filter((s) => s.status !== "PAID")
        .reduce((sum, s) => sum + s.totalPayableAmount, 0),
    [settlements]
  );
  const byStatus = useMemo(() => {
    const counts: Record<SettlementStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PAID: 0,
    };
    for (const s of settlements) {
      counts[s.status]++;
    }
    return counts;
  }, [settlements]);

  // Computed financial data per consignment from actual sales
  const salesByConsignment = useMemo(() => {
    const result: Record<string, { count: number; totalAmount: number; commissionAmount: number; payableAmount: number }> = {};
    for (const sale of MOCK_SALES) {
      if (sale.status !== "COMPLETED") continue;
      if (!result[sale.consignmentId]) {
        result[sale.consignmentId] = { count: 0, totalAmount: 0, commissionAmount: 0, payableAmount: 0 };
      }
      const product = MOCK_PRODUCTS.find((p) => p.id === sale.productId);
      const commissionRate = (product?.commissionRate ?? 0) / 100;
      const grossAmount = sale.quantity * sale.soldPrice;
      const commission = Math.round(grossAmount * commissionRate);
      result[sale.consignmentId].count += 1;
      result[sale.consignmentId].totalAmount += grossAmount;
      result[sale.consignmentId].commissionAmount += commission;
      result[sale.consignmentId].payableAmount += grossAmount - commission;
    }
    return result;
  }, []);

  function deleteSettlement(settlementOrId: SettlementWithDetails | string) {
    const id = typeof settlementOrId === "string" ? settlementOrId : settlementOrId.id;
    setSettlements((prev) => prev.filter((s) => s.id !== id));
  }

  function markPaid(id: string) {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "PAID" as SettlementStatus, updatedAt: new Date().toISOString() }
          : s
      )
    );
  }

  function addSettlement(
    data: Omit<Settlement, "id" | "createdAt" | "updatedAt">
  ): Settlement | null {
    const now = new Date().toISOString();
    const newSettlement: Settlement = {
      ...data,
      id: `ST-${String(Date.now()).slice(-6)}`,
      code: `DS-${new Date().getFullYear()}-${String(
        settlements.length + 1
      ).padStart(3, "0")}`,
      createdAt: now,
      updatedAt: now,
    };
    setSettlements((prev) => [newSettlement, ...prev]);
    return newSettlement;
  }

  function getSettlement(id: string): SettlementWithDetails | null {
    const s = settlements.find((s) => s.id === id);
    if (!s) return null;
    const consignment = MOCK_CONSIGNMENTS.find((c) => c.id === s.consignmentId);
    const consignor = consignment
      ? MOCK_CONSIGNORS.find((cg) => cg.id === consignment.consignorId)
      : undefined;
    const store = MOCK_STORES.find((st) => st.id === s.storeId);
    const consignmentSales = MOCK_SALES.filter(
      (sl) => sl.consignmentId === s.consignmentId && sl.status === "COMPLETED"
    );
    return {
      ...s,
      consignmentCode: consignment?.code ?? s.consignmentId,
      consignorName: consignor?.companyName ?? consignor?.id ?? s.consignmentId,
      storeName: store?.name ?? s.storeId,
      saleCount: consignmentSales.length,
    };
  }

  function updateSettlement(
    id: string,
    data: Partial<Omit<Settlement, "id" | "createdAt" | "updatedAt">>
  ) {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...data, updatedAt: new Date().toISOString() }
          : s
      )
    );
  }

  return {
    settlements: enriched,
    filtered,
    filters: {
      search,
      statusFilter,
      storeFilter,
      consignorFilter,
      consignmentFilter,
      setSearch,
      setStatusFilter,
      setStoreFilter,
      setConsignorFilter,
      setConsignmentFilter,
    },
    counts: { total, byStatus, totalPayable },
    deleteSettlement,
    markPaid,
    addSettlement,
    getSettlement,
    updateSettlement,
    salesByConsignment,
    stores: MOCK_STORES,
    consignments: MOCK_CONSIGNMENTS,
    consignors: MOCK_CONSIGNORS,
    products: MOCK_PRODUCTS,
  };
}
