import { NextRequest, NextResponse } from "next/server";
import { hehunDivination } from "@/lib/hehun_engine";
import { masterDeepReading } from "@/lib/llm";

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

    // 拼装合婚排盘纯文本（供展示/TTS/详批数据源）
    const r = result as any;
    const manP = r.man?.["四柱"] ?? {};
    const womanP = r.woman?.["四柱"] ?? {};
    const lines = [
      "━".repeat(40),
      "  八字合婚 · 大师版排盘",
      "━".repeat(40),
      "",
      `【男方】${r.manName || "男"}  四柱：${manP["年柱"]} / ${manP["月柱"]} / ${manP["日柱"]} / ${manP["时柱"]}`,
      `【女方】${r.womanName || "女"}  四柱：${womanP["年柱"]} / ${womanP["月柱"]} / ${womanP["日柱"]} / ${womanP["时柱"]}`,
      "",
      `【合婚得分】${r.totalScore} 分 · ${r.grade} ${r.gradeIcon}`,
      `【总评】${r.summary || ""}`,
      "",
      "【相合之处】",
      ...((r.chiHe || []).map((x: string) => `  · ${x}`)),
      "",
      "【相冲相害】",
      ...((r.chongHai || []).map((x: string) => `  · ${x}`)),
      "",
      "【分项评分】",
      ...((r.items || []).map((x: any) => `  ${x.dim}：${x.score}分（${x.good}）${x.text ? "· " + x.text : ""}`)),
    ];
    const formatted = lines.join("\n");
    Object.assign(r, { formatted });

    // 真人大师式详批（有 key 时产出落地详批，无 key 静默降级）
    const deepened = await masterDeepReading(
      formatted,
      "八字合婚",
      { year: Number(w.year), month: Number(w.month), day: Number(w.day), hour: Number(w.hour) },
      { 用事: "合婚配对" }
    );
    if (deepened) Object.assign(r, { _deepen: deepened });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}
