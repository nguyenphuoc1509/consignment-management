"use client";

import { useState, useMemo } from "react";
import {
  MOCK_SALES,
  MOCK_CONSIGNMENTS,
  MOCK_CONSIGNMENT_ITEMS,
  MOCK_CONSIGNORS,
  MOCK_STORES,
  MOCK_PRODUCTS,
} from "@/lib/mock-data";
import { Sale, SaleStatus, SaleWithDetails } from "@/types/sale";
import { ConsignmentItem } from "@/types/consignment";
import { useDebounce } from "./useDebounce";

export function useSales() {
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [consignmentFilter, setConsignmentFilter] = useState("all");

  const debouncedSearch = useDebounce(search);

  const enriched = useMemo((): SaleWithDetails[] => {
    return sales.map((s) => {
      const consignment = MOCK_CONSIGNMENTS.find((c) => c.id === s.consignmentId);
      const consignor = consignment
        ? MOCK_CONSIGNORS.find((cg) => cg.id === consignment.consignorId)
        : undefined;
      const product = MOCK_PRODUCTS.find((p) => p.id === s.productId);
      const store = MOCK_STORES.find((st) => st.id === s.storeId);
      return {
        ...s,
        consignmentCode: consignment?.code ?? s.consignmentId,
        consignorName: consignor?.companyName ?? consignor?.id ?? s.consignmentId,
        productName: product?.name ?? s.productId,
        productSku: product?.sku ?? "",
        storeName: store?.name ?? s.storeId,
      };
    });
  }, [sales]);

  const filtered = useMemo(() => {
    return enriched.filter((s) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
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

  function deleteSale(saleOrId: SaleWithDetails | string) {
    const id = typeof saleOrId === "string" ? saleOrId : saleOrId.id;
    setSales((prev) => prev.filter((s) => s.id !== id));
  }

  function cancelSale(id: string) {
    setSales((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "CANCELLED", updatedAt: new Date().toISOString() }
          : s
      )
    );
  }

  function addSale(
    data: Omit<Sale, "id" | "createdAt" | "updatedAt"> & {
      soldAt: string;
    }
  ): Sale | null {
    const consignment = MOCK_CONSIGNMENTS.find((c) => c.id === data.consignmentId);
    if (!consignment) return null;

    const item = MOCK_CONSIGNMENT_ITEMS.find(
      (i) => i.consignmentId === data.consignmentId && i.productId === data.productId
    );
    if (!item) return null;

    const available =
      item.quantitySent -
      item.quantitySold -
      item.quantityReturned -
      item.quantityDamaged;
    if (data.quantity > available) {
      return null;
    }

    const now = new Date().toISOString();
    const newSale: Sale = {
      ...data,
      id: `SL-${String(Date.now()).slice(-6)}`,
      createdAt: now,
      updatedAt: now,
    };
    setSales((prev) => [newSale, ...prev]);
    return newSale;
  }

  function getSale(id: string): SaleWithDetails | null {
    const s = sales.find((s) => s.id === id);
    if (!s) return null;
    const consignment = MOCK_CONSIGNMENTS.find((c) => c.id === s.consignmentId);
    const consignor = consignment
      ? MOCK_CONSIGNORS.find((cg) => cg.id === consignment.consignorId)
      : undefined;
    const product = MOCK_PRODUCTS.find((p) => p.id === s.productId);
    const store = MOCK_STORES.find((st) => st.id === s.storeId);
    return {
      ...s,
      consignmentCode: consignment?.code ?? s.consignmentId,
      consignorName: consignor?.companyName ?? consignor?.id ?? s.consignmentId,
      productName: product?.name ?? s.productId,
      productSku: product?.sku ?? "",
      storeName: store?.name ?? s.storeId,
    };
  }

  function getAvailableQuantity(consignmentId: string, productId: string): number {
    const item = MOCK_CONSIGNMENT_ITEMS.find(
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
    stores: MOCK_STORES,
    consignments: MOCK_CONSIGNMENTS,
    products: MOCK_PRODUCTS,
    consignors: MOCK_CONSIGNORS,
  };
}
