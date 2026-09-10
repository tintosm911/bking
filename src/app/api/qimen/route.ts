import { NextRequest, NextResponse } from 'next/server';
import { qimenMasterPan, formatQimenOutput } from '@/lib/qimen_engine';
import { masterDeepReading } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, minute } = body;

    let dt: Date;
    if (year && month && day && hour !== undefined) {
      dt = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute ?? 0));
    } else {
      dt = new Date();
    }

    const result = qimenMasterPan(dt);

    // 生成排盘纯文本（供前端【基本信息】/【完整排盘】展示与 TTS 朗读）
    Object.assign(result as any, { formatted: formatQimenOutput(result) });

    // 真人大师式详批（有 key 时产出落地详批，无 key 静默降级）
    const deepened = await masterDeepReading(
      (result as any).formatted,
      "奇门遁甲",
      { year: Number(year), month: Number(month), day: Number(day), hour: Number(hour) },
      { 用事: "择时决策" }
    );
    if (deepened) Object.assign(result as any, { _deepen: deepened });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}