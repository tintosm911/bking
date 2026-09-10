import { NextRequest, NextResponse } from 'next/server';
import { buildBazi, formatBazi } from '@/lib/bazi_engine';
import { deepenOracleReply } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, gender } = body;

    if (!year || !month || !day || hour === undefined || gender === undefined) {
      return NextResponse.json(
        { error: '缺少必填参数：year, month, day, hour, gender' },
        { status: 400 }
      );
    }

    const numYear = Number(year);
    const result = buildBazi(numYear, Number(month), Number(day), Number(hour), Number(gender));

    // 生成排盘纯文本（供展示 / TTS 朗读 / DeepSeek 深化解读上下文）
    const formatted = formatBazi(result);
    Object.assign(result, { formatted });

    // C 档③：DeepSeek 深化解读（有 key 时加深『命格解读』，无 key 静默降级）
    const deepened = await deepenOracleReply(
      formatted,
      "八字",
      { year: numYear, month: Number(month), day: Number(day), hour: Number(hour) }
    );
    if (deepened) {
      Object.assign(result, { _deepen: deepened });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}