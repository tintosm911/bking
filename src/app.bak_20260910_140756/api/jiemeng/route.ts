import { NextRequest, NextResponse } from "next/server";
import { jieMeng, MENG_DICT } from "@/lib/jiemeng_engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = (body?.text || "").trim();
    if (!text) {
      return NextResponse.json({ error: "请输入梦境内容" }, { status: 400 });
    }
    const result = jieMeng(text);
    return NextResponse.json({ success: true, dictSize: MENG_DICT.length, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}
