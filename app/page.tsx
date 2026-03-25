import Link from "next/link";
import { Package, Users, ArrowLeftRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    href: "/dashboard/products",
    label: "Quản lý Sản phẩm",
    description: "SKU, giá, tỷ lệ hoa hồng",
    icon: Package,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    href: "/dashboard/consignors",
    label: "Quản lý Kho cung cấp",
    description: "Thông tin công ty, liên hệ",
    icon: Users,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    href: "/dashboard/consignments",
    label: "Quản lý Ký gửi",
    description: "Tạo và theo dõi lô ký gửi",
    icon: ArrowLeftRight,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    href: "/dashboard/sales",
    label: "Quản lý Bán hàng",
    description: "Ghi nhận sản phẩm bán ra",
    icon: ShoppingCart,
    color: "bg-green-500/10 text-green-600",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <ArrowLeftRight className="size-8" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">ConsignPro</h1>
          <p className="text-muted-foreground mt-1">
            Hệ thống quản lý ký gửi toàn diện
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-left">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
            >
              <div className={`flex size-9 items-center justify-center rounded-lg ${f.color}`}>
                <f.icon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {f.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                  {f.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <Button asChild size="lg" className="w-full">
          <Link href="/dashboard">Truy cập Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
