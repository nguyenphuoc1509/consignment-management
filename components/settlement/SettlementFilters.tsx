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
import { Consignment } from "@/types/consignment";
import { Store } from "@/types/store";
import { Consignor } from "@/types/consignor";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PAID", label: "Đã thanh toán" },
];

interface SettlementFiltersProps {
  search: string;
  statusFilter: string;
  storeFilter: string;
  consignorFilter: string;
  consignmentFilter: string;
  stores: Store[];
  consignors: Consignor[];
  consignments: Consignment[];
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onStoreChange: (v: string) => void;
  onConsignorChange: (v: string) => void;
  onConsignmentChange: (v: string) => void;
}

export function SettlementFilters({
  search,
  statusFilter,
  storeFilter,
  consignorFilter,
  consignmentFilter,
  stores,
  consignors,
  consignments,
  onSearchChange,
  onStatusChange,
  onStoreChange,
  onConsignorChange,
  onConsignmentChange,
}: SettlementFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:bg-zinc-900 sm:flex-row sm:items-end">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Tìm theo mã đối soát, lô ký gửi, bên giao..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-2 flex-wrap sm:shrink-0">
        <Select value={storeFilter} onValueChange={onStoreChange}>
          <SelectTrigger className="w-full sm:w-44">
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
        <Select value={consignorFilter} onValueChange={onConsignorChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Bên giao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả bên giao</SelectItem>
            {consignors.map((cg) => (
              <SelectItem key={cg.id} value={cg.id}>
                {cg.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={consignmentFilter} onValueChange={onConsignmentChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Lô ký gửi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lô</SelectItem>
            {consignments.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.code}
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
