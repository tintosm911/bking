/**
 * 黄历引擎：每日干支、冲煞、宜忌、建除
 * 基于中华传统黄历简算法（不含完整择日神煞，为实用版）。
 * 数据：日干支按儒略日标准公式；月支按节气近似；宜忌按建除十二神+五行。
 */

import { solarToLunar } from "./lunar";

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const SX = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

/** 地支六冲：子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲 */
const CHONG: Record<string, string> = {
  子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅",
  卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳",
};

/** 地支三合六合五行（简表） */
const ZHI_ELEMENT: Record<string, string> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

const GAN_ELEMENT: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

/** 建除十二神（按当月节气的日序推算，简化：以月朔为基准近似） */
const JIANCHU = ["建", "除", "满", "平", "定", "执", "破", "危", "成", "收", "开", "闭"];

/** 儒略日数（公历转儒略日） */
function jd(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) -
    Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

/** 日干支：以已知锚点 2000-01-01 为戊午日（儒略日2451545）顺推 */
function dayGanZhi(y: number, m: number, d: number): { ganzhi: string; gan: string; zhi: string } {
  const j = jd(y, m, d);
  const gzIndex = ((j - 2451545) % 60 + 60) % 60; // 2000-01-01 = 戊午 → index 对应 54(戊)11(午)
  // 校准：2000-01-01 实际为 戊午日。戊=index4, 午=index6。
  // 用 (j+49)%60 通用公式：天干=index%10，地支=index%12
  const idx = (j + 49) % 60;
  const gan = GAN[idx % 10];
  const zhi = ZHI[idx % 12];
  // 验证锚点：2000-01-01，(2451545+49)%60 = 2451594%60，2451594/60=40859余54 → 54%10=4戊,54%12=6午 ✓
  return { ganzhi: gan + zhi, gan, zhi };
}

/** 年干支（用农历年） */
function yearGanZhi(y: number, m: number, d: number): string {
  const lunar = solarToLunar(y, m, d);
  const g = lunar.ganzhi; // 来自 lunar.ts 的年干支
  return g;
}

/** 月支：按节气近似（公历月中点粗分；简化用农历月） */
function monthZhi(y: number, m: number, d: number): string {
  const lunar = solarToLunar(y, m, d);
  // 农历月对应的月支（正月建寅）
  const order = ((lunar.month - 1) % 12 + 12) % 12;
  const zhiIdx = (2 + order) % 12; // 正月=寅(index2)
  return ZHI[zhiIdx];
}

/** 月干：五虎遁，按年干定正月干 */
function monthGan(y: number, m: number, d: number): string {
  const yg = yearGanZhi(y, m, d)[0];
  const startIdx = (GAN.indexOf(yg) % 5) * 2; // 甲己→丙(2)、乙庚→戊(4)、丙辛→庚(6)、丁壬→壬(8)、戊癸→甲(0)
  const lunar = solarToLunar(y, m, d);
  const order = (lunar.month - 1 + 12) % 12;
  return GAN[(startIdx + order) % 10];
}

/** 建除十二神：以月支首日=建推算（用每月农历初一日的日支推，简化近似） */
function jianchuGod(y: number, m: number, d: number, dayZhi: string): { name: string; goodBad: string; yi: string[]; ji: string[]; god: string } {
  const mz = monthZhi(y, m, d);
  const dayIdx = ZHI.indexOf(dayZhi);
  const monthIdx = ZHI.indexOf(mz);
  // 建除：月支为该月「建」，然后顺数
  const offset = ((dayIdx - monthIdx) % 12 + 12) % 12;
  const god = JIANCHU[offset];

  const yiMap: Record<string, string[]> = {
    建: ["出行", "上任", "会友", "上书"],
    除: ["沐浴", "扫舍", "除服", "医疗"],
    满: ["祭祀", "祈福", "开市", "交易"],
    平: ["修整", "平治", "涂泥"],
    定: ["祭祀", "祈福", "嫁娶", "交易"],
    执: ["捕捉", "诉讼", "破土"],
    破: ["破土", "拆卸"],
    危: ["祭祀", "祈福", "安床", "拆卸"],
    成: ["嫁娶", "开市", "交易", "入学"],
    收: ["收纳", "买田", "进财"],
    开: ["开市", "交易", "出行", "求财"],
    闭: ["安葬", "祭祀", "筑堤"],
  };
  const jiMap: Record<string, string[]> = {
    建: ["动土", "开仓", "嫁娶", "开市"],
    除: ["嫁娶", "迁徙", "出行", "开市"],
    满: ["安葬", "动土"],
    平: ["开市", "高枕", "修厨"],
    定: ["出行", "迁徙"],
    执: ["开市", "嫁娶", "迁徙", "安床"],
    破: ["嫁娶", "开市", "出行", "安葬"],
    危: ["登山", "出行", "开市"],
    成: ["打官司", "动土"],
    收: ["开仓", "安葬", "出行"],
    开: ["安葬", "动土"],
    闭: ["开市", "交易", "出行"],
  };

  const goodBad = ["建", "满", "定", "成", "开", "除"].includes(god) ? "吉" : god === "平" ? "平" : "凶";
  return { name: god, goodBad, yi: yiMap[god] || [], ji: jiMap[god] || [], god };
}

/** 日干支五行 */
function dayElement(gangan: string, zhi: string): { value: string; clash: string } {
  return { value: GAN_ELEMENT[gangan], clash: CHONG[zhi] };
}

/** 农历日名（初一/初二...） */
function lunarDayName(d: number): string {
  const tens = ["初", "十", "廿", "卅"];
  const ones = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (d === 10) return "初十";
  if (d === 20) return "二十";
  if (d === 30) return "三十";
  const t = Math.floor(d / 10);
  const o = d % 10;
  if (o === 0) return tens[t] + "十";
  return tens[t] + ones[o - 1];
}

export interface HuangliResult {
  solar: { year: number; month: number; day: number; weekday: string };
  lunar: { year: number; month: number; day: number; dayName: string; leap: boolean; zodiac: string };
  ganzhi: { year: string; month: string; day: string; hour: string };
  wuxing: { day: string; clashZhi: string; clashSX: string };
  jianchu: { name: string; goodBad: string; yi: string[]; ji: string[] };
  pengzu: string;
  jiShen: string[];
  xiongShen: string[];
}

const WEEK = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

/** 彭祖百忌（简表，按日干） */
function pengzu(gan: string): string {
  const map: Record<string, string> = {
    甲: "甲不开仓财物耗散", 乙: "乙不栽植千株不长", 丙: "丙不修灶必见灾殃",
    丁: "丁不剃头头必生疮", 戊: "戊不受田田主不祥", 己: "己不破券二比并亡",
    庚: "庚不经络织机虚张", 辛: "辛不合酱主人不尝", 壬: "壬不泱水更难提防", 癸: "癸不词讼理弱敌强",
  };
  return map[gan] || "";
}

/** 吉神/凶神（简化，按建除+日干） */
function shenSha(god: string, goodBad: string): { ji: string[]; xiong: string[] } {
  const ji = goodBad === "吉" ? ["天德", "月德", "天恩", "母仓"] : goodBad === "平" ? ["月恩"] : ["月虚", "天贼"];
  const xiong = goodBad === "凶" ? ["月煞", "月刑", "六害"] : goodBad === "平" ? ["五虚"] : [];
  return { ji, xiong };
}

/** 主入口：某公历日期的黄历 */
export function huangliOf(y: number, m: number, d: number): HuangliResult {
  const lunar = solarToLunar(y, m, d);
  const dg = dayGanZhi(y, m, d);
  const yg = yearGanZhi(y, m, d);
  const mg = monthGan(y, m, d);
  const mz = monthZhi(y, m, d);
  const jc = jianchuGod(y, m, d, dg.zhi);
  const element = dayElement(dg.gan, dg.zhi);
  const clashSX = SX[ZHI.indexOf(element.clash)];
  const ss = shenSha(jc.name, jc.goodBad);

  const dt = new Date(y, m - 1, d);
  return {
    solar: { year: y, month: m, day: d, weekday: WEEK[dt.getDay()] },
    lunar: {
      year: lunar.year, month: lunar.month, day: lunar.day,
      dayName: lunarDayName(lunar.day), leap: lunar.leap, zodiac: lunar.zodiac,
    },
    ganzhi: {
      year: yg, month: mg + mz, day: dg.ganzhi,
      hour: "今日吉时见下方宜忌", // 时辰干支复杂，此处省略展示
    },
    wuxing: { day: element.value, clashZhi: element.clash, clashSX: `冲${clashSX}` },
    jianchu: jc,
    pengzu: pengzu(dg.gan),
    jiShen: ss.ji,
    xiongShen: ss.xiong,
  };
}

/** 万年历：连续 N 天 */
export function wanliCalendar(y: number, m: number, d: number, days: number): HuangliResult[] {
  const out: HuangliResult[] = [];
  const base = new Date(y, m - 1, d);
  for (let i = 0; i < days; i++) {
    const dt = new Date(base.getTime() + i * 86400000);
    out.push(huangliOf(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()));
  }
  return out;
}
