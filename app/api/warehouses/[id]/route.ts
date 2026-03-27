// app/api/warehouses/[id]/route.ts
import { NextRequest } from "next/server";
import { WarehouseService } from "@/lib/services/warehouseService";
import { apiSuccess, apiError, apiNotFound, apiNoContent } from "@/lib/api/helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const warehouse = await WarehouseService.getById(id);
    if (!warehouse) return apiNotFound("Không tìm thấy kho");
    return apiSuccess(warehouse);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi lấy kho");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const warehouse = await WarehouseService.update(id, body);
    return apiSuccess(warehouse);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi cập nhật kho");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await WarehouseService.delete(id);
    return apiNoContent();
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi xóa kho");
  }
}
