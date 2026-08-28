import { NextRequest, NextResponse } from 'next/server';
import { calcTianji } from '@/lib/tianji_engine';

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

    const result = calcTianji({ members });

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