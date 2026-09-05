import { NextRequest, NextResponse } from "next/server";
import { hehunDivination } from "@/lib/hehun_engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { man, woman, manName, womanName } = body || {};

    if (!man || !woman) {
      return NextResponse.json({ error: "请同时提供男方与女方的生辰" }, { status: 400 });
    }

    const m = {
      year: Number(man.year), month: Number(man.month), day: Number(man.day),
      hour: Number(man.hour ?? 12), gender: Number(man.gender ?? 1),
    };
    const w = {
      year: Number(woman.year), month: Number(woman.month), day: Number(woman.day),
      hour: Number(woman.hour ?? 12), gender: Number(woman.gender ?? 2),
    };

    if (!m.year || !m.month || !m.day || !w.year || !w.month || !w.day) {
      return NextResponse.json({ error: "生辰信息不完整" }, { status: 400 });
    }

    const result = hehunDivination(m, w);
    if (manName) result.manName = String(manName);
    if (womanName) result.womanName = String(womanName);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}
