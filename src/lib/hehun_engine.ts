/**
 * 八字合婚引擎
 *
 * 原理：对比男女双方八字，从多个维度评估婚配契合度。
 * 维度：①日柱干支相合（天干五合/地支六合）②日主五行互补 ③年柱（属相）冲害 ④用神互补 ⑤性格与婚运。
 *
 * 说明：合婚为传统文化习俗参考，非定论；结果供娱乐与参考。
 * 复用 bazi_engine 的 buildBazi 做双方排盘，在此之上做合婚分析。
 */

import { buildBazi, BaZiResult } from "./bazi_engine";

// —— 天干五合：甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火 ——
const TG_WUHE: Record<string, string> = {
  "甲": "己", "己": "甲",
  "乙": "庚", "庚": "乙",
  "丙": "辛", "辛": "丙",
  "丁": "壬", "壬": "丁",
  "戊": "癸", "癸": "戊",
};
const TG_WUHE_WX: Record<string, string> = {
  "甲": "土", "己": "土", "乙": "金", "庚": "金", "丙": "水",
  "辛": "水", "丁": "木", "壬": "木", "戊": "火", "癸": "火",
};

// —— 地支六合：子丑合土、寅亥合木、卯戌合火、辰酉合金、巳申合水、午未合土 ——
const DZ_LIUHE: Record<string, string> = {
  "子": "丑", "丑": "子",
  "寅": "亥", "亥": "寅",
  "卯": "戌", "戌": "卯",
  "辰": "酉", "酉": "辰",
  "巳": "申", "申": "巳",
  "午": "未", "未": "午",
};

// —— 地支六冲 ——
const DZ_CHONG: Record<string, string> = {
  "子": "午", "午": "子", "丑": "未", "未": "丑",
  "寅": "申", "申": "寅", "卯": "酉", "酉": "卯",
  "辰": "戌", "戌": "辰", "巳": "亥", "亥": "巳",
};

// —— 地支六害 ——
const DZ_HAI: Record<string, string> = {
  "子": "未", "未": "子", "丑": "午", "午": "丑",
  "寅": "巳", "巳": "寅", "卯": "辰", "辰": "卯",
  "申": "亥", "亥": "申", "酉": "戌", "戌": "酉",
};

const WX_SHENG: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
const WX_KE: Record<string, string> = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" };

const SX = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

export interface PartnerInput {
  year: number; month: number; day: number; hour: number; gender: number;
}

export interface HeHunItem {
  dim: string;        // 维度名
  score: number;      // 该维度得分（0-100）
  good: "吉" | "中" | "忌";
  text: string;
}

export interface HeHunResult {
  man: BaZiResult;
  woman: BaZiResult;
  manName: string;
  womanName: string;
  items: HeHunItem[];
  totalScore: number;          // 总分（0-100）
  grade: string;               // 等级：上等婚/中等婚/下等婚
  gradeIcon: string;
  summary: string;
  chiHe: string[];             // 相合之处
  chongHai: string[];          // 相冲相害之处
}

/** 取四柱中年/月/日/时的干支各字 */
function splitBazi(b: BaZiResult) {
  const cols = b["四柱"];
  const year = cols["年柱"], month = cols["月柱"], day = cols["日柱"], hour = cols["时柱"];
  return {
    yearTg: year[0], yearDz: year[1],
    monthTg: month[0], monthDz: month[1],
    dayTg: day[0], dayDz: day[1],
    hourTg: hour[0], hourDz: hour[1],
  };
}

/** 年柱地支 → 生肖 */
function zodiacOf(dz: string): string {
  const idx = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"].indexOf(dz);
  return SX[idx];
}

export function hehunDivination(
  manInput: PartnerInput,
  womanInput: PartnerInput
): HeHunResult {
  const man = buildBazi(manInput.year, manInput.month, manInput.day, manInput.hour, manInput.gender);
  const woman = buildBazi(womanInput.year, womanInput.month, womanInput.day, womanInput.hour, womanInput.gender);

  const m = splitBazi(man);
  const w = splitBazi(woman);
  const manSx = zodiacOf(m.yearDz);
  const womanSx = zodiacOf(w.yearDz);

  const items: HeHunItem[] = [];
  const chiHe: string[] = [];
  const chongHai: string[] = [];

  // ① 日柱干支相合（天干五合 / 地支六合）
  let dayMatch = 30; // 无合亦有基础分：缘分靠相处经营，不至于归零
  if (TG_WUHE[m.dayTg] === w.dayTg) {
    dayMatch += 40;
    chiHe.push(`日干「${m.dayTg}${w.dayTg}」天干五合（合${TG_WUHE_WX[m.dayTg]}）`);
  }
  if (DZ_LIUHE[m.dayDz] === w.dayDz) {
    dayMatch += 30;
    chiHe.push(`日支「${m.dayDz}${w.dayDz}」地支六合`);
  }
  if (m.dayTg === w.dayTg) {
    dayMatch += 10;
    chiHe.push(`日干同为「${m.dayTg}」，同频有共鸣`);
  }
  if (m.dayDz === w.dayDz) {
    dayMatch += 10;
    chiHe.push(`日支同为「${m.dayDz}」，志趣相投`);
  }
  // 日支六合仅+30（日干五合+40，地支权重略低）
  items.push({
    dim: "日柱契合",
    score: Math.min(dayMatch, 100),
    good: dayMatch >= 60 ? "吉" : dayMatch >= 45 ? "中" : "忌",
    text: dayMatch >= 60
      ? `日柱干支生合紧密，情投意合、缘分深厚，是极佳的「天作之合」。`
      : dayMatch >= 45
        ? `日柱有相合之处，彼此吸引、契合度不错。`
        : dayMatch >= 30
          ? `日柱无显著相合，缘分中等，靠相处经营可日久生情。`
          : `日柱冲克，缘分浅淡，需更多磨合与包容。`,
  });

  // ② 日主五行互补
  const mWx = man["日主五行"];
  const wWx = woman["日主五行"];
  const mNeed = man["用神"];        // 男需
  const wNeed = woman["用神"];      // 女需
  const mStrong = man["五行旺衰"][wWx] ?? 0;  // 男八字中女日主五行之旺衰
  const wStrong = woman["五行旺衰"][mWx] ?? 0;
  const manIsStrongInWomanWx = mStrong >= 2;
  const womanIsStrongInManWx = wStrong >= 2;

  let compScore = 0;
  if (mWx === wWx) {
    compScore = 60;
    chiHe.push(`双方日主同为「${mWx}」，性情相类、心有灵犀`);
  } else if (WX_SHENG[mWx] === wWx) {
    compScore = 70;
    chiHe.push(`男日主「${mWx}」生女「${wWx}」，男愿呵护女方`);
  } else if (WX_SHENG[wWx] === mWx) {
    compScore = 70;
    chiHe.push(`女日主「${wWx}」生男「${mWx}」，女旺夫旺家`);
  } else if (WX_KE[mWx] === wWx) {
    compScore = 40;
    chongHai.push(`男日主「${mWx}」克女「${wWx}」，需男方多包容`);
  } else {
    compScore = 40;
    chongHai.push(`女日主「${wWx}」克男「${mWx}」，需女方多体谅`);
  }
  // 用神互补加成
  if (manIsStrongInWomanWx) { compScore += 15; chiHe.push(`男八字中「${wWx}」气足，能补女方所喜`); }
  if (womanIsStrongInManWx) { compScore += 15; chiHe.push(`女八字中「${mWx}」气足，能助男方运势`); }
  compScore = Math.min(compScore, 100);
  items.push({
    dim: "五行互补",
    score: compScore,
    good: compScore >= 70 ? "吉" : compScore >= 50 ? "中" : "忌",
    text: compScore >= 70
      ? `双方五行相生互补、用神互济，是「吉配」，能互相帮扶、旺彼此。`
      : compScore >= 50
        ? `五行还算相配，有生有合，配合得当会渐入佳境。`
        : `五行有相克之处，需互相包容克制，磨合中求平衡。`,
  });

  // ③ 年柱（属相）冲害
  let sxScore = 80;
  const sxTexts: string[] = [];
  if (DZ_CHONG[m.yearDz] === w.yearDz) {
    sxScore = 35;
    sxTexts.push(`年支「${m.yearDz}${w.yearDz}」六冲，${manSx}${womanSx}属相相冲`);
    chongHai.push(`${manSx}${womanSx}生肖相冲`);
  } else if (DZ_HAI[m.yearDz] === w.yearDz) {
    sxScore = 40;
    sxTexts.push(`年支「${m.yearDz}${w.yearDz}」六害，${manSx}${womanSx}属相相害`);
    chongHai.push(`${manSx}${womanSx}生肖相害`);
  } else if (DZ_LIUHE[m.yearDz] === w.yearDz) {
    sxScore = 90;
    sxTexts.push(`年支「${m.yearDz}${w.yearDz}」六合，${manSx}${womanSx}属相相合`);
    chiHe.push(`${manSx}${womanSx}生肖六合`);
  } else {
    sxTexts.push(`${manSx}${womanSx}属相无冲无害，平顺`);
  }
  items.push({
    dim: "属相婚配",
    score: sxScore,
    good: sxScore >= 70 ? "吉" : sxScore >= 50 ? "中" : "忌",
    text: sxTexts[0],
  });

  // ④ 用神互补（单独维度：一方身强帮另一方）
  const mStrongWx = man["日主力量"];
  const wStrongWx = woman["日主力量"];
  let yongScore = 60;
  let yongText: string;
  if (mStrongWx === wStrongWx) {
    yongScore = 65;
    yongText = `双方同为「${mStrongWx}」日主，皆${mStrongWx === "偏强" ? "喜克制耗泄" : "喜生扶"}，步调一致，互相理解。`;
  } else if (mStrongWx === "偏强" && wStrongWx === "偏弱") {
    yongScore = 75;
    yongText = `男日主偏强、女偏弱，男强女弱、刚柔相济，男可作女方靠山。`;
    chiHe.push("男强女弱、刚柔相济");
  } else {
    yongScore = 75;
    yongText = `男日主偏弱、女偏强，女可帮扶男方、旺夫之相，主家运兴隆。`;
    chiHe.push("女旺男、可帮扶");
  }
  items.push({
    dim: "身强互补",
    score: yongScore,
    good: yongScore >= 70 ? "吉" : "中",
    text: yongText,
  });

  // ⑤ 性格契合（由日主五行阴阳推断）
  const mCharacter = wxChars(mWx, man["日主阴阳"]);
  const wCharacter = wxChars(wWx, woman["日主阴阳"]);
  let charScore = 65;
  let charText: string;
  if (mWx === wWx) {
    charScore = 78;
    charText = `男${mCharacter}，女${wCharacter}，五行同气、性格相近，相处自然不累。`;
    chiHe.push("性格同频、相处自然");
  } else if ([["木", "火"], ["火", "土"], ["土", "金"], ["金", "水"], ["水", "木"]]
    .some(([a, b]) => (mWx === a && wWx === b) || (mWx === b && wWx === a))) {
    charScore = 72;
    charText = `男${mCharacter}，女${wCharacter}，一刚一柔能互补，性格相合。`;
    chiHe.push("性格互补、刚柔相济");
  } else {
    charScore = 55;
    charText = `男${mCharacter}，女${wCharacter}，性格各有棱角，需多沟通包容方能长久。`;
    chongHai.push("性格有差异、需磨合");
  }
  items.push({
    dim: "性格契合",
    score: charScore,
    good: charScore >= 70 ? "吉" : charScore >= 55 ? "中" : "忌",
    text: charText,
  });

  // 总分（加权：日柱0.25 五行0.25 属相0.15 身强0.15 性格0.2）
  const totalScore = Math.round(
    dayMatchWeight(items[0].score, 0.25) +
    0.25 * items[1].score +
    0.15 * items[2].score +
    0.15 * items[3].score +
    0.2 * items[4].score
  );

  let grade: string, gradeIcon: string;
  if (totalScore >= 80) { grade = "上等婚"; gradeIcon = "💍"; }
  else if (totalScore >= 65) { grade = "中等偏上婚"; gradeIcon = "💞"; }
  else if (totalScore >= 50) { grade = "中等婚"; gradeIcon = "🤝"; }
  else { grade = "下等婚"; gradeIcon = "⚠️"; }

  const summary =
    totalScore >= 80
      ? "此配对八字相合之处多、相冲之处少，天作之合，情深缘厚，主婚姻美满、家运兴隆，是难得的「上等婚」。"
      : totalScore >= 65
        ? "此配对大体相合，虽有小冲，但瑕不掩瑜，若能互相包容体谅，可成眷属、白首偕老，属「中等偏上婚」。"
        : totalScore >= 50
          ? "此配对吉中有忌、有合有冲，属「中等婚」。婚姻重在经营，多沟通、多体谅，可化解多数不利，日久见真情。"
          : "此配对相冲相克之处偏多，属「下等婚」，需格外用心经营，或暂缓、充分磨合后再论终身。";

  return {
    man, woman,
    manName: "男方", womanName: "女方",
    items, totalScore, grade, gradeIcon, summary,
    chiHe, chongHai,
  };
}

function dayMatchWeight(score: number, w: number): number {
  return w * score;
}

function wxChars(wx: string, yy: string): string {
  const base: Record<string, string> = {
    "金": "刚毅果决、重义气",
    "木": "仁厚上进、有理想",
    "水": "聪慧灵动、善变通",
    "火": "热情开朗、行动力强",
    "土": "稳重踏实、讲信用",
  };
  return base[wx] || "";
}
