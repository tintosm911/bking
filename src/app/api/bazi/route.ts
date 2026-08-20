import { NextRequest, NextResponse } from 'next/server';
import { buildBazi } from '@/lib/bazi_engine';

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

    const result = buildBazi(Number(year), Number(month), Number(day), Number(hour), Number(gender));
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}