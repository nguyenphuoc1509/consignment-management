import { NextRequest } from "next/server";
import { apiError, apiCreated } from "@/lib/api/helpers";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email) {
      return apiError("Email là bắt buộc", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError("Email không hợp lệ", 400);
    }

    if (!password) {
      return apiError("Mật khẩu là bắt buộc", 400);
    }

    if (password.length < 6) {
      return apiError("Mật khẩu phải có ít nhất 6 ký tự", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("Email đã tồn tại trong hệ thống", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: "STAFF",
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return apiCreated(user);
  } catch (err) {
    console.error("[REGISTER_ERROR]", err);
    return apiError("Lỗi khi đăng ký tài khoản. Vui lòng thử lại sau.", 500);
  }
}
