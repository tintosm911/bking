import { NextRequest, NextResponse } from 'next/server';
import { calcTianji } from '@/lib/tianji_engine';
import { masterDeepReading } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { members } = body;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: '缺少必填字段：members (非空数组)' },
        { status: 400 }
      );
    }

    // 校验每个成员必填字段
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name || !m.gender || !m.solar_date || !m.birth_time) {
        return NextResponse.json(
          { error: `成员 "${m.name || 'unknown'}" 缺少必填字段 (name, gender, solar_date, birth_time)` },
          { status: 400 }
        );
      }
    }

    const result = calcTianji({ members }) as any;

    // 拼装天机合盘排盘文本（供展示/TTS/详批数据源）
    const memLines: string[] = [];
    (result.members || []).forEach((mb: any, i: number) => {
      memLines.push(`【成员${i + 1}】${mb.name || ""}（${mb.gender || ""}）`);
      memLines.push(`  八字：${(mb.bazi || []).join(" ")}  纳音：${(mb.nayins || []).join(" ")}`);
      memLines.push(`  五行：${Object.entries(mb.wx || {}).map(([k, v]) => `${k}${v}`).join(" ")}  缺失：${(mb.missing_wx || []).join("、") || "无"}`);
      memLines.push(`  称骨：${Object.entries(mb.chenggu || {}).map(([k, v]) => `${k}${v}`).join(" ")}`);
    });
    const syn = result.synastry?.scores || {};
    const lines = [
      "━".repeat(40),
      "  天机合盘 · 配对详排",
      "━".repeat(40),
      "",
      ...memLines,
      "",
      "【合盘评分】",
      ...Object.entries(syn).map(([k, v]) => `  ${k}：${v}`),
      `  总分：${result.synastry?.total || ""} / ${result.synastry?.max_possible || ""}`,
      `  评级：${result.synastry?.rating || ""}`,
    ];
    const formatted = lines.join("\n");

    // 真人大师式详批
    const deepened = await masterDeepReading(
      formatted,
      "天机合盘",
      { year: 0, month: 0, day: 0, hour: 0 },
      { 用事: "双人配对合盘" }
    );
    if (deepened) Object.assign(result, { formatted, _deepen: deepened });
    else Object.assign(result, { formatted });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `天机测算失败: ${err.message || '未知错误'}` },
      { status: 500 }
    );
  }
}