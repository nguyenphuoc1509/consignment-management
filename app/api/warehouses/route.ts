// app/api/warehouses/route.ts
import { NextRequest } from "next/server";
import { WarehouseService } from "@/lib/services/warehouseService";
import { apiSuccess, apiCreated, apiError } from "@/lib/api/helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const consignorId = searchParams.get("consignorId") ?? undefined;
    const warehouses = await WarehouseService.getAll(consignorId);
    return apiSuccess(warehouses);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi lấy danh sách kho");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, consignorId, address, contactPerson, phone, note } = body;

    if (!code?.trim()) return apiError("Mã kho là bắt buộc.", 400);
    if (!name?.trim()) return apiError("Tên kho là bắt buộc.", 400);
    if (!consignorId) return apiError("Phải chọn kho cung cấp.", 400);

    const warehouse = await WarehouseService.create({
      code: code.trim(),
      name: name.trim(),
      consignorId,
      address: address?.trim() || undefined,
      contactPerson: contactPerson?.trim() || undefined,
      phone: phone?.trim() || undefined,
      note: note?.trim() || undefined,
    });

    return apiCreated(warehouse);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi tạo kho");
  }
}
