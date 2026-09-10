import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail } from "@/lib/db/users";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email, password, nickname, birthday, birth_hour, birth_place, gender } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码至少 6 位" },
        { status: 400 }
      );
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "该邮箱已注册" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = createUser({
      email,
      passwordHash,
      nickname: nickname || null,
      birthday: birthday || null,
      birth_hour: birth_hour || null,
      birth_place: birth_place || null,
      gender: gender || null,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        created_at: user.created_at,
      },
    });
  } catch (err: any) {
    console.error("[Register] Error:", err);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}