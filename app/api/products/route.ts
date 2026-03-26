// app/api/products/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiCreated, apiError } from "@/lib/api/helpers";

function serializeProduct(p: Record<string, unknown>) {
  return {
    ...p,
    price: Number(p.price),
    createdAt: (p.createdAt as Date).toISOString(),
    updatedAt: (p.updatedAt as Date).toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const categoryFilter = searchParams.get("categoryFilter") ?? "";

  const products = await prisma.product.findMany({
    where: {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(categoryFilter && categoryFilter !== "Tất cả" && { category: categoryFilter }),
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(products.map(serializeProduct));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { consignorId: _removed, ...data } = body;
    const product = await prisma.product.create({ data });
    return apiCreated(serializeProduct(product as unknown as Record<string, unknown>));
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi tạo sản phẩm");
  }
}
