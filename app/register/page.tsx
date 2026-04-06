import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-primary">ConsignPro</h1>
          <p className="text-sm text-muted-foreground">
            Đăng ký tài khoản mới
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
