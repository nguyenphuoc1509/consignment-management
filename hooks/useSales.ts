"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import { Sale, SaleStatus, SaleWithDetails } from "@/types/sale";
import { Consignment, ConsignmentItem } from "@/types/consignment";
import { Store } from "@/types/store";
import { Product } from "@/types/product";
import { Consignor } from "@/types/consignor";
import { useDebounce } from "./useDebounce";

interface EnrichedConsignmentItem extends ConsignmentItem {
  productName?: string;
  productSku?: string;
}

interface CreateSaleInput {
  consignmentId: string;
  productId: string;
  storeId: string;
  consignmentItemId: string;
  quantity: number;
  soldPrice: number;
  soldAt: string;
  note?: string;
}

export function useSales() {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [allSales, setAllSales] = useState<SaleWithDetails[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [consignmentItems, setConsignmentItems] = useState<EnrichedConsignmentItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [consignors, setConsignors] = useState<Consignor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [consignmentFilter, setConsignmentFilter] = useState("all");

  const debouncedSearch = useDebounce(search);

  const fetchSales = useCallback(async () => {
    try {
      const data = await api.get<SaleWithDetails[]>("/api/sales");
      setSales(data);
      setAllSales(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải danh sách bán hàng");
    }
  }, []);

  const fetchStores = useCallback(async () => {
    try {
      const data = await api.get<Store[]>("/api/stores");
      setStores(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách cửa hàng:", err);
    }
  }, []);

  const fetchConsignments = useCallback(async () => {
    try {
      const data = await api.get<Consignment[]>("/api/consignments");
      setConsignments(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách ký gửi:", err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.get<Product[]>("/api/products");
      setProducts(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách sản phẩm:", err);
    }
  }, []);

  const fetchConsignors = useCallback(async () => {
    try {
      const data = await api.get<Consignor[]>("/api/consignors");
      setConsignors(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách consignor:", err);
    }
  }, []);

  const fetchConsignmentItems = useCallback(async () => {
    try {
      const itemsMap: EnrichedConsignmentItem[] = [];
      for (const consignment of consignments) {
        try {
          const items = await api.get<EnrichedConsignmentItem[]>(`/api/consignments/${consignment.id}/items`);
          itemsMap.push(...items);
        } catch {
          // Skip if fails
        }
      }
      setConsignmentItems(itemsMap);
    } catch (err) {
      console.error("Lỗi khi tải danh sách items:", err);
    }
  }, [consignments]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchSales(),
        fetchStores(),
        fetchConsignments(),
        fetchProducts(),
        fetchConsignors(),
      ]);
      setLoading(false);
    };
    fetchAll();
  }, [fetchSales, fetchStores, fetchConsignments, fetchProducts, fetchConsignors]);

  useEffect(() => {
    if (consignments.length > 0) {
      fetchConsignmentItems();
    }
  }, [consignments, fetchConsignmentItems]);

  const enriched = useMemo((): SaleWithDetails[] => {
    return sales.map((s) => {
      const consignment = consignments.find((c) => c.id === s.consignmentId);
      const consignor = consignment
        ? consignors.find((cg) => cg.id === consignment.consignorId)
        : undefined;
      const product = products.find((p) => p.id === s.productId);
      const store = stores.find((st) => st.id === s.storeId);
      return {
        ...s,
        consignmentCode: consignment?.code ?? s.consignmentId,
        consignorName: consignor?.name ?? consignor?.id ?? s.consignmentId,
        productName: product?.name ?? s.productId,
        productSku: product?.sku ?? "",
        storeName: store?.name ?? s.storeId,
      };
    });
  }, [sales, consignments, consignors, products, stores]);

  const filtered = useMemo(() => {
    return enriched.filter((s) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.code?.toLowerCase().includes(q) ||
        s.consignmentCode.toLowerCase().includes(q) ||
        s.productName.toLowerCase().includes(q) ||
        s.storeName.toLowerCase().includes(q) ||
        s.consignorName.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" || s.status === statusFilter;
      const matchStore =
        storeFilter === "all" || s.storeId === storeFilter;
      const matchConsignment =
        consignmentFilter === "all" || s.consignmentId === consignmentFilter;
      return matchSearch && matchStatus && matchStore && matchConsignment;
    });
  }, [enriched, debouncedSearch, statusFilter, storeFilter, consignmentFilter]);

  const total = sales.length;
  const totalRevenue = useMemo(
    () =>
      sales
        .filter((s) => s.status === "COMPLETED")
        .reduce((sum, s) => sum + s.quantity * s.soldPrice, 0),
    [sales]
  );
  const byStatus = useMemo(() => {
    const counts: Record<SaleStatus, number> = {
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const s of sales) {
      counts[s.status]++;
    }
    return counts;
  }, [sales]);

  async function deleteSale(saleOrId: SaleWithDetails | string) {
    const id = typeof saleOrId === "string" ? saleOrId : saleOrId.id;
    try {
      await api.delete(`/api/sales/${id}`);
      setSales((prev) => prev.filter((s) => s.id !== id));
      setAllSales((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error("Lỗi khi xóa bán hàng");
    }
  }

  async function cancelSale(id: string) {
    try {
      await api.patch(`/api/sales/${id}`, { status: "CANCELLED" });
      setSales((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: "CANCELLED" as const, updatedAt: new Date().toISOString() }
            : s
        )
      );
      setAllSales((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: "CANCELLED" as const, updatedAt: new Date().toISOString() }
            : s
        )
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error("Lỗi khi hủy bán hàng");
    }
  }

  async function addSale(
    data: Omit<Sale, "id" | "createdAt" | "updatedAt"> & {
      soldAt: string;
    }
  ): Promise<SaleWithDetails | null> {
    const available = getAvailableQuantity(data.consignmentId, data.productId);
    if (data.quantity > available) {
      return null;
    }

    try {
      const input: CreateSaleInput = {
        consignmentId: data.consignmentId,
        productId: data.productId,
        storeId: data.storeId,
        consignmentItemId: data.consignmentItemId,
        quantity: data.quantity,
        soldPrice: data.soldPrice,
        soldAt: data.soldAt,
        note: data.note,
      };

      const newSale = await api.post<SaleWithDetails>("/api/sales", input);
      setSales((prev) => [newSale, ...prev]);
      setAllSales((prev) => [newSale, ...prev]);
      return newSale;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Lỗi khi thêm bán hàng");
    }
  }

  function getSale(id: string): SaleWithDetails | null {
    const s = sales.find((s) => s.id === id);
    if (!s) {
      const sFromAll = allSales.find((s) => s.id === id);
      if (!sFromAll) return null;
      const consignment = consignments.find((c) => c.id === sFromAll.consignmentId);
      const consignor = consignment
        ? consignors.find((cg) => cg.id === consignment.consignorId)
        : undefined;
      const product = products.find((p) => p.id === sFromAll.productId);
      const store = stores.find((st) => st.id === sFromAll.storeId);
      return {
        ...sFromAll,
        consignmentCode: consignment?.code ?? sFromAll.consignmentId,
        consignorName: consignor?.name ?? consignor?.id ?? sFromAll.consignmentId,
        productName: product?.name ?? sFromAll.productId,
        productSku: product?.sku ?? "",
        storeName: store?.name ?? sFromAll.storeId,
      };
    }
    const consignment = consignments.find((c) => c.id === s.consignmentId);
    const consignor = consignment
      ? consignors.find((cg) => cg.id === consignment.consignorId)
      : undefined;
    const product = products.find((p) => p.id === s.productId);
    const store = stores.find((st) => st.id === s.storeId);
    return {
      ...s,
      consignmentCode: consignment?.code ?? s.consignmentId,
      consignorName: consignor?.name ?? consignor?.id ?? s.consignmentId,
      productName: product?.name ?? s.productId,
      productSku: product?.sku ?? "",
      storeName: store?.name ?? s.storeId,
    };
  }

  function getAvailableQuantity(consignmentId: string, productId: string): number {
    const item = consignmentItems.find(
      (i) => i.consignmentId === consignmentId && i.productId === productId
    );
    if (!item) return 0;
    const soldFromStore = sales
      .filter(
        (s) =>
          s.consignmentId === consignmentId &&
          s.productId === productId &&
          s.status === "COMPLETED"
      )
      .reduce((sum, s) => sum + s.quantity, 0);
    return Math.max(0, item.quantitySent - soldFromStore - item.quantityReturned - item.quantityDamaged);
  }

  return {
    sales: enriched,
    filtered,
    filters: {
      search,
      statusFilter,
      storeFilter,
      consignmentFilter,
      setSearch,
      setStatusFilter,
      setStoreFilter,
      setConsignmentFilter,
    },
    counts: { total, byStatus, totalRevenue },
    deleteSale,
    cancelSale,
    addSale,
    getSale,
    getAvailableQuantity,
    stores,
    consignments,
    products,
    consignors,
    loading,
    error,
    refetch: fetchSales,
  };
}
