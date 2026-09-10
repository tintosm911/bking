/**
 * 达摩一掌经 排盘引擎
 *
 * 概述：以年支、月支、日支、时支四柱起课，按"六道轮回"十二宫推算命盘。
 * 十二宫：佛道/鬼道/人道/仙道/天道/修罗道 + 贪狼/巨门/禄存/文曲/廉贞/武曲
 * 每宫对应一种生克吉凶，叠加年上起月、月上起日、日上起时的轮转数位。
 *
 * 起数规则：
 *   - 年支定"年宫"：按掌心十二宫逆时针顺序，从空亡位起子，数至生年支。
 *   - 月支：从年宫位置起正月（寅月），数至生月支。
 *   - 日支：从月宫位置起初一（子日），数至生日支。
 *   - 时支：从日宫位置起子时，数至生时支 → 得"时宫"即命宫（主断）。
 * 简化：本项目采用"十二宫循环叠加"的实用算法，直接以年/月/日/时四支
 *       对应的宫位做叠加推断，避免纯手算掌诀的复杂轮转，结果清晰可用。
 */

export interface ZhangJingPalace {
  index: number; // 0-11
  name: string;
  category: "佛道" | "鬼道" | "人道" | "仙道" | "天道" | "修罗道" | "星曜";
  star?: string; // 贪狼/巨门/禄存/文曲/廉贞/武曲
  emoji: string;
  goodBad: "吉" | "凶" | "平" | "吉中带凶";
  nature: string; // 本性
  desc: string; // 详解
}

export const ZHANG_JING_PALACES: ZhangJingPalace[] = [
  { index: 0, name: "空亡", category: "鬼道", emoji: "👻", goodBad: "凶", nature: "孤单寡淡", desc: "如入空门，六亲缘薄，心思常游移不定。宜修身养性、离尘向佛，反得安乐。" },
  { index: 1, name: "佛道", category: "佛道", emoji: "🪷", goodBad: "吉", nature: "慈悲慧根", desc: "心地慈悲，与佛道有缘，乐善好施，慧根深厚。晚年安宁，得贵人扶助。" },
  { index: 2, name: "鬼道", category: "鬼道", emoji: "🌫️", goodBad: "凶", nature: "情重心细", desc: "思虑较重，想法多而行动缓，易生疑虑烦恼。宜多亲近光明积极之人事。" },
  { index: 3, name: "人道", category: "人道", emoji: "🧑", goodBad: "平", nature: "中正平和", desc: "性情中正，为人实在，一生平稳少大波折。勤勉踏实，福报自积。" },
  { index: 4, name: "仙道", category: "仙道", emoji: "🧚", goodBad: "吉", nature: "飘然超脱", desc: "气质出尘，潇洒不羁，不喜被俗务束缚。才思敏捷，有艺术灵性。" },
  { index: 5, name: "天道", category: "天道", emoji: "🕊️", goodBad: "吉", nature: "豁达大度", desc: "心胸开阔，气量宏大，天生有度人之心。福厚运佳，得人景仰。" },
  { index: 6, name: "修罗道", category: "修罗道", emoji: "⚔️", goodBad: "凶", nature: "刚强好胜", desc: "性子刚烈，好胜心强，遇事易冲动。若能修忍辱心，可化刚为成。" },
  { index: 7, name: "贪狼", category: "星曜", star: "贪狼", emoji: "🐺", goodBad: "吉中带凶", nature: "多重欲望", desc: "交际广、才华多，桃花与欲望并重。能成事亦易失足，须守心防闲。" },
  { index: 8, name: "巨门", category: "星曜", star: "巨门", emoji: "🚪", goodBad: "凶", nature: "口舌是非", desc: "口才佳但易招是非，言多易伤人。宜谨言慎行，以口为德而非利刃。" },
  { index: 9, name: "禄存", category: "星曜", star: "禄存", emoji: "💰", goodBad: "吉", nature: "财禄安稳", desc: "财源稳定，一生衣食无忧，勤俭守成。善理财则富足，贪则损福。" },
  { index: 10, name: "文曲", category: "星曜", star: "文曲", emoji: "📖", goodBad: "吉", nature: "才学聪慧", desc: "聪慧好学，文笔口才俱佳，利学问功名。唯多愁善感，心思细腻。" },
  { index: 11, name: "武曲", category: "星曜", star: "武曲", emoji: "🔪", goodBad: "平", nature: "刚毅果决", desc: "坚毅果敢，能吃苦耐劳，利从事武职、技术、金融。守正则可成大事。" },
];

const ZHI_INDEX: Record<string, number> = {
  子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5,
  午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11,
};

/** 由天干推出年支（简化：按生肖年即为年支） */
const ZODIAC_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export interface ZhangJingInput {
  year: number;   // 公历年（取年支）
  month: number;  // 公历月（近似地支月：立春起寅）
  day: number;    // 公历日（直接取日支 - 简化用生肖日轮番）
  hour: number;   // 小时 0-23（定时辰地支）
}

export interface ZhangJingResult {
  palaces: {
    label: "年" | "月" | "日" | "时";
    palace: ZhangJingPalace;
  }[];
  fate: ZhangJingPalace;  // 命宫（时宫为主，年宫辅助）
  summary: string;
  goodCount: number;
  badCount: number;
}

function hourToZhi(hour: number): number {
  // 子22-1, 丑1-3, 寅3-5 ... 亥21-23
  if (hour >= 23 || hour < 1) return 0;
  if (hour >= 1 && hour < 3) return 1;
  return Math.floor((hour - 1) / 2) + 1;
}

/**
 * 一掌经起宫：以固定起点(子=空亡)顺时针/逆时针轮转。
 * 本项目采用"地支序号 + 固定宫位映射"的实用叠加法：
 *   年/月/日/时各按地支序号对应一个基础宫位，再叠加偏移。
 */
export function zhangJingDivination(input: ZhangJingInput): ZhangJingResult {
  const yearZhi = ZODIAC_ZHI[(input.year - 4) % 12]; // 公历年减4 mod 12 得地支序号
  const yearZhiIdx = ZHI_INDEX[yearZhi];

  // 月：以寅月(2)为正月起点，农历月份近似 = 公历月 - 1 (简化)
  const monthZhiIdx = ((input.month - 1) + 2) % 12 === 0 ? 2 : (((input.month - 1) % 12) + 2) % 12;
  const dayZhiIdx = (input.day - 1) % 12;
  const hourZhiIdx = hourToZhi(input.hour);

  // 宫位 = (支序 + 基础偏移)%12，偏移使子→空亡(0)
  const palaceOf = (zhiIdx: number) => ZHANG_JING_PALACES[zhiIdx % 12];

  const yearP = palaceOf(yearZhiIdx);
  const monthP = palaceOf(monthZhiIdx);
  const dayP = palaceOf(dayZhiIdx);
  const hourP = palaceOf(hourZhiIdx);

  // 命宫主断：时宫为主 + 年宫修正
  let fate: ZhangJingPalace = hourP;
  const good = ZHANG_JING_PALACES.filter((p) => p.goodBad === "吉").map((p) => p.name);

  // 综合断语
  const pieces: string[] = [];
  pieces.push(`年落${yearP.name}（${yearP.nature}）`);
  pieces.push(`月落${monthP.name}（${monthP.nature}）`);
  pieces.push(`日坐${dayP.name}（${dayP.nature}）`);
  pieces.push(`时居${hourP.name}（${hourP.nature}）`);

  const strong = [yearP, monthP, dayP, hourP].filter((p) => p.goodBad === "吉").length;
  const weak = [yearP, monthP, dayP, hourP].filter((p) => p.goodBad === "凶").length;

  let summary: string;
  if (strong >= 3) summary = "四柱多吉，福气盈门，一生多贵人相助，诸事顺遂。宜守正行善，福报更厚。";
  else if (strong === 2 && weak <= 1) summary = "吉凶相济，平稳中见机遇。把握主动、多结善缘，可登福地。";
  else if (weak >= 3) summary = "四柱多劳，磨砺较多。唯勤修心性、广积阴德，可转逆境为坦途。";
  else if (hourP.goodBad === "吉") summary = "时宫主吉，命带贵气，晚年福厚。当下勤勉，终有所成。";
  else summary = "命盘中平，成败在己。志坚而行笃，福自天来；心浮而气躁，事多反复。";

  return {
    palaces: [
      { label: "年", palace: yearP },
      { label: "月", palace: monthP },
      { label: "日", palace: dayP },
      { label: "时", palace: hourP },
    ],
    fate: { ...hourP, name: `${hourP.name} · 命宫` },
    summary,
    goodCount: strong,
    badCount: weak,
  };
}

export const ZHI_LIST = ZODIAC_ZHI;
