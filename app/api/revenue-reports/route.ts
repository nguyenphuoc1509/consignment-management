// app/api/revenue-reports/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiCreated } from "@/lib/api/helpers";

function generateCode(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const storeFilter = searchParams.get("storeId") ?? "";
  const statusFilter = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";

  const reports = await prisma.revenueReport.findMany({
    where: {
      ...(storeFilter && { storeId: storeFilter }),
      ...(statusFilter && { status: statusFilter as never }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { note: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      store: { select: { name: true, code: true } },
      items: {
        include: {
          product: { select: { name: true, sku: true } },
          consignment: { select: { code: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      createdByUser: { select: { name: true } },
      auditLogs: {
        include: { performedByUser: { select: { name: true } } },
        orderBy: { performedAt: "desc" },
      },
    },
    orderBy: { reportDate: "desc" },
  });

  const enriched = reports.map((r) => ({
    ...r,
    storeName: r.store.name,
    storeCode: r.store.code,
    totalAmount: r.items.reduce(
      (sum, i) => sum + Number(i.totalAmount),
      0
    ),
    totalQuantity: r.items.reduce((sum, i) => sum + i.quantity, 0),
    createdByName: r.createdByUser?.name,
    items: r.items.map((i) => ({
      ...i,
      productName: i.product.name,
      productSku: i.product.sku,
      consignmentCode: i.consignment.code,
      soldPrice: Number(i.soldPrice),
      totalAmount: Number(i.totalAmount),
    })),
    auditLogs: r.auditLogs.map((a) => ({
      ...a,
      performedByName: a.performedByUser?.name,
    })),
  }));

  return apiSuccess(enriched);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      storeId,
      reportDate,
      note,
      items,
    }: {
      storeId: string;
      reportDate: string;
      note?: string;
      items: {
        consignmentId: string;
        consignmentItemId: string;
        productId: string;
        quantity: number;
        soldPrice: number;
      }[];
    } = body;

    if (!storeId || !reportDate || !items?.length) {
      return apiError("Thông tin báo cáo không hợp lệ.");
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return apiError("Không tìm thấy cửa hàng.");

    const result = await prisma.$transaction(async (tx) => {
      const report = await tx.revenueReport.create({
        data: {
          code: generateCode("RR"),
          storeId,
          reportDate: new Date(reportDate),
          note,
          status: "CONFIRMED",
          items: {
            create: items.map((item) => ({
              consignmentId: item.consignmentId,
              consignmentItemId: item.consignmentItemId,
              productId: item.productId,
              quantity: item.quantity,
              soldPrice: item.soldPrice,
              totalAmount: item.quantity * item.soldPrice,
            })),
          },
        },
        include: {
          store: { select: { name: true, code: true } },
          items: {
            include: {
              product: { select: { name: true, sku: true } },
              consignment: { select: { code: true } },
            },
          },
          auditLogs: {
            include: { performedByUser: { select: { name: true } } },
          },
          createdByUser: { select: { name: true } },
        },
      });

      await tx.revenueAuditLog.create({
        data: {
          revenueReportId: report.id,
          action: "CREATED",
          newValue: report.code,
        },
      });

      return report;
    });

    const enriched = {
      ...result,
      storeName: result.store.name,
      storeCode: result.store.code,
      totalAmount: result.items.reduce(
        (sum, i) => sum + Number(i.totalAmount),
        0
      ),
      totalQuantity: result.items.reduce((sum, i) => sum + i.quantity, 0),
      createdByName: result.createdByUser?.name,
      items: result.items.map((i) => ({
        ...i,
        productName: i.product.name,
        productSku: i.product.sku,
        consignmentCode: i.consignment.code,
        soldPrice: Number(i.soldPrice),
        totalAmount: Number(i.totalAmount),
      })),
      auditLogs: result.auditLogs.map((a) => ({
        ...a,
        performedByName: a.performedByUser?.name,
      })),
    };

    return apiCreated(enriched);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Lỗi khi tạo báo cáo doanh thu.");
  }
}
