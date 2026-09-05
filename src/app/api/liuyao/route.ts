import { NextRequest, NextResponse } from "next/server";
import { liuyaoDivination, tossOnce } from "@/lib/liuyao_engine";
import { dayGanzhiOf } from "@/lib/day_ganzhi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { counts, year, month, day, method } = body || {};

    // 起卦日干：由日期算；默认今天
    const now = new Date();
    const y = Number(year) || now.getFullYear();
    const m = Number(month) || now.getMonth() + 1;
    const d = Number(day) || now.getDate();
    const dayGan = dayGanzhiOf(y, m, d);

    // counts：手动摇卦（6个正面数）或自动摇
    let tosses: number[];
    if (Array.isArray(counts) && counts.length === 6) {
      tosses = counts.map((c) => Number(c));
    } else {
      tosses = Array.from({ length: 6 }, () => tossOnce());
    }

    const result = liuyaoDivination(tosses, dayGan);
    return NextResponse.json({ success: true, dayGan, date: { y, m, d }, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}
