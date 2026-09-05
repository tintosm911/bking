/**
 * 八字反推引擎
 *
 * 用途：缘主若只知出生年月日、不知/记不准时辰，此处将十二个时辰各排一版完整八字，
 * 对照不同时辰导致的时柱、五行旺衰、用神、身强弱差异，并给出各时辰的性格倾向，
 * 供缘主反推自己最可能生于哪个时辰（校正命盘）。
 *
 * 复用 bazi_engine 的 buildBazi 做排盘。
 */

import { buildBazi, BaZiResult } from "./bazi_engine";

const SHICHEN_LIST = [
  { key: 0, label: "子时", range: "23:00-01:00" },
  { key: 1, label: "丑时", range: "01:00-03:00" },
  { key: 2, label: "寅时", range: "03:00-05:00" },
  { key: 3, label: "卯时", range: "05:00-07:00" },
  { key: 4, label: "辰时", range: "07:00-09:00" },
  { key: 5, label: "巳时", range: "09:00-11:00" },
  { key: 6, label: "午时", range: "11:00-13:00" },
  { key: 7, label: "未时", range: "13:00-15:00" },
  { key: 8, label: "申时", range: "15:00-17:00" },
  { key: 9, label: "酉时", range: "17:00-19:00" },
  { key: 10, label: "戌时", range: "19:00-21:00" },
  { key: 11, label: "亥时", range: "21:00-23:00" },
];

const SHICHEN_CHAR: Record<number, string> = {
  0: "沉稳内敛", 1: "务实坚韧", 2: "积极进取", 3: "温和灵动",
  4: "踏实进取", 5: "热情开放", 6: "光明磊落", 7: "包容大方",
  8: "机敏练达", 9: "果决刚毅", 10: "忠厚稳健", 11: "聪慧随和",
};

export interface TuifaHour {
  key: number;
  label: string;
  range: string;
  hourPillar: string;
  hourShishen: string;
  yongshen: string;
  xishen: string;
  jishen: string;
  strength: string;
  character: string;
  isStrong: boolean;
  summary: string;
}

export interface TuifaResult {
  year: number; month: number; day: number;
  yearPillar: string; monthPillar: string; dayPillar: string;
  dayMaster: string;
  hours: TuifaHour[];
  tip: string;
}

export function tuifaDivination(year: number, month: number, day: number): TuifaResult {
  // 以午时(12)为默认生成年月日柱参照
  const ref = buildBazi(year, month, day, 12, 1);

  const hours: TuifaHour[] = SHICHEN_LIST.map((sc) => {
    const hour = sc.key * 2; // 子0 丑2 ...
    const r = buildBazi(year, month, day, hour, 1);
    return {
      key: sc.key,
      label: sc.label,
      range: sc.range,
      hourPillar: r["四柱"]["时柱"],
      hourShishen: (r["十神"]["时干"] as [string, string])[1] || "",
      yongshen: r["用神"],
      xishen: r["喜神"],
      jishen: r["忌神"],
      strength: r["日主力量"],
      isStrong: r["是否身强"],
      character: SHICHEN_CHAR[sc.key],
      summary: strengthText(r, sc.label),
    };
  });

  return {
    year, month, day,
    yearPillar: ref["四柱"]["年柱"],
    monthPillar: ref["四柱"]["月柱"],
    dayPillar: ref["四柱"]["日柱"],
    dayMaster: ref["日主"],
    hours,
    tip: "时柱主晚年、子嗣、晚年心境——同一生辰因时辰不同，时柱十神各异，带来的性格、际遇、晚年格局都不同。对照你平日为人与晚年倾向，可反推最可能生于哪个时辰。",
  };
}

const SHISHEN_MEANING: Record<string, string> = {
  "比肩": "独立自主、朋友缘佳，重兄弟手足之情",
  "劫财": "果断敢为、略带几分急进，重义气但也易劳心",
  "食神": "才思敏捷、福气潜藏，重享受、心态豁达",
  "伤官": "聪明外露、锋芒毕现，重才华表现、不喜受制",
  "正财": "务实勤俭、重家庭与正途，理财稳健",
  "偏财": "手腕活络、善抓机遇，重商机与广结人缘",
  "正官": "自律守正、有担当，重名望与秩序",
  "七杀": "魄力十足、敢闯敢拼，重魄力与执行力",
  "正印": "厚道好学、有福荫，重学识与长辈助益",
  "偏印": "机敏多思、想法独特，重领悟力与偏门之才",
};

function strengthText(r: BaZiResult, label: string): string {
  const ys = r["用神"];
  const sd = r["是否身强"] ? "身强" : "身弱";
  const wx = r["日主五行"];
  const char = SHICHEN_CHAR[SHICHEN_LIST.find((s) => s.label === label)!.key];
  // 时柱十神（时干）
  const hourPillar = r["四柱"]["时柱"];
  const hourTg = hourPillar[0];
  const shishen = (r["十神"]["时干"] as [string, string])[1] || "";
  const meaning = SHISHEN_MEANING[shishen] || "";
  return `${label}生（时柱${hourPillar}），主${char}；时干「${hourTg}」为日主之${shishen}，主${meaning}。日主${wx}、${sd}，以「${ys}」为用神——若你平日${sd === "身强" ? "果断刚强、能立局面" : "随和包容、善借外力"}，且${meaning}与你相合，则此时辰最相符。`;
}
