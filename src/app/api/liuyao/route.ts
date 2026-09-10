import { NextRequest, NextResponse } from "next/server";
import { liuyaoDivination, tossOnce } from "@/lib/liuyao_engine";
import { dayGanzhiOf } from "@/lib/day_ganzhi";
import { masterDeepReading } from "@/lib/llm";

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

    const result = liuyaoDivination(tosses, dayGan) as any;

    // 拼装排盘文本（供展示/TTS/详批数据源）
    const lines = [
      "━".repeat(40),
      "  六爻解卦 · 排盘",
      "━".repeat(40),
      "",
      `起卦日：${y}年${m}月${d}日 · 日干「${dayGan}」`,
      "",
      `本卦：${result.benGua?.name || ""}（${result.benGua?.symbol || ""} ${result.benGua?.element || ""}）${result.benGua?.upper || ""}上${result.benGua?.lower || ""}下`,
      `变卦：${result.bianGua?.name || ""}（${result.bianGua?.symbol || ""} ${result.bianGua?.element || ""}）`,
      `宫位：${result.gong || ""} · 卦型：${result.stage || ""} · 动爻：${result.movingCount || 0}个`,
      "",
      "【六爻详列】",
      ...((result.yaos || []).map((ya: any) =>
        `  第${ya.index}爻 ${ya.line || ""} ${ya.type || ""} 五行${ya.element || ""} 六亲${ya.liuqin || ""} 六神${ya.liushen || ""}${ya.moving ? " [动]":""}`
      )),
    ];
    const formatted = lines.join("\n");

    // 真人大师式详批
    const deepened = await masterDeepReading(
      formatted,
      "六爻卜卦",
      { year: y, month: m, day: d, hour: 0 },
      { 用事: "问事占卜" }
    );
    if (deepened) Object.assign(result, { _deepen: deepened, formatted });

    return NextResponse.json({ success: true, dayGan, date: { y, m, d }, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}
