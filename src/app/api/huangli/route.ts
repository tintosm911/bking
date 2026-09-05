import { NextRequest, NextResponse } from "next/server";
import { huangliOf, wanliCalendar } from "@/lib/huangli_engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, days } = body || {};

    // 万年历模式：days>1 或显式 wanli=true
    if (days && Number(days) > 1) {
      const y = Number(year) || new Date().getFullYear();
      const m = Number(month) || new Date().getMonth() + 1;
      const d = Number(day) || new Date().getDate();
      const n = Math.min(Math.max(Number(days), 1), 60);
      const list = wanliCalendar(y, m, d, n);
      return NextResponse.json({ success: true, mode: "wanli", days: n, list });
    }

    // 今日黄历 / 指定日期
    const now = new Date();
    const y = Number(year) || now.getFullYear();
    const m = Number(month) || now.getMonth() + 1;
    const d = Number(day) || now.getDate();
    const result = huangliOf(y, m, d);

    return NextResponse.json({ success: true, mode: "today", date: { y, m, d }, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}
