// app/api/warehouses/inventory/route.ts
import { NextRequest } from "next/server";
import { WarehouseInventoryService } from "@/lib/services/warehouseInventoryService";
import { apiSuccess, apiCreated, apiError } from "@/lib/api/helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const warehouseId = searchParams.get("warehouseId");
    const availableOnly = searchParams.get("availableOnly") === "true";

    if (!warehouseId) return apiError("Thiếu warehouseId");

    const items = availableOnly
      ? await WarehouseInventoryService.getAvailableProducts(warehouseId)
      : await WarehouseInventoryService.getInventory(warehouseId);

    return apiSuccess(items);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi lấy tồn kho");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { warehouseId, productId, quantity } = body;

    if (!warehouseId || !productId || quantity === undefined) {
      return apiError("Thiếu warehouseId, productId hoặc quantity");
    }

    const item = await WarehouseInventoryService.upsertItem(
      warehouseId,
      productId,
      Number(quantity)
    );
    return apiSuccess(item);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi cập nhật tồn kho");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { warehouseId, productId, quantity } = body;

    if (!warehouseId || !productId || quantity === undefined) {
      return apiError("Thiếu warehouseId, productId hoặc quantity");
    }

    const item = await WarehouseInventoryService.upsertItem(
      warehouseId,
      productId,
      Number(quantity)
    );
    return apiCreated(item);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi thêm vào kho");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const warehouseId = searchParams.get("warehouseId");
    const productId = searchParams.get("productId");

    if (!warehouseId || !productId) {
      return apiError("Thiếu warehouseId hoặc productId");
    }

    await WarehouseInventoryService.deleteItem(warehouseId, productId);
    return new Response(null, { status: 204 });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi xóa khỏi kho");
  }
}
