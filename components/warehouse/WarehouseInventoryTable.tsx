// components/warehouse/WarehouseInventoryTable.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { WarehouseInventoryWithProduct } from "@/types/warehouseInventory";
import { Product } from "@/types/product";
import { api } from "@/lib/api/client";

interface WarehouseInventoryTableProps {
  warehouseId: string;
  warehouseName: string;
  allProducts?: Product[];
  onInventoryChange?: () => void;
}

export function WarehouseInventoryTable({
  warehouseId,
  warehouseName,
  allProducts: externalProducts,
  onInventoryChange,
}: WarehouseInventoryTableProps) {
  const [inventory, setInventory] = useState<WarehouseInventoryWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(externalProducts ?? []);

  // Add product form state
  const [addingProductId, setAddingProductId] = useState("");
  const [addingQty, setAddingQty] = useState(1);
  const [addingError, setAddingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(0);

  async function fetchInventory() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<WarehouseInventoryWithProduct[]>(
        `/api/warehouses/inventory?warehouseId=${warehouseId}`
      );
      setInventory(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải tồn kho");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, [warehouseId]);

  // Load products if not provided externally
  useEffect(() => {
    if (!externalProducts && allProducts.length === 0) {
      api.get<Product[]>("/api/products").then((data) => {
        setAllProducts(data);
      }).catch(() => {});
    }
  }, [externalProducts, allProducts]);

  // Products already in inventory
  const inventoryProductIds = new Set(inventory.map((i) => i.productId));
  const availableProducts = allProducts.filter(
    (p) => !p.deletedAt && !inventoryProductIds.has(p.id)
  );

  async function handleAddItem() {
    if (!addingProductId) return;
    if (addingQty <= 0) {
      setAddingError("Số lượng phải lớn hơn 0.");
      return;
    }
    setSubmitting(true);
    setAddingError(null);
    try {
      await api.post("/api/warehouses/inventory", {
        warehouseId,
        productId: addingProductId,
        quantity: addingQty,
      });
      setAddingProductId("");
      setAddingQty(1);
      await fetchInventory();
      onInventoryChange?.();
    } catch (err) {
      setAddingError(err instanceof Error ? err.message : "Lỗi khi thêm sản phẩm");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateQty(item: WarehouseInventoryWithProduct, newQty: number) {
    if (newQty < 0) return;
    try {
      await api.put("/api/warehouses/inventory", {
        warehouseId,
        productId: item.productId,
        quantity: newQty,
      });
      setInventory((prev) =>
        prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: newQty } : i
        )
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi cập nhật");
    }
  }

  async function handleDeleteItem(productId: string) {
    try {
      await api.delete(
        `/api/warehouses/inventory?warehouseId=${warehouseId}&productId=${productId}`
      );
      setInventory((prev) => prev.filter((i) => i.productId !== productId));
      onInventoryChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi xóa sản phẩm");
    }
  }

  const totalItems = inventory.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Badge variant="secondary">{inventory.length} sản phẩm</Badge>
        <span>Tổng tồn: <strong className="text-foreground">{totalItems}</strong></span>
      </div>

      {/* Add new item */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1.5 flex-1">
          <Label className="text-sm font-medium">Thêm sản phẩm</Label>
          <Select value={addingProductId} onValueChange={setAddingProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn sản phẩm..." />
            </SelectTrigger>
            <SelectContent>
              {availableProducts.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Tất cả sản phẩm đã có trong kho.
                </div>
              ) : (
                availableProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.sku}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5 sm:w-28">
          <Label className="text-sm font-medium">Số lượng</Label>
          <Input
            type="number"
            min={1}
            value={addingQty}
            onChange={(e) => setAddingQty(Number(e.target.value))}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          disabled={!addingProductId || submitting}
        >
          <Plus className="size-4" />
          Thêm
        </Button>
      </div>

      {addingError && (
        <p className="text-xs text-destructive">{addingError}</p>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Inventory table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Giá bán</TableHead>
              <TableHead className="text-center">Tồn kho</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                  Kho chưa có sản phẩm nào.
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item, idx) => (
                <TableRow key={item.productId}>
                  <TableCell className="text-xs text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm">{item.product.name}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.product.sku}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(item.product.price)}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingId === item.productId ? (
                      <div className="flex items-center justify-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          className="w-20 text-center"
                          value={editQty}
                          onChange={(e) => setEditQty(Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateQty(item, editQty);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => handleUpdateQty(item, editQty)}
                        >
                          <Check className="size-3 text-green-600" />
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    ) : (
                      <span
                        className={cn(
                          "font-bold text-sm cursor-pointer hover:text-primary",
                          item.quantity === 0 ? "text-destructive" : ""
                        )}
                        onClick={() => {
                          setEditingId(item.productId);
                          setEditQty(item.quantity);
                        }}
                        title="Nhấn để sửa"
                      >
                        {item.quantity}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        title="Sửa số lượng"
                        onClick={() => {
                          setEditingId(item.productId);
                          setEditQty(item.quantity);
                        }}
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        title="Xóa khỏi kho"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteItem(item.productId)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
