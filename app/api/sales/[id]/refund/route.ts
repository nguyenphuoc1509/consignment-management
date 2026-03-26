// app/api/sales/[id]/refund/route.ts
import { NextRequest } from "next/server";
import { SaleService } from "@/lib/services/saleService";
import { apiSuccess, apiError } from "@/lib/api/helpers";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await SaleService.refundSale(id);
    return apiSuccess(result);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi hoàn tiền");
  }
}
