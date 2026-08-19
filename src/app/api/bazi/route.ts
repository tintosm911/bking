import { NextRequest, NextResponse } from 'next/server';
import { spawnSync } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, minute, gender } = body;

    if (!year || !month || !day || hour === undefined || gender === undefined) {
      return NextResponse.json(
        { error: '缺少必填参数：year, month, day, hour, gender' },
        { status: 400 }
      );
    }

    // 调用 Python 排盘引擎
    const enginePath = path.join(process.cwd(), 'src/lib/bazi_engine.py');
    const script = `
import sys
sys.path.insert(0, '${path.dirname(enginePath)}')
from bazi_engine import build_bazi, format_bazi
import json

bazi = build_bazi(${year}, ${month}, ${day}, ${hour}, ${gender})
formatted = format_bazi(bazi)
result = {
    **bazi,
    "formatted": formatted
}
print(json.dumps(result, ensure_ascii=False))
`;

    const result = spawnSync('python3', ['-c', script], {
      encoding: 'utf-8',
      timeout: 10000,
    });

    if (result.error) {
      return NextResponse.json(
        { error: `排盘失败: ${result.error.message}` },
        { status: 500 }
      );
    }

    const output = result.stdout.trim();
    const data = JSON.parse(output);

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}