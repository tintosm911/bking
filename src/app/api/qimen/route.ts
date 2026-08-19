import { NextRequest, NextResponse } from 'next/server';
import { spawnSync } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour } = body;
    if (!year || !month || !day || hour === undefined) {
      return NextResponse.json({ error: '缺少必填参数' }, { status: 400 });
    }
    const enginePath = path.join(process.cwd(), 'src/lib/qimen_engine.py');
    const dir = path.dirname(enginePath).replace(/'/g, "'\\''");
    const script = `
import sys
sys.path.insert(0, '${dir}')
from qimen_engine import build_qimen, format_qimen
import json
qm = build_qimen(${year}, ${month}, ${day}, ${hour})
formatted = format_qimen(qm)
result = {**qm, "formatted": formatted}
print(json.dumps(result, ensure_ascii=False))
`;
    const result = spawnSync('python3', ['-c', script], { encoding: 'utf-8', timeout: 10000 });
    if (result.error) return NextResponse.json({ error: '起局失败' }, { status: 500 });
    return NextResponse.json(JSON.parse(result.stdout.trim()));
  } catch (err: any) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
