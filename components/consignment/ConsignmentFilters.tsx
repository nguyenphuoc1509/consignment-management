"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Consignor } from "@/types/consignor";
import { Store } from "@/types/store";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "DRAFT", label: "Nháp" },
  { value: "SHIPPED", label: "Đã gửi" },
  { value: "PARTIAL_SOLD", label: "Bán một phần" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "RETURNED", label: "Đã trả về" },
  { value: "SETTLED", label: "Đã đối soát" },
  { value: "CANCELLED", label: "Đã hủy" },
];

interface ConsignmentFiltersProps {
  search: string;
  statusFilter: string;
  consignorFilter: string;
  storeFilter: string;
  consignors: Consignor[];
  stores: Store[];
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onConsignorChange: (v: string) => void;
  onStoreChange: (v: string) => void;
}

export function ConsignmentFilters({
  search,
  statusFilter,
  consignorFilter,
  storeFilter,
  consignors,
  stores,
  onSearchChange,
  onStatusChange,
  onConsignorChange,
  onStoreChange,
}: ConsignmentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900 sm:flex-row sm:items-end">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Tìm theo mã lô, bên giao, cửa hàng..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-2 flex-wrap sm:shrink-0">
        <Select value={consignorFilter} onValueChange={onConsignorChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Bên giao hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả bên giao</SelectItem>
            {consignors.map((cg) => (
              <SelectItem key={cg.id} value={cg.id}>
                {cg.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={storeFilter} onValueChange={onStoreChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Cửa hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả cửa hàng</SelectItem>
            {stores.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
