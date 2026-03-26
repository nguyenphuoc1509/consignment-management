"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import { Settlement, SettlementStatus, SettlementWithDetails } from "@/types/settlement";
import { Consignment } from "@/types/consignment";
import { Consignor } from "@/types/consignor";
import { Store } from "@/types/store";
import { Product } from "@/types/product";
import { Sale } from "@/types/sale";
import { useDebounce } from "./useDebounce";

type SettlementApiResponse = Settlement & {
  consignmentCode: string;
  consignorName: string;
  storeName: string;
  saleCount: number;
  consignmentId: string;
};

type SalesPreviewItem = {
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  soldPrice: number;
  soldAmount: number;
};

type SalesPreview = {
  totalSoldQuantity: number;
  totalReturnedQuantity: number;
  totalDamagedQuantity: number;
  totalSoldAmount: number;
  breakdown: SalesPreviewItem[];
};

export function useSettlements() {
  const [settlements, setSettlements] = useState<SettlementApiResponse[]>([]);
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [consignors, setConsignors] = useState<Consignor[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [consignorFilter, setConsignorFilter] = useState("all");
  const [consignmentFilter, setConsignmentFilter] = useState("all");

  const debouncedSearch = useDebounce(search);

  const fetchSettlements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("statusFilter", statusFilter);
      if (storeFilter !== "all") params.set("storeFilter", storeFilter);
      if (consignorFilter !== "all") params.set("consignorFilter", consignorFilter);
      if (consignmentFilter !== "all") params.set("consignmentFilter", consignmentFilter);

      const queryString = params.toString();
      const url = queryString ? `/api/settlements?${queryString}` : "/api/settlements";

      const [settlementsRes, consignmentsRes, consignorsRes, storesRes, productsRes, salesRes] =
        await Promise.all([
          api.get<SettlementApiResponse[]>(url),
          api.get<Consignment[]>("/api/consignments"),
          api.get<Consignor[]>("/api/consignors"),
          api.get<Store[]>("/api/stores"),
          api.get<Product[]>("/api/products"),
          api.get<Sale[]>("/api/sales"),
        ]);

      setSettlements(settlementsRes);
      setConsignments(consignmentsRes);
      setConsignors(consignorsRes);
      setStores(storesRes);
      setProducts(productsRes);
      setSales(salesRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settlements");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, storeFilter, consignorFilter, consignmentFilter]);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const enriched = useMemo((): SettlementWithDetails[] => {
    return settlements.map((s) => {
      const consignment = consignments.find((c) => c.id === s.consignmentId);
      const consignmentSales = sales.filter(
        (sl) => sl.consignmentId === s.consignmentId && sl.status === "COMPLETED"
      );
      const completedSalesAmount = consignmentSales.reduce(
        (sum, sl) => sum + sl.quantity * Number(sl.soldPrice),
        0
      );
      return {
        ...s,
        consignmentCode: s.consignmentCode,
        consignorName: s.consignorName,
        storeName: s.storeName,
        saleCount: s.saleCount,
        totalSoldAmount: completedSalesAmount,
      };
    });
  }, [settlements, consignments, sales]);

  const filtered = useMemo(() => {
    return enriched.filter((s) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        s.code.toLowerCase().includes(q) ||
        s.consignmentCode.toLowerCase().includes(q) ||
        s.consignorName.toLowerCase().includes(q) ||
        s.storeName.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const settlementConsignment = consignments.find((c) => c.id === s.consignmentId);
      const matchStore =
        storeFilter === "all" ||
        settlementConsignment?.storeId === storeFilter;
      const matchConsignor =
        consignorFilter === "all" ||
        settlementConsignment?.consignorId === consignorFilter;
      const matchConsignment = consignmentFilter === "all" || s.consignmentId === consignmentFilter;
      return matchSearch && matchStatus && matchStore && matchConsignor && matchConsignment;
    });
  }, [
    enriched,
    debouncedSearch,
    statusFilter,
    storeFilter,
    consignorFilter,
    consignmentFilter,
    consignments,
  ]);

  const total = settlements.length;
  const totalPayable = useMemo(() => {
    return settlements
      .filter((s) => s.status !== "PAID")
      .reduce((sum, s) => {
        const consignmentSales = sales.filter(
          (sl) => sl.consignmentId === s.consignmentId && sl.status === "COMPLETED"
        );
        return sum + consignmentSales.reduce((saleSum, sl) => saleSum + sl.quantity * Number(sl.soldPrice), 0);
      }, 0);
  }, [settlements, sales]);
  const byStatus = useMemo(() => {
    const counts: Record<SettlementStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PAID: 0,
      CANCELLED: 0,
    };
    for (const s of settlements) {
      if (s.status in counts) {
        counts[s.status]++;
      }
    }
    return counts;
  }, [settlements]);

  const salesByConsignment = useMemo(() => {
    const result: Record<
      string,
      { count: number; totalAmount: number; commissionAmount: number; payableAmount: number }
    > = {};
    for (const sale of sales) {
      if (sale.status !== "COMPLETED") continue;
      if (!result[sale.consignmentId]) {
        result[sale.consignmentId] = {
          count: 0,
          totalAmount: 0,
          commissionAmount: 0,
          payableAmount: 0,
        };
      }
      const product = products.find((p) => p.id === sale.productId);
      const soldAmount = sale.quantity * Number(sale.soldPrice);
      result[sale.consignmentId].count += 1;
      result[sale.consignmentId].totalAmount += soldAmount;
      result[sale.consignmentId].commissionAmount += 0;
      result[sale.consignmentId].payableAmount += soldAmount;
    }
    return result;
  }, [sales, products]);

  const fetchSalesPreview = useCallback(async (consignmentId: string): Promise<SalesPreview | null> => {
    try {
      const preview = await api.get<SalesPreview>(
        `/api/settlements/preview?consignmentId=${consignmentId}`
      );
      return preview;
    } catch {
      return null;
    }
  }, []);

  const deleteSettlement = useCallback(
    async (settlementOrId: SettlementWithDetails | string) => {
      const id = typeof settlementOrId === "string" ? settlementOrId : settlementOrId.id;
      try {
        await api.delete(`/api/settlements/${id}`);
        setSettlements((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete settlement");
        throw err;
      }
    },
    []
  );

  const markPaid = useCallback(
    async (id: string) => {
      try {
        const result = await api.put<{ settlement: Settlement }>(`/api/settlements/${id}`, {
          action: "markPaid",
        });
        setSettlements((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status: result.settlement.status as SettlementStatus,
                  paidAt: result.settlement.paidAt as string,
                  updatedAt: new Date().toISOString(),
                }
              : s
          )
        );
        return result.settlement;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to mark settlement as paid");
        throw err;
      }
    },
    []
  );

  const addSettlement = useCallback(
    async (data: { consignmentId: string; dueDate?: string; note?: string }) => {
      try {
        const result = await api.post<{ settlement: Settlement; summary: unknown }>(
          "/api/settlements",
          data
        );

        const settlementId = result.settlement.id;
        const [settlementDetails] = await Promise.all([
          api.get<SettlementApiResponse>(`/api/settlements/${settlementId}`),
          fetchSettlements(),
        ]);

        setSettlements((prev) => [settlementDetails, ...prev]);
        return result.settlement;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add settlement");
        throw err;
      }
    },
    [fetchSettlements]
  );

  const getSettlement = useCallback(
    (id: string): SettlementWithDetails | null => {
      const s = settlements.find((s) => s.id === id);
      if (!s) return null;
      const consignment = consignments.find((c) => c.id === s.consignmentId);
      const consignmentSales = sales.filter(
        (sl) => sl.consignmentId === s.consignmentId && sl.status === "COMPLETED"
      );
      const completedSalesAmount = consignmentSales.reduce(
        (sum, sl) => sum + sl.quantity * Number(sl.soldPrice),
        0
      );
      return {
        ...s,
        consignmentCode: s.consignmentCode,
        consignorName: s.consignorName,
        storeName: s.storeName,
        saleCount: s.saleCount,
        totalSoldAmount: completedSalesAmount,
      };
    },
    [settlements, consignments, sales]
  );

  const updateSettlement = useCallback(
    async (
      id: string,
      data: Partial<Omit<Settlement, "id" | "createdAt" | "updatedAt">>
    ) => {
      try {
        const updated = await api.put<Settlement>(`/api/settlements/${id}`, data);
        setSettlements((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, ...updated, updatedAt: new Date().toISOString() } : s
          )
        );
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update settlement");
        throw err;
      }
    },
    []
  );

  return {
    settlements: enriched,
    filtered,
    loading,
    error,
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
    stores,
    consignments,
    consignors,
    products,
    fetchSalesPreview,
    refetch: fetchSettlements,
  };
}
