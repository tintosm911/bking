/**
 * 择日（择吉）引擎
 *
 * 基础：复用 huangli_engine 的每日黄历（建除十二神 + 宜忌 + 冲煞）。
 * 事务择吉：为某事务（嫁娶/开业/搬迁/动土等）在日期区间内筛选吉日，
 *           判定依据 = 建除吉凶 + 该事务核心宜项命中 + 不触犯该事务忌项 + 避开指定生肖冲煞（可选）。
 *
 * 说明：传统择日神煞繁复，此为实用简版（建除+宜忌+冲煞三要素），适合快速选日。
 */

import { huangliOf, HuangliResult } from "./huangli_engine";

/** 事务定义 */
export interface ShiWu {
  key: string;        // 标识
  name: string;       // 名称
  icon: string;
  zhun: string[];     // 宜做的事（命中的建除宜项）
  jin: string[];      // 忌做的事（触犯则不宜）
  desc: string;       // 说明
}

/** 内置事务清单 */
export const SHIWU_LIST: ShiWu[] = [
  { key: "jiaqu", name: "嫁娶", icon: "💍", zhun: ["嫁娶", "纳采", "订婚"], jin: ["破", "执"], desc: "婚嫁、订婚、纳采等喜庆之事" },
  { key: "kaiye", name: "开业", icon: "🏪", zhun: ["开市", "交易", "纳财"], jin: ["闭", "破"], desc: "开店、开张、开业大吉" },
  { key: "banjia", name: "搬迁", icon: "🚚", zhun: ["移徙", "入宅", "安床"], jin: ["破", "执", "危"], desc: "搬家、入宅、安家" },
  { key: "chuxing", name: "出行", icon: "✈️", zhun: ["出行", "旅游", "赴任"], jin: ["收", "破"], desc: "远行、出游、出差" },
  { key: "dongtu", name: "动土", icon: "🏗", zhun: ["动土", "破土", "开工"], jin: ["建", "闭"], desc: "动土、开工、奠基、修造" },
  { key: "anzang", name: "安葬", icon: "🕯", zhun: ["安葬", "入殓", "移柩"], jin: ["开", "满"], desc: "安葬、祭祀、迁坟" },
  { key: "qifu", name: "祈福", icon: "🙏", zhun: ["祈福", "祭祀", "求嗣"], jin: ["破"], desc: "祈福、祭祀、还愿、许愿" },
  { key: "jiaoyi", name: "交易", icon: "🤝", zhun: ["交易", "开市", "纳财", "立券"], jin: ["闭", "破"], desc: "签合同、贸易、立券、求财" },
  { key: "ruxue", name: "入学", icon: "🎓", zhun: ["入学", "出行", "会友"], jin: ["破", "执"], desc: "开学、入学、开蒙" },
  { key: "zhaocai", name: "求财", icon: "💰", zhun: ["求财", "开市", "纳财", "交易"], jin: ["闭", "破"], desc: "求财、开市、祈福财源" },
  { key: "xiuyi", name: "修衣", icon: "✂️", zhun: ["裁衣", "修造", "安床"], jin: ["破"], desc: "裁衣、缝补、装修" },
  { key: "jinong", name: "农事", icon: "🌾", zhun: ["栽种", "开渠", "牧养"], jin: ["收"], desc: "栽种、收割、养殖农事" },
];

/** 择日结果条目 */
export interface ZeRiDay {
  date: { year: number; month: number; day: number; weekday: string };
  lunar: { month: number; dayName: string; leap: boolean; zodiac: string };
  ganzhi: { day: string; month: string; year: string };
  jianchu: { name: string; goodBad: string };
  clash: string;          // 冲（如：冲鼠）
  score: number;          // 吉日评分（越高越吉）
  hitYi: string[];        // 命中宜项
  matched: boolean;       // 是否核心宜项命中
  notes: string[];        // 说明/为何吉
}

/** 评分：建除吉凶 + 宜项命中 + 忌项避免 */
function scoreDay(h: HuangliResult, sw: ShiWu): { score: number; hitYi: string[]; matched: boolean; bad: boolean; notes: string[] } {
  const notes: string[] = [];
  let score = 0;
  const jc = h.jianchu;

  // 建除吉凶
  if (jc.goodBad === "吉") { score += 30; notes.push(`建除「${jc.name}」值吉`); }
  else if (jc.goodBad === "平") { score += 15; notes.push(`建除「${jc.name}」日平`); }
  else { score += 0; notes.push(`建除「${jc.name}」值凶`); }

  // 命中宜项
  const hitYi = h.jianchu.yi.filter((t) => sw.zhun.includes(t));
  if (hitYi.length > 0) { score += 20 * hitYi.length + 20; notes.push(`宜项命中：${hitYi.join("、")}`); }
  const matched = hitYi.length > 0;

  // 触犯忌项
  const bad = h.jianchu.ji.some((t) => sw.jin.includes(t)) || sw.jin.includes(h.jianchu.name);
  if (bad) { score -= 40; notes.push(`忌项触犯：${h.jianchu.ji.filter((t) => sw.jin.includes(t)).join("、") || h.jianchu.name}`); }

  // 冲煞
  if (h.wuxing.clashSX) { score -= 5; notes.push(`冲${h.wuxing.clashSX.replace("冲", "")}`); }

  return { score, hitYi, matched, bad, notes };
}

export interface ZeRiResult {
  shiwu: ShiWu;
  range: { from: string; to: string; days: number };
  days: (ZeRiDay)[];   // 区间内全部日期（含评分）
  best: ZeRiDay[];     // 最优吉日（score>=50 且 非bad 且 matched，取前N）
  summary: string;
}

/** 择日主入口：某事务在日期区间内选吉日 */
export function zeyiDivination(
  shiwuKey: string,
  fromY: number, fromM: number, fromD: number,
  toY: number, toM: number, toD: number
): ZeRiResult {
  const sw = SHIWU_LIST.find((s) => s.key === shiwuKey) || SHIWU_LIST[0];
  const from = new Date(fromY, fromM - 1, fromD);
  const to = new Date(toY, toM - 1, toD);
  const totalDays = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
  const days: ZeRiDay[] = [];

  for (let i = 0; i < totalDays; i++) {
    const dt = new Date(from.getTime() + i * 86400000);
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    const d = dt.getDate();
    const h = huangliOf(y, m, d);
    const s = scoreDay(h, sw);
    days.push({
      date: h.solar,
      lunar: { month: h.lunar.month, dayName: h.lunar.dayName, leap: h.lunar.leap, zodiac: h.lunar.zodiac },
      ganzhi: { day: h.ganzhi.day, month: h.ganzhi.month, year: h.ganzhi.year },
      jianchu: { name: h.jianchu.name, goodBad: h.jianchu.goodBad },
      clash: h.wuxing.clashSX,
      score: s.score,
      hitYi: s.hitYi,
      matched: s.matched,
      notes: s.notes.slice(0, 3),
    });
  }

  // 最优吉日：匹配核心宜项、未触犯忌项、评分达标
  const best = days
    .filter((d) => d.matched && d.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const summary =
    best.length > 0
      ? `「${sw.name}」宜${sw.zhun[0]}，区间 ${totalDays} 天中共 ${best.length} 天为吉日，优选${best[0].date.month}月${best[0].date.day}日（${best[0].ganzhi.day}，建除${best[0].jianchu.name}）`
      : `「${sw.name}」在此区间未寻到特别吉日，建议放宽区间范围。`;

  return { shiwu: sw, range: { from: `${fromY}-${fromM}-${fromD}`, to: `${toY}-${toM}-${toD}`, days: totalDays }, days, best, summary };
}
