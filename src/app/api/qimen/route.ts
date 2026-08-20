import { NextRequest, NextResponse } from 'next/server';
import { qimenMasterPan } from '@/lib/qimen_engine';

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
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}