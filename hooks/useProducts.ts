"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import { Product } from "@/types/product";
import { useDebounce } from "./useDebounce";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");

  const debouncedSearch = useDebounce(search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Product[]>("/api/products");
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q));
      const matchCategory =
        categoryFilter === "Tất cả" || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, debouncedSearch, categoryFilter]);

  const total = products.length;
  const active = 0;
  const inactive = 0;

  async function deleteProduct(productOrId: Product | string) {
    const id = typeof productOrId === "string" ? productOrId : productOrId.id;
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to delete product");
    }
  }

  async function addProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">) {
    const { consignorId: _removed, ...payload } = data as Product & { consignorId?: string };
    const created = await api.post<Product>("/api/products", payload);
    setProducts((prev) => [created, ...prev]);
    return created;
  }

  async function updateProduct(id: string, data: Partial<Product>) {
    try {
      const { consignorId: _removed, ...payload } = data as Product & { consignorId?: string };
      const updated = await api.put<Product>(`/api/products/${id}`, payload);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update product");
    }
  }

  const getProduct = useCallback(async (id: string) => {
    return await api.get<Product>(`/api/products/${id}`);
  }, []);

  return {
    products,
    filtered,
    loading,
    error,
    filters: {
      search,
      categoryFilter,
      setSearch,
      setCategoryFilter,
    },
    counts: { total, active, inactive },
    deleteProduct,
    addProduct,
    updateProduct,
    getProduct,
    refetch: fetchProducts,
  };
}
