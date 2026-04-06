import "dotenv/config";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Bat dau tao tai khoan...");

  const hashedPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@consignpro.com" },
    update: {},
    create: {
      email: "admin@consignpro.com",
      password: hashedPassword,
      name: "Quan Tri Vien",
      role: "ADMIN",
    },
  });
  console.log("✓ ADMIN: admin@consignpro.com / admin123");

  await prisma.user.upsert({
    where: { email: "manager@consignpro.com" },
    update: {},
    create: {
      email: "manager@consignpro.com",
      password: hashedPassword,
      name: "Quan Ly",
      role: "MANAGER",
    },
  });
  console.log("✓ MANAGER: manager@consignpro.com / admin123");

  await prisma.user.upsert({
    where: { email: "staff@consignpro.com" },
    update: {},
    create: {
      email: "staff@consignpro.com",
      password: hashedPassword,
      name: "Nhan Vien",
      role: "STAFF",
    },
  });
  console.log("✓ STAFF: staff@consignpro.com / admin123");

  console.log("\nHoan tat! Cac tai khoan da san sang.");
}

main()
  .catch((e) => {
    console.error("LOI khi chay seeder:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
