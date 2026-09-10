import { NextRequest, NextResponse } from "next/server";
import { tuifaDivination } from "@/lib/tuifa_engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, gender } = body || {};
    if (!year || !month || !day) {
      return NextResponse.json({ error: "请提供出生年月日" }, { status: 400 });
    }
    const result = tuifaDivination(Number(year), Number(month), Number(day));
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}
