/**
 * 十二生肖引擎 —— 三大块整体设计
 *
 * ① 属相基础    出生日期 → 生肖 + 五行 + 性格特质（静态画像，轻量钩子）
 * ② 流年运势    指定年份 → 该属相当岁吉凶/宜忌/贵人/方位（复用八字取强弱势能）
 * ③ 生肖配对    两个属相 → 六合/三合/相合、六冲/六害/相刑（借用 hehun 地支合冲害底盘）
 * ④ 生肖×八字   出生日期 → 排盘 + 本命年 + 属相五行与用神呼应 + 相合属相贵人（深度底盘）
 *
 * 设计原则：生肖是"钩子"，八字是"深度"。轻量入口留住 → 配对转化 → 合盘深度。
 * 复用：buildBazi(八字) + solarToLunar(农历定属相) + hehun 六合/六冲/六害常量。
 * 免责：传统文化视角解读，非科学；供参详娱乐。
 */

import { buildBazi, BaZiResult } from "./bazi_engine";
import { solarToLunar } from "./lunar";
import { DZ_LIUHE, DZ_CHONG, DZ_HAI } from "./hehun_engine";

// ============ 基础常量 ============

const SX = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const DZ_ARR = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 生肖 → 五行（地支本气，简化）& 阴阳
const SX_WX: Record<string, string> = {
  "鼠": "水", "牛": "土", "虎": "木", "兔": "木", "龙": "土", "蛇": "火",
  "马": "火", "羊": "土", "猴": "金", "鸡": "金", "狗": "土", "猪": "水",
};

// 生肖 → 地支
const SX_DZ: Record<string, string> = {
  "鼠": "子", "牛": "丑", "虎": "寅", "兔": "卯", "龙": "辰", "蛇": "巳",
  "马": "午", "羊": "未", "猴": "申", "鸡": "酉", "狗": "戌", "猪": "亥",
};

// 三合（同组相合）：申子辰(猴鼠龙)、寅午戌(虎马狗)、巳酉丑(蛇鸡牛)、亥卯未(猪兔羊)
const SANHE_GROUP: Record<string, string> = {
  "鼠": "水局", "猴": "水局", "龙": "水局",
  "虎": "火局", "马": "火局", "狗": "火局",
  "蛇": "金局", "鸡": "金局", "牛": "金局",
  "猪": "木局", "兔": "木局", "羊": "木局",
};

export function zodiacOfYear(year: number): string {
  return SX[((year - 4) % 12 + 12) % 12];
}

// 由出生日期精确定属相（农历年）
export function zodiacOfBirth(year: number, month: number, day: number): string {
  try {
    const l = solarToLunar(year, month, day);
    if (l && l.zodiac) return l.zodiac;
  } catch { /* 忽略，回退公历年 */ }
  return zodiacOfYear(year);
}

// ============ ① 属相基础 ============

const PROFILE: Record<string, { wuxing: string; personality: string; lucky: string[]; clash: string[] }> = {
  "鼠": { wuxing: "水", personality: "聪明机敏、观察力强、善谋划，反应快且适应力好；但多思多虑，易显精于算计、略乏安全感。", lucky: ["牛", "龙", "猴"], clash: ["马", "羊", "兔"] },
  "牛": { wuxing: "土", personality: "踏实稳重、吃苦耐劳、重信守诺，认准的事能坚持到底；但性子偏执、不善变通，认死理。", lucky: ["鼠", "蛇", "鸡"], clash: ["羊", "马", "狗"] },
  "虎": { wuxing: "木", personality: "果敢自信、有领导力、敢作敢当，气场强能镇场；但易冲动、自尊心强，不服人管。", lucky: ["马", "狗", "猪"], clash: ["猴", "蛇"] },
  "兔": { wuxing: "木", personality: "温和平顺、心思细腻、人缘好，待人接物得体；但优柔寡断、易被环境影响，魄力不足。", lucky: ["狗", "猪", "羊"], clash: ["鸡", "鼠", "龙"] },
  "龙": { wuxing: "土", personality: "自信大气、抱负不凡、精力充沛，天生有为；但傲气外露、好面子，易强人所难。", lucky: ["鼠", "猴", "鸡"], clash: ["狗", "兔", "牛"] },
  "蛇": { wuxing: "火", personality: "冷静深谋、直觉敏锐、善于隐藏实力，谋定后动；但多疑心重、不易交心，易钻牛角尖。", lucky: ["牛", "鸡"], clash: ["猪", "虎"] },
  "马": { wuxing: "火", personality: "热情奔放、行动力强、向往自由，说干就干；但性子急、没耐心，三分钟热度易半途而废。", lucky: ["虎", "狗", "羊"], clash: ["鼠", "牛"] },
  "羊": { wuxing: "土", personality: "温顺善良、富有同情心、审美佳，懂得体恤他人；但依赖心重、遇事易怯懦退缩。", lucky: ["兔", "马", "猪"], clash: ["牛", "狗", "鼠"] },
  "猴": { wuxing: "金", personality: "机智灵动、才华横溢、交际广，点子多行动快；但多变难安、不够专注，易耍小聪明。", lucky: ["鼠", "龙"], clash: ["虎", "猪"] },
  "鸡": { wuxing: "金", personality: "勤劳务实、办事利索、重形象有自尊，敢想敢说；但好胜心强、说话直、易得罪人。", lucky: ["牛", "蛇", "龙"], clash: ["兔", "狗", "鼠"] },
  "狗": { wuxing: "土", personality: "忠诚正直、讲义气重情分，是靠谱的伙伴；但固执保守、防备心重，有时不通情理。", lucky: ["虎", "兔", "马"], clash: ["龙", "鸡", "牛"] },
  "猪": { wuxing: "水", personality: "宽厚平和、心态豁达、乐于享乐，真诚好相处；但易安于现状、行事懒散、略缺紧迫感。", lucky: ["虎", "兔", "羊"], clash: ["蛇", "猴"] },
};

export interface ShengxiaoProfile {
  zodiac: string;
  wuxing: string;
  personality: string;
  lucky: string[];
  clash: string[];
  benmingnian: boolean;
}

export function shengxiaoProfile(year: number, month: number, day: number): ShengxiaoProfile {
  const z = zodiacOfBirth(year, month, day);
  const p = PROFILE[z];
  const byYear = zodiacOfYear(year);
  return {
    zodiac: z,
    wuxing: p.wuxing,
    personality: p.personality,
    lucky: p.lucky,
    clash: p.clash,
    benmingnian: z === byYear, // 属相即当年岁数年份（本命年概念按农历）
  };
}

// ============ ② 流年运势 ============

export interface LiunianItem {
  fortune: string;   // 大字一句
  detail: string;
  lucky: string;     // 吉神/贵人
  avoid: string;     // 忌神/冲煞
  direction: string; // 幸运方位
  good: string;      // 宜
  bad: string;       // 忌
}

const DIRECTION: Record<string, string> = {
  "水": "北方、西北", "火": "南方、东南", "木": "东方、东北", "金": "西方、西南", "土": "中部、本方位",
};

const SHENG_MAP: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
const KE_MAP: Record<string, string> = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" };

// 三合组内的其他属相（用于判"流年属相与太岁三合机"）
const SANHE_MATES: Record<string, string[]> = {
  "鼠": ["猴", "龙"], "猴": ["鼠", "龙"], "龙": ["鼠", "猴"],
  "虎": ["马", "狗"], "马": ["虎", "狗"], "狗": ["虎", "马"],
  "蛇": ["鸡", "牛"], "鸡": ["蛇", "牛"], "牛": ["蛇", "鸡"],
  "猪": ["兔", "羊"], "兔": ["猪", "羊"], "羊": ["猪", "兔"],
};

const relationOf = (z: string, tz: string): string => {
  const zdz = SX_DZ[z], tdz = SX_DZ[tz];
  if (zdz === tdz) return "本命年";
  if (DZ_LIUHE[zdz] === tdz) return "六合";
  if (SANHE_MATES[z]?.includes(tz)) return "三合";
  if (DZ_CHONG[zdz] === tdz) return "相冲";
  if (DZ_HAI[zdz] === tdz) return "相害";
  return "平";
};

export function shengxiaoLiunian(zodiac: string, targetYear: number): LiunianItem {
  const szDz = SX_DZ[zodiac];
  const tDz = DZ_ARR[((targetYear - 4) % 12 + 12) % 12];
  const tzodiac = SX[((targetYear - 4) % 12 + 12) % 12];
  const wx = SX_WX[zodiac];
  const shengWx = SHENG_MAP[wx]; // 本属相所生

  const relation = relationOf(zodiac, tzodiac);
  const benming = szDz === tDz;

  if (benming) {
    return {
      fortune: `${targetYear}年，属${zodiac}值太岁·本命年`,
      detail: `本命年太岁当值，此年易有变数与波折，凡事求稳、忌冒进。宜守不宜攻，行事留三分，稳中求进为上。`,
      lucky: "印星护身、贵人暗中相助",
      avoid: "犯太岁、小人暗中作祟",
      direction: "东北方（太岁方位宜避）",
      good: "求稳、守成、体检、谢太岁",
      bad: "重大投资、远行冒险、与人争执",
    };
  }

  if (relation === "六合") {
    return {
      fortune: `${targetYear}年，属${zodiac}与太岁六合·顺遂之年`,
      detail: `此年与太岁相合，天地助力，诸事顺遂。人缘佳、贵人多、机会现，宜趁势进取，事业财运多有起色。`,
      lucky: "六合贵人、月德照临",
      avoid: "得意忘形、贪多求快",
      direction: `方向宜${DIRECTION[shengWx]}，财气生旺`,
      good: "进取、开拓、合作、签约",
      bad: "固步自封、错失良机",
    };
  }

  if (relation === "三合") {
    return {
      fortune: `${targetYear}年，属${zodiac}与太岁三合·稳健有利`,
      detail: `此年三合局成，助缘深厚，事业伙伴得力，谋事易成。稳中有升，重在借团队之力共进，忌独断专行。`,
      lucky: "三合贵人、天德相助",
      avoid: "单打独斗、刚愎自用",
      direction: `宜乘${DIRECTION[shengWx]}之势`,
      good: "合作、进修、置业、婚嫁",
      bad: "独揽大权、排挤他人",
    };
  }

  if (relation === "相冲") {
    return {
      fortune: `${targetYear}年，属${zodiac}与太岁相冲·动荡之年`,
      detail: `此年与太岁相冲，变动频繁、奔波劳碌，事业人际多生变数。宜低调隐忍、以静制动，守住根本待风波过。`,
      lucky: "贵人疏解、心平气和",
      avoid: "冲太岁、口舌官非",
      direction: "宜避流年冲方，转向", 
      good: "静养、调整、外出走动化解",
      bad: "冲动决策、顶撞上位、投资冒进",
    };
  }

  if (relation === "相害") {
    return {
      fortune: `${targetYear}年，属${zodiac}与太岁相害·小心是非`,
      detail: `此年与太岁相害，暗中小人、口舌是非偏多，防背后使绊。宜谨言慎行、少管闲事，财物往来多留凭证。`,
      lucky: "正印护身、明哲保身",
      avoid: "相害、暗损、被人利用",
      direction: "宜朝旺方稳守",
      good: "低调做事、读书充电、检查合约",
      bad: "轻信他人、卷入是非、借贷担保",
    };
  }

  // 平年
  return {
    fortune: `${targetYear}年，属${zodiac}运势平稳`,
    detail: `此年与太岁关系平和，无大冲大合，运势中正。按部就班、稳扎稳打，机会来了就抓，不贪不惧即可。`,
    lucky: "贵人偶现、机会平顺",
    avoid: "平淡无波、易生懈怠",
    direction: `可守${DIRECTION[wx]}位`,
    good: "务实推进、学习提升、巩固人脉",
    bad: "好高骛远、频繁折腾",
  };
}

// ============ ③ 生肖配对 ============

export interface PairResult {
  zodiacA: string;
  zodiacB: string;
  relation: string;     // 六合/三合/相合/平/相冲/相害/相刑
  score: number;        // 0-100
  grade: string;
  gradeIcon: string;
  detail: string;
  match: string[];      // 相合之处
  mismatch: string[];   // 相冲相害之处
}

const XING: [string, string][] = [["鼠", "兔"], ["牛", "狗"], ["虎", "蛇"], ["龙", "龙"], ["马", "马"], ["鸡", "鸡"], ["猪", "猪"]];

export function shengxiaoPair(a: string, b: string): PairResult {
  const da = SX_DZ[a], db = SX_DZ[b];
  const match: string[] = [];
  const mismatch: string[] = [];
  let relation = "平";
  let score = 70;

  if (DZ_LIUHE[da] === db) {
    relation = "六合"; score = 95;
    match.push(`${a}${b}地支六合，为最高相合，情投意合、互旺互荫，是天配的绝佳对。`);
  } else if (SANHE_GROUP[a] === SANHE_GROUP[b] && a !== b) {
    relation = "三合"; score = 85;
    match.push(`${a}${b}属三合局，同气相求、互为贵人，合作婚配皆旺。`);
  } else if (DZ_CHONG[da] === db) {
    relation = "相冲"; score = 30;
    mismatch.push(`${a}${b}地支六冲，性格观念冲突大，易争执不断，需大量磨合包容。`);
  } else if (DZ_HAI[da] === db) {
    relation = "相害"; score = 40;
    mismatch.push(`${a}${b}地支六害，虽不至反目，但易有暗中损耗、口舌误会。`);
  } else if (XING.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
    relation = "相刑"; score = 45;
    mismatch.push(`${a}${b}犯地支相刑，性情互相制约，相处时多磕碰、易生别扭。`);
  } else {
    relation = "相合"; score = 75;
    match.push(`${a}${b}不冲不害，相处平顺，彼此能各安其位、相辅相成。`);
  }

  // 五行生克微调
  const wxA = SX_WX[a], wxB = SX_WX[b];
  if (wxA === wxB) { score += 3; match.push(`同属${wxA}性，气质相类、习惯相近，默契度高。`); }
  else if ({ "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" }[wxA] === wxB) { score += 7; match.push(`${a}之${wxA}生${b}之${wxB}，${a}愿呵护帮扶${b}。`); }
  else if ({ "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" }[wxB] === wxA) { score += 7; match.push(`${b}之${wxB}生${a}之${wxA}，${b}旺${a}助运。`); }
  else if ({ "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" }[wxA] === wxB) { score -= 5; mismatch.push(`${a}之${wxA}克${b}之${wxB}，${a}需多体谅克制。`); }
  else { score -= 5; mismatch.push(`${b}之${wxB}克${a}之${wxA}，${b}需多包容退让。`); }

  score = Math.max(10, Math.min(98, score));
  let grade, gradeIcon;
  if (score >= 90) { grade = "天作之合"; gradeIcon = "💞"; }
  else if (score >= 80) { grade = "上等婚配"; gradeIcon = "💕"; }
  else if (score >= 70) { grade = "中等合配"; gradeIcon = "🤝"; }
  else if (score >= 55) { grade = "可相磨合"; gradeIcon = "🙂"; }
  else { grade = "多有冲克"; gradeIcon = "⚠️"; }

  const detail = score >= 80
    ? `${a}与${b}生肖契合，互旺互助，是难得的良配。相处顺心、情缘深厚，婚前婚后皆多和睦。`
    : score >= 70
      ? `${a}与${b}总体相配，虽有小摩擦，但瑕不掩瑜。相互体谅、分工互利，可成佳偶。`
      : score >= 55
        ? `${a}与${b}缘分中等，有生有冲。若能各退一步、多沟通包容，依然能走到一起、日久生情。`
        : `${a}与${b}相冲相克较多，性格和观念差异不小。若执意相守，需付出加倍耐心，慎重考虑。`;

  return { zodiacA: a, zodiacB: b, relation, score, grade, gradeIcon, detail, match, mismatch };
}

// ============ ④ 生肖×八字 ============

export interface ShengxiaoBazi {
  zodiac: string;
  benmingYear: string;     // 本命年
  wuxing: string;
  bazi: BaZiResult;
  dayMaster: string;
  strong: boolean;
  yongshen: string;
  jishen: string;
  fit: string[];           // 属相五行 × 用神 呼应结论
  notes: string;
}

export function shengxiaoBazi(year: number, month: number, day: number, hour: number, gender: number = 1): ShengxiaoBazi {
  const bazi = buildBazi(year, month, day, hour, gender);
  const z = zodiacOfBirth(year, month, day);
  const wx = SX_WX[z];
  const yongshen = bazi["用神"] as string;
  const jishen = bazi["忌神"] as string;
  const strong = bazi["是否身强"] as boolean;
  const benming = zodiacOfYear(year);

  const fit: string[] = [];
  fit.push(`命主属${z}，五行属${wx}。`);
  if (wx === yongshen) {
    fit.push(`属相五行「${wx}」正是命局用神，身逢其喜，最利运势、增福气，是本命助运之根。`);
  } else if (wx === jishen) {
    fit.push(`属相五行「${wx}」恰为命局忌神，易生耗损。宜多亲近${yongshen}五行之力、贵人属相以调和。`);
  } else {
    fit.push(`属相五行「${wx}」与用神「${yongshen}」不生不克，中正平和。借${["木", "火", "土", "金", "水"]}中${yongshen}之气可补益。`);
  }
  fit.push(`本命年为${benming}，值太岁之年多需谨慎守成。`);

  const notes = strong
    ? `命主身强，属相为${z}，可任财官。流年逢六合、三合属相贵人时，事业财运多能乘势而上。`
    : `命主身弱，属${z}，宜多亲近生扶之五行与贵人属相，遇冲害流年尤其要稳守。`;

  return {
    zodiac: z,
    benmingYear: `${benming}年`,
    wuxing: wx,
    bazi,
    dayMaster: (bazi["日主"] as string).replace(/ .*$/, ""),
    strong,
    yongshen,
    jishen,
    fit,
    notes,
  };
}

// ============ 格式化 ============

export function formatShengxiaoPair(r: PairResult): string {
  const lines: string[] = [];
  lines.push(`【生肖配对 · ${r.zodiacA} × ${r.zodiacB}】`);
  lines.push(`关系：${r.relation} ｜ 契合度：${r.score}分 ｜ 判定：${r.gradeIcon} ${r.grade}`);
  lines.push(r.detail);
  if (r.match.length) { lines.push("相合之处："); r.match.forEach((m) => lines.push(`  ✓ ${m}`)); }
  if (r.mismatch.length) { lines.push("相冲相害："); r.mismatch.forEach((m) => lines.push(`  ⚠ ${m}`)); }
  lines.push("※ 生肖配对为民俗参考，缘分终靠两人用心经营。");
  return lines.join("\n");
}
