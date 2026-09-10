import { NextRequest, NextResponse } from 'next/server';
import { buildChart, formatChart } from '@/lib/zwei_engine';

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

    const result = buildChart(Number(year), Number(month), Number(day), Number(hour), Number(gender));

    // 生成排盘纯文本（供前端【排盘】区展示与 TTS 朗读）
    Object.assign(result as any, { formatted: formatChart(result) });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}