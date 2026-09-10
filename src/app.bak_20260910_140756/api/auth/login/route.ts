import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, updateUser } from "@/lib/db/users";
import crypto from "crypto";

export const runtime = "nodejs";

function generateToken(userId: number): string {
  const payload = JSON.stringify({ userId, ts: Date.now() });
  const secret = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
  const base64 = Buffer.from(payload).toString("base64");
  const sig = crypto.createHmac("sha256", secret).update(base64).digest("hex");
  return `${base64}.${sig}`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    updateUser(user.id, { last_login_at: new Date().toISOString() });

    const token = generateToken(user.id);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        birthday: user.birthday,
        wallet_address: user.wallet_address,
      },
    });
  } catch (err: any) {
    console.error("[Login] Error:", err);
    return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
  }
}