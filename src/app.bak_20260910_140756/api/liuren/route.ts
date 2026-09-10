import { NextRequest, NextResponse } from "next/server";
import { liurenDivination, liurenNow, SHICHEN_NAMES, PALACES } from "@/lib/liuren_engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, a, b, c } = body || {};

    let result: any;
    if (mode === "numbers" && a && b && c) {
      // 随心取数：三个数起课
      result = liurenDivination(Number(a), Number(b), Number(c));
      result.modeLabel = "随心取数";
    } else {
      // 当前时刻起课
      result = liurenNow();
      result.modeLabel = "当前时刻起课";
    }

    const shichenName = SHICHEN_NAMES.find((s) => s.key === (result.shichen ?? 0));
    const pal = result.finalPalace;

    return NextResponse.json({
      success: true,
      modeLabel: result.modeLabel,
      input: result.input,
      month: result.month,
      day: result.day,
      shichen: result.shichen,
      shichenName: shichenName?.name,
      shichenRange: shichenName?.range,
      steps: [
        { label: "第一步 · 月数定宫", text: `大安起正月，数至「${result.monthPalace.name}」` },
        { label: "第二步 · 日数定宫", text: `从「${result.monthPalace.name}」起初一，数至「${result.dayPalace.name}」` },
        { label: "第三步 · 时数落宫", text: `从「${result.dayPalace.name}」起吉位，数至「${result.finalPalace.name}」` },
      ],
      final: {
        name: pal.name,
        emoji: pal.emoji,
        position: pal.position,
        element: pal.element,
        body: pal.body,
        general: pal.general,
        goodBad: pal.goodBad,
        color: pal.color,
      },
      allPalaces: PALACES,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}
