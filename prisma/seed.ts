import { PrismaClient, ConsignorStatus, StoreStatus, ProductStatus, ConsignmentStatus, ConsignmentItemStatus, SaleStatus, SettlementStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ── Clean existing data (reverse dependency order) ──
  await prisma.settlement.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.consignmentItem.deleteMany();
  await prisma.consignment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.consignor.deleteMany();

  // ══════════════════════════════════════════════════
  // CONSIGNORS
  // ══════════════════════════════════════════════════
  const cg001 = await prisma.consignor.create({
    data: {
      code: "MY-FASHION",
      companyName: "Công ty TNHH Thời Trang My",
      contactPerson: "Trần Minh Thanh",
      phone: "0901234567",
      email: "minhthanh@thoitrangmy.vn",
      address: "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
      status: ConsignorStatus.ACTIVE,
    },
  });

  const cg002 = await prisma.consignor.create({
    data: {
      code: "VIETSHOES",
      companyName: "Hãng Giày Dép VietShoes",
      contactPerson: "Lê Hoàng Nam",
      phone: "0912345678",
      email: "nam@vietshoes.com.vn",
      address: "45 Lê Văn Việt, Quận 9, TP. Hồ Chí Minh",
      status: ConsignorStatus.ACTIVE,
    },
  });

  const cg003 = await prisma.consignor.create({
    data: {
      code: "HL-ACCESSORY",
      companyName: "Cửa hàng Phụ Kiện H&L",
      contactPerson: "Phạm Thu Hà",
      phone: "0934567890",
      email: "hah@hlaccessory.com",
      address: "78 Đường 3/2, Quận 10, TP. Hồ Chí Minh",
      status: ConsignorStatus.ACTIVE,
    },
  });

  const cg004 = await prisma.consignor.create({
    data: {
      code: "KIM-LONG",
      companyName: "Công ty TNHH Trang Sức Cao Cấp Kim Long",
      contactPerson: "Nguyễn Văn An",
      phone: "0945678901",
      email: "an@kimlongjewelry.vn",
      address: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
      status: ConsignorStatus.INACTIVE,
    },
  });

  // ══════════════════════════════════════════════════
  // STORES
  // ══════════════════════════════════════════════════
  const st001 = await prisma.store.create({
    data: {
      code: "CP-STORE",
      name: "Cửa hàng Central Park",
      address: "123 Nguyễn Huệ, Phường Bến Nghé",
      ward: "Bến Nghé",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh",
      contactPerson: "Trần Thu Trang",
      phone: "0902111222",
      email: "centralpark@stores.vn",
      status: StoreStatus.ACTIVE,
    },
  });

  const st002 = await prisma.store.create({
    data: {
      code: "Q3-STORE",
      name: "Chi nhánh Quận 3",
      address: "56 Đường 3/2, Phường 4",
      ward: "Phường 4",
      district: "Quận 3",
      city: "TP. Hồ Chí Minh",
      contactPerson: "Lê Minh Khoa",
      phone: "0902333444",
      email: "quan3@stores.vn",
      status: StoreStatus.ACTIVE,
    },
  });

  const st003 = await prisma.store.create({
    data: {
      code: "PMH-STORE",
      name: "Siêu thị Phú Mỹ Hưng",
      address: "789 Đại lộ Nam Kỳ Khởi Nghĩa",
      ward: "Tân Phú",
      district: "Quận 7",
      city: "TP. Hồ Chí Minh",
      contactPerson: "Phạm Đình Phong",
      phone: "0902555666",
      email: "phumyhung@stores.vn",
      status: StoreStatus.ACTIVE,
    },
  });

  const st004 = await prisma.store.create({
    data: {
      code: "TB-STORE",
      name: "Điểm bán Tân Bình",
      address: "34 Hoàng Văn Thụ",
      ward: "Phường 2",
      district: "Tân Bình",
      city: "TP. Hồ Chí Minh",
      contactPerson: "Nguyễn Thị Lan",
      phone: "0902777888",
      email: "tanbinh@stores.vn",
      status: StoreStatus.INACTIVE,
    },
  });

  // ══════════════════════════════════════════════════
  // PRODUCTS
  // ══════════════════════════════════════════════════
  const sp001 = await prisma.product.create({
    data: {
      sku: "ASM-001",
      name: "Áo sơ mi nam trắng dài tay",
      category: "Thời trang",
      unit: "cái",
      price: new Decimal(299000),
      commissionRate: new Decimal(0.20),
      description: "Áo sơ mi nam chất liệu cotton 100%, form regular fit, phù hợp mặc đi làm và dạo phố.",
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
      status: ProductStatus.ACTIVE,
      consignorId: cg001.id,
    },
  });

  const sp002 = await prisma.product.create({
    data: {
      sku: "GTN-001",
      name: "Giày thể thao nam Ultra Run",
      category: "Giày dép",
      unit: "đôi",
      price: new Decimal(650000),
      commissionRate: new Decimal(0.25),
      description: "Giày thể thao thiết kế nhẹ, đế EVA êm ái, phù hợp chạy bộ và tập gym.",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      status: ProductStatus.ACTIVE,
      consignorId: cg002.id,
    },
  });

  const sp003 = await prisma.product.create({
    data: {
      sku: "TXN-001",
      name: "Túi xách nữ da tổng hợp Elegance",
      category: "Túi xách",
      unit: "cái",
      price: new Decimal(480000),
      commissionRate: new Decimal(0.30),
      description: "Túi xách nữ da tổng hợp cao cấp, nhiều ngăn, màu đen thanh lịch.",
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
      status: ProductStatus.ACTIVE,
      consignorId: cg003.id,
    },
  });

  const sp004 = await prisma.product.create({
    data: {
      sku: "DCV-001",
      name: "Dây chuyền vàng 18K simple",
      category: "Trang sức",
      unit: "cái",
      price: new Decimal(1250000),
      commissionRate: new Decimal(0.15),
      description: "Dây chuyền vàng 18K thiết kế tối giản, phù hợp nhiều hoàn cảnh.",
      status: ProductStatus.ACTIVE,
      consignorId: cg001.id,
    },
  });

  const sp005 = await prisma.product.create({
    data: {
      sku: "KRM-001",
      name: "Kính râm nam UV400 Polarized",
      category: "Phụ kiện",
      unit: "cái",
      price: new Decimal(380000),
      commissionRate: new Decimal(0.22),
      description: "Kính râm nam chống tia UV400, tròng polarized giảm chói, gọng kim loại.",
      imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
      status: ProductStatus.INACTIVE,
      consignorId: cg002.id,
    },
  });

  const sp006 = await prisma.product.create({
    data: {
      sku: "VHM-001",
      name: "Váy hoa midi nữ mùa hè",
      category: "Thời trang",
      unit: "cái",
      price: new Decimal(395000),
      commissionRate: new Decimal(0.20),
      description: "Váy hoa midi cho nữ, chất vải voan nhẹ thoáng mát, hoa văn rực rỡ.",
      imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
      status: ProductStatus.ACTIVE,
      consignorId: cg003.id,
    },
  });

  const sp007 = await prisma.product.create({
    data: {
      sku: "BNN-001",
      name: "Bình nước giữ nhiệt 1.5L",
      category: "Đồ gia dụng",
      unit: "cái",
      price: new Decimal(220000),
      commissionRate: new Decimal(0.18),
      description: "Bình nước giữ nhiệt dung tích 1.5L, vỏ inox 304, giữ nóng/lạnh đến 12 giờ.",
      imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
      status: ProductStatus.ACTIVE,
      consignorId: cg001.id,
    },
  });

  const sp008 = await prisma.product.create({
    data: {
      sku: "SMQ-001",
      name: "Son môi lì BHQ matte 04",
      category: "Mỹ phẩm",
      unit: "thỏi",
      price: new Decimal(185000),
      commissionRate: new Decimal(0.35),
      description: "Son môi lì BHQ matte màu đỏ rượu vang 04, lâu trôi, không khô môi.",
      imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400",
      status: ProductStatus.ACTIVE,
      consignorId: cg003.id,
    },
  });

  // ══════════════════════════════════════════════════
  // CONSIGNMENTS
  // ══════════════════════════════════════════════════
  const kg001 = await prisma.consignment.create({
    data: {
      code: "KG-2026-001",
      status: ConsignmentStatus.PARTIAL_SOLD,
      sentDate: new Date("2026-03-10"),
      expectedReturnDate: new Date("2026-04-10"),
      note: "Lô hàng đầu mùa, theo dõi sát tình hình bán.",
      consignorId: cg001.id,
      storeId: st001.id,
    },
  });

  const kg002 = await prisma.consignment.create({
    data: {
      code: "KG-2026-002",
      status: ConsignmentStatus.SENT,
      sentDate: new Date("2026-03-05"),
      expectedReturnDate: new Date("2026-04-05"),
      note: "Giao đúng tiến độ.",
      consignorId: cg002.id,
      storeId: st002.id,
    },
  });

  const kg003 = await prisma.consignment.create({
    data: {
      code: "KG-2026-003",
      status: ConsignmentStatus.COMPLETED,
      sentDate: new Date("2026-02-20"),
      expectedReturnDate: new Date("2026-03-20"),
      note: "Đã bán hết, không có hàng trả về.",
      consignorId: cg003.id,
      storeId: st003.id,
    },
  });

  const kg004 = await prisma.consignment.create({
    data: {
      code: "KG-2026-004",
      status: ConsignmentStatus.PENDING,
      sentDate: new Date("2026-03-15"),
      expectedReturnDate: new Date("2026-04-15"),
      note: "",
      consignorId: cg001.id,
      storeId: st002.id,
    },
  });

  const kg005 = await prisma.consignment.create({
    data: {
      code: "KG-2026-005",
      status: ConsignmentStatus.SETTLED,
      sentDate: new Date("2026-02-01"),
      expectedReturnDate: new Date("2026-03-01"),
      actualReturnDate: new Date("2026-03-05"),
      note: "Đã đối soát thanh toán tháng 2/2026.",
      consignorId: cg003.id,
      storeId: st001.id,
    },
  });

  // ══════════════════════════════════════════════════
  // CONSIGNMENT ITEMS
  // ══════════════════════════════════════════════════
  await prisma.consignmentItem.createMany({
    data: [
      // KG-001 items (PARTIAL_SOLD)
      { consignmentId: kg001.id, productId: sp001.id, quantitySent: 20, quantitySold: 12, quantityReturned: 6, quantityDamaged: 0, status: ConsignmentItemStatus.ACTIVE },
      { consignmentId: kg001.id, productId: sp004.id, quantitySent: 10, quantitySold: 3, quantityReturned: 5, quantityDamaged: 2, status: ConsignmentItemStatus.ACTIVE },
      { consignmentId: kg001.id, productId: sp007.id, quantitySent: 15, quantitySold: 8, quantityReturned: 7, quantityDamaged: 0, status: ConsignmentItemStatus.ACTIVE },
      // KG-002 items (SENT)
      { consignmentId: kg002.id, productId: sp002.id, quantitySent: 25, quantitySold: 0, quantityReturned: 0, quantityDamaged: 0, status: ConsignmentItemStatus.ACTIVE },
      { consignmentId: kg002.id, productId: sp005.id, quantitySent: 12, quantitySold: 0, quantityReturned: 0, quantityDamaged: 0, status: ConsignmentItemStatus.ACTIVE },
      // KG-003 items (COMPLETED)
      { consignmentId: kg003.id, productId: sp008.id, quantitySent: 30, quantitySold: 30, quantityReturned: 0, quantityDamaged: 0, status: ConsignmentItemStatus.SOLD_OUT },
      { consignmentId: kg003.id, productId: sp003.id, quantitySent: 10, quantitySold: 10, quantityReturned: 0, quantityDamaged: 0, status: ConsignmentItemStatus.SOLD_OUT },
      // KG-004 items (PENDING)
      { consignmentId: kg004.id, productId: sp001.id, quantitySent: 18, quantitySold: 0, quantityReturned: 0, quantityDamaged: 0, status: ConsignmentItemStatus.ACTIVE },
      { consignmentId: kg004.id, productId: sp006.id, quantitySent: 12, quantitySold: 0, quantityReturned: 0, quantityDamaged: 0, status: ConsignmentItemStatus.ACTIVE },
      // KG-005 items (SETTLED)
      { consignmentId: kg005.id, productId: sp008.id, quantitySent: 20, quantitySold: 20, quantityReturned: 0, quantityDamaged: 0, status: ConsignmentItemStatus.SOLD_OUT },
    ],
  });

  // ══════════════════════════════════════════════════
  // SALES
  // ══════════════════════════════════════════════════
  const ki001 = await prisma.consignmentItem.findFirst({ where: { consignmentId: kg001.id, productId: sp001.id } });
  const ki002 = await prisma.consignmentItem.findFirst({ where: { consignmentId: kg001.id, productId: sp004.id } });
  const ki003 = await prisma.consignmentItem.findFirst({ where: { consignmentId: kg001.id, productId: sp007.id } });
  const ki006 = await prisma.consignmentItem.findFirst({ where: { consignmentId: kg003.id, productId: sp008.id } });
  const ki007 = await prisma.consignmentItem.findFirst({ where: { consignmentId: kg003.id, productId: sp003.id } });
  const ki010 = await prisma.consignmentItem.findFirst({ where: { consignmentId: kg005.id, productId: sp008.id } });

  await prisma.sale.createMany({
    data: [
      // Sales from KG-001 (ST-001)
      { consignmentId: kg001.id, productId: sp001.id, storeId: st001.id, quantity: 3, soldPrice: new Decimal(299000), grossAmount: new Decimal(897000), soldAt: new Date("2026-03-12T09:00:00Z"), status: SaleStatus.COMPLETED, note: "Khách hàng quen." },
      { consignmentId: kg001.id, productId: sp001.id, storeId: st001.id, quantity: 5, soldPrice: new Decimal(299000), grossAmount: new Decimal(1495000), soldAt: new Date("2026-03-14T10:30:00Z"), status: SaleStatus.COMPLETED },
      { consignmentId: kg001.id, productId: sp001.id, storeId: st001.id, quantity: 4, soldPrice: new Decimal(279000), grossAmount: new Decimal(1116000), soldAt: new Date("2026-03-16T14:00:00Z"), status: SaleStatus.COMPLETED, note: "Giảm giá khuyến mãi 20K/sản phẩm." },
      { consignmentId: kg001.id, productId: sp004.id, storeId: st001.id, quantity: 2, soldPrice: new Decimal(1250000), grossAmount: new Decimal(2500000), soldAt: new Date("2026-03-13T11:00:00Z"), status: SaleStatus.COMPLETED },
      { consignmentId: kg001.id, productId: sp004.id, storeId: st001.id, quantity: 1, soldPrice: new Decimal(1200000), grossAmount: new Decimal(1200000), soldAt: new Date("2026-03-15T16:00:00Z"), status: SaleStatus.COMPLETED, note: "Khách thương lượng giảm giá." },
      { consignmentId: kg001.id, productId: sp007.id, storeId: st001.id, quantity: 8, soldPrice: new Decimal(220000), grossAmount: new Decimal(1760000), soldAt: new Date("2026-03-14T09:00:00Z"), status: SaleStatus.COMPLETED },
      // Cancelled sale (SL-013 from KG-001)
      { consignmentId: kg001.id, productId: sp007.id, storeId: st001.id, quantity: 2, soldPrice: new Decimal(200000), grossAmount: new Decimal(400000), soldAt: new Date("2026-03-13T12:00:00Z"), status: SaleStatus.CANCELLED, note: "Khách trả lại do lỗi — đã hoàn tiền." },
      // Sales from KG-003 (ST-003) — all completed
      { consignmentId: kg003.id, productId: sp008.id, storeId: st003.id, quantity: 15, soldPrice: new Decimal(185000), grossAmount: new Decimal(2775000), soldAt: new Date("2026-02-22T10:00:00Z"), status: SaleStatus.COMPLETED },
      { consignmentId: kg003.id, productId: sp008.id, storeId: st003.id, quantity: 10, soldPrice: new Decimal(175000), grossAmount: new Decimal(1750000), soldAt: new Date("2026-03-01T14:00:00Z"), status: SaleStatus.COMPLETED, note: "Khuyến mãi cuối tháng." },
      { consignmentId: kg003.id, productId: sp008.id, storeId: st003.id, quantity: 5, soldPrice: new Decimal(185000), grossAmount: new Decimal(925000), soldAt: new Date("2026-03-05T11:00:00Z"), status: SaleStatus.COMPLETED },
      { consignmentId: kg003.id, productId: sp003.id, storeId: st003.id, quantity: 6, soldPrice: new Decimal(480000), grossAmount: new Decimal(2880000), soldAt: new Date("2026-02-25T09:00:00Z"), status: SaleStatus.COMPLETED },
      { consignmentId: kg003.id, productId: sp003.id, storeId: st003.id, quantity: 4, soldPrice: new Decimal(450000), grossAmount: new Decimal(1800000), soldAt: new Date("2026-03-02T15:00:00Z"), status: SaleStatus.COMPLETED, note: "Giảm giá 30K sản phẩm." },
      // Sales from KG-005 (ST-001) — settled
      { consignmentId: kg005.id, productId: sp008.id, storeId: st001.id, quantity: 20, soldPrice: new Decimal(185000), grossAmount: new Decimal(3700000), soldAt: new Date("2026-02-10T10:00:00Z"), status: SaleStatus.COMPLETED },
    ],
  });

  // ══════════════════════════════════════════════════
  // SETTLEMENTS
  // ══════════════════════════════════════════════════
  await prisma.settlement.createMany({
    data: [
      {
        code: "DS-2026-001",
        status: SettlementStatus.PAID,
        totalSalesAmount: new Decimal(3700000),
        totalCommissionAmount: new Decimal(1295000),
        totalPayableAmount: new Decimal(2405000),
        totalQuantitySold: 20,
        totalQuantityReturned: 0,
        totalQuantityDamaged: 0,
        adjustmentAmount: new Decimal(0),
        settledAt: new Date("2026-03-05T11:00:00Z"),
        paidAt: new Date("2026-03-05T11:00:00Z"),
        note: "Đã đối soát thanh toán tháng 2/2026.",
        consignmentId: kg005.id,
      },
      {
        code: "DS-2026-002",
        status: SettlementStatus.PENDING,
        totalSalesAmount: new Decimal(8467000),
        totalCommissionAmount: new Decimal(1736400),
        totalPayableAmount: new Decimal(6730600),
        totalQuantitySold: 23,
        totalQuantityReturned: 11,
        totalQuantityDamaged: 2,
        adjustmentAmount: new Decimal(0),
        settledAt: new Date("2026-03-20T14:30:00Z"),
        note: "Đối soát lô KG-001 theo dõi từ 15/3.",
        consignmentId: kg001.id,
      },
      {
        code: "DS-2026-003",
        status: SettlementStatus.CONFIRMED,
        totalSalesAmount: new Decimal(10130000),
        totalCommissionAmount: new Decimal(3545500),
        totalPayableAmount: new Decimal(6584500),
        totalQuantitySold: 40,
        totalQuantityReturned: 0,
        totalQuantityDamaged: 0,
        adjustmentAmount: new Decimal(0),
        settledAt: new Date("2026-03-18T16:00:00Z"),
        note: "Đối soát lô KG-003 — lô đã bán hết, chờ thanh toán.",
        consignmentId: kg003.id,
      },
    ],
  });

  console.log("✅ Seed completed!");
  console.log(`   Consignors: 4`);
  console.log(`   Stores: 4`);
  console.log(`   Products: 8`);
  console.log(`   Consignments: 5`);
  console.log(`   ConsignmentItems: 10`);
  console.log(`   Sales: 13`);
  console.log(`   Settlements: 3`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
