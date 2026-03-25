"use client";

import { useState, useMemo } from "react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Product } from "@/types/product";
import { useDebounce } from "./useDebounce";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      const matchCategory =
        categoryFilter === "Tất cả" || p.category === categoryFilter;
      const matchStatus =
        statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, debouncedSearch, categoryFilter, statusFilter]);

  const total = products.length;
  const active = products.filter((p) => p.status === "ACTIVE").length;
  const inactive = products.filter((p) => p.status === "INACTIVE").length;

  function deleteProduct(productOrId: Product | string) {
    const id = typeof productOrId === "string" ? productOrId : productOrId.id;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function updateProduct(id: string, data: Partial<Product>) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...data, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }

  function getProduct(id: string) {
    return products.find((p) => p.id === id) ?? null;
  }

  return {
    products,
    filtered,
    filters: {
      search,
      categoryFilter,
      statusFilter,
      setSearch,
      setCategoryFilter,
      setStatusFilter,
    },
    counts: { total, active, inactive },
    deleteProduct,
    updateProduct,
    getProduct,
  };
}
