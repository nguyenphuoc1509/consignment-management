"use client";

import { useState, useMemo, useCallback } from "react";
import { api } from "@/lib/api/client";
import {
  RevenueReport,
  RevenueReportWithDetails,
  RevenueReportItemWithProduct,
  RevenueAuditLogWithUser,
  RevenueSummaryByStore,
  StoreInventoryReconciliation,
} from "@/types/revenueReport";

interface StoreWithConsignments {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  totalConsignments: number;
  totalSent: number;
  totalSold: number;
  totalReturned: number;
  totalDamaged: number;
  totalAvailable: number;
  totalRevenue: number;
  totalQuantityReported: number;
  lastReportDate?: string;
  lastReportStatus?: string;
  lastReportCode?: string;
  consignments: {
    id: string;
    code: string;
    status: string;
    sentDate: string;
    consignorName: string;
    items: {
      id: string;
      productId: string;
      productName: string;
      productSku: string;
      price: number;
      quantitySent: number;
      quantitySold: number;
      quantityReturned: number;
      quantityDamaged: number;
      available: number;
    }[];
  }[];
}

interface EnrichedRevenueReport extends RevenueReportWithDetails {
  totalAmount: number;
  totalQuantity: number;
}

interface CreateRevenueReportInput {
  storeId: string;
  reportDate: string;
  note?: string;
  items: {
    consignmentId: string;
    consignmentItemId: string;
    productId: string;
    quantity: number;
    soldPrice: number;
  }[];
}

export function useRevenueReports() {
  const [reports, setReports] = useState<EnrichedRevenueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (storeFilter && storeFilter !== "all") params.set("storeId", storeFilter);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const data = await api.get<EnrichedRevenueReport[]>(
        `/api/revenue-reports${params.size ? `?${params}` : ""}`
      );
      setReports(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, storeFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reports.filter((r) => {
      const matchSearch =
        !q ||
        r.code.toLowerCase().includes(q) ||
        r.storeName.toLowerCase().includes(q) ||
        r.note?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchStore = storeFilter === "all" || r.storeId === storeFilter;
      return matchSearch && matchStatus && matchStore;
    });
  }, [reports, search, statusFilter, storeFilter]);

  const counts = useMemo(() => {
    const byStatus: Record<string, number> = { DRAFT: 0, CONFIRMED: 0, CANCELLED: 0 };
    for (const r of reports) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    return { total: reports.length, byStatus };
  }, [reports]);

  const totalRevenue = useMemo(
    () => filtered.filter((r) => r.status === "CONFIRMED")
      .reduce((sum, r) => sum + r.totalAmount, 0),
    [filtered]
  );

  const addReport = useCallback(async (input: CreateRevenueReportInput) => {
    const result = await api.post<EnrichedRevenueReport>("/api/revenue-reports", input);
    setReports((prev) => [result, ...prev]);
    return result;
  }, []);

  const deleteReport = useCallback(async (id: string) => {
    await api.delete(`/api/revenue-reports/${id}`);
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return {
    reports,
    filtered,
    loading,
    error,
    filters: {
      search, setSearch,
      statusFilter, setStatusFilter,
      storeFilter, setStoreFilter,
    },
    counts,
    totalRevenue,
    addReport,
    deleteReport,
    refetch: fetchReports,
  };
}

export function useStoreRevenue() {
  const [stores, setStores] = useState<StoreWithConsignments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await api.get<StoreWithConsignments[]>(
        `/api/stores/with-consignments${params}`
      );
      setStores(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải cửa hàng");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return stores;
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q)
    );
  }, [stores, search]);

  return {
    stores,
    filtered,
    loading,
    error,
    search,
    setSearch,
    refetch: fetchStores,
  };
}

export function useStoreReconciliation(storeId: string) {
  const [data, setData] = useState<StoreInventoryReconciliation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReconciliation = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.get<StoreInventoryReconciliation>(
        `/api/stores/${storeId}/reconciliation`
      );
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải đối soát");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  return { data, loading, error, refetch: fetchReconciliation };
}
