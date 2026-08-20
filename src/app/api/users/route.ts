import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser, getUserStats } from "@/lib/db/users";

export const runtime = "nodejs";

function getUserIdFromToken(req: NextRequest): number | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[0], "base64").toString());
    return payload.userId || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const user = getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await request.json();
  const allowedFields = [
    "nickname", "birthday", "birth_hour", "birth_place", "gender", "wallet_address"
  ] as const;

  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const user = updateUser(userId, updates);
  return NextResponse.json({ success: true, user });
}