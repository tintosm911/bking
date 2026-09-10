import { NextRequest, NextResponse } from "next/server";
import { meihuaDivination } from "@/lib/meihua_engine";

// 天干对应数（甲1乙2丙3丁4戊5己6庚7辛8壬9癸10）与地支对应数（子1丑2…亥12）
const GAN_NUM: Record<string, number> = {
  甲: 1, 乙: 2, 丙: 3, 丁: 4, 戊: 5, 己: 6, 庚: 7, 辛: 8, 壬: 9, 癸: 10,
};
const ZHI_NUM: Record<string, number> = {
  子: 1, 丑: 2, 寅: 3, 卯: 4, 辰: 5, 巳: 6, 午: 7, 未: 8, 申: 9, 酉: 10, 戌: 11, 亥: 12,
};
const ZHI_HOUR: Record<string, number[]> = {
  子: [23, 0], 丑: [1, 2], 寅: [3, 4], 卯: [5, 6], 辰: [7, 8], 巳: [9, 10],
  午: [11, 12], 未: [13, 14], 申: [15, 16], 酉: [17, 18], 戌: [19, 20], 亥: [21, 22],
};

const GANZHI_OF: Record<number, [string, string]> = {};
// 2000-01-01 = 戊午 (idx 54)

function timeNums(year: number, month: number, day: number, hour: number) {
  // 年地支数
  const yearZhi = ((year - 4) % 12 + 12) % 12; // 0子..11亥
  const nian = yearZhi + 1; // 1-12
  const yue = ((month + 1) % 12) + 1; // 月地支数 1-12
  const ri = ((year - 4) % 12 + 12) % 12 + 1; // 简化：日地支数（占时取日支数）
  let shi: number = 1;
  for (const [k, v] of Object.entries(ZHI_HOUR)) {
    if (hour >= v[0] || (k === "子" && hour < 1)) {
      shi = ZHI_NUM[k];
      break;
    }
  }
  return { nian, yue, ri, shi };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let upperNum: number, lowerNum: number, moveNum: number;
    let method: string;

    if (body?.method === "time" || body?.number1 == null) {
      // 时间起卦：年月日时总和
      const y = Number(body?.year ?? new Date().getFullYear());
      const m = Number(body?.month ?? new Date().getMonth() + 1);
      const d = Number(body?.day ?? new Date().getDate());
      const h = Number(body?.hour ?? new Date().getHours());
      const t = timeNums(y, m, d, h);
      const total = t.nian + t.yue + t.ri;
      upperNum = total;
      lowerNum = total + t.shi;
      moveNum = lowerNum;
      method = `时间起卦（${y}年${m}月${d}日 ${h}时）`;
    } else if (body?.number2 != null) {
      // 数字起卦：报三数
      upperNum = Number(body.number1);
      lowerNum = Number(body.number2);
      moveNum = Number(body.number3 ?? body.number2);
      method = `数理起卦`;
    } else if (body?.number1 != null) {
      upperNum = Number(body.number1);
      lowerNum = 8;
      moveNum = 6;
      method = `单数起卦`;
    } else {
      return NextResponse.json({ error: "参数有误" }, { status: 400 });
    }

    const result = meihuaDivination(upperNum, lowerNum, moveNum);
    return NextResponse.json({ success: true, method, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}
