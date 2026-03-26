// app/api/settlements/preview/route.ts
import { NextRequest } from "next/server";
import { SettlementService } from "@/lib/services/settlementService";
import { apiSuccess, apiError } from "@/lib/api/helpers";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const consignmentId = searchParams.get("consignmentId") ?? "";

  if (!consignmentId) {
    return apiError("consignmentId is required");
  }

  try {
    const preview = await SettlementService.preview(consignmentId);
    return apiSuccess(preview);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi xem trước đối toán");
  }
}
