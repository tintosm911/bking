import { NextRequest, NextResponse } from 'next/server';
import { spawnSync } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, gender } = body;
    if (!year || !month || !day || hour === undefined || gender === undefined) {
      return NextResponse.json({ error: '缺少必填参数' }, { status: 400 });
    }
    const enginePath = path.join(process.cwd(), 'src/lib/zwei_engine.py');
    const script = `
import sys
sys.path.insert(0, '${path.dirname(enginePath).replace(/'/g, "'\\''")}')
from zwei_engine import build_chart, format_chart
import json
chart = build_chart(${year}, ${month}, ${day}, ${hour}, ${gender})
formatted = format_chart(chart)
result = {**chart, "formatted": formatted}
print(json.dumps(result, ensure_ascii=False))
`;
    const result = spawnSync('python3', ['-c', script], { encoding: 'utf-8', timeout: 10000 });
    if (result.error) return NextResponse.json({ error: '排盘失败' }, { status: 500 });
    return NextResponse.json(JSON.parse(result.stdout.trim()));
  } catch (err: any) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
