import { NextRequest, NextResponse } from "next/server";
import { zeyiDivination, SHIWU_LIST } from "@/lib/zeyi_engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shiwu, fromYear, fromMonth, fromDay, toYear, toMonth, toDay } = body || {};
    const now = new Date();

    const fy = Number(fromYear) || now.getFullYear();
    const fm = Number(fromMonth) || now.getMonth() + 1;
    const fd = Number(fromDay) || now.getDate();
    const ty = Number(toYear) || fy;
    const tm = Number(toMonth) || fm;
    const td = Number(toDay) || fd + 30;

    const result = zeyiDivination(shiwu, fy, fm, fd, ty, tm, td);
    return NextResponse.json({ success: true, shiwuList: SHIWU_LIST, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}
