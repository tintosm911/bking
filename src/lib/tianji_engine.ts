/**
 * 天机 · 综合命理引擎 (TypeScript)
 * 
 * 聚合: 八字 + 紫微 + 称骨 + 星座(太阳/月亮/上升) + 三才五格 + 合盘
 * 不再依赖 Python，完全可部署至 Vercel。
 * 
 * 从 fortune_calc.py + name_wuge_calc.py + tianji_bridge.py 转写。
 */

import { buildBazi, BaZiResult } from "./bazi_engine";
import { buildChart, ZweiResult } from "./zwei_engine";
import { solarToLunar } from "./lunar";

// ========= 常量 =========

const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DIZHI   = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const WUXING_GAN: Record<string, string> = {
  "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土",
  "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
};

const WUXING_ZHI: Record<string, string> = {
  "寅": "木", "卯": "木", "巳": "火", "午": "火",
  "辰": "土", "未": "土", "戌": "土", "丑": "土",
  "申": "金", "酉": "金", "亥": "水", "子": "水",
};

const SHENGXIAO: Record<string, string> = {
  "子": "鼠", "丑": "牛", "寅": "虎", "卯": "兔", "辰": "龙", "巳": "蛇",
  "午": "马", "未": "羊", "申": "猴", "酉": "鸡", "戌": "狗", "亥": "猪",
};

const NAYIN: Record<string, string> = {
  "甲子": "海中金", "乙丑": "海中金", "丙寅": "炉中火", "丁卯": "炉中火",
  "戊辰": "大林木", "己巳": "大林木", "庚午": "路旁土", "辛未": "路旁土",
  "壬申": "剑锋金", "癸酉": "剑锋金", "甲戌": "山头火", "乙亥": "山头火",
  "丙子": "涧下水", "丁丑": "涧下水", "戊寅": "城头土", "己卯": "城头土",
  "庚辰": "白蜡金", "辛巳": "白蜡金", "壬午": "杨柳木", "癸未": "杨柳木",
  "甲申": "泉中水", "乙酉": "泉中水", "丙戌": "屋上土", "丁亥": "屋上土",
  "戊子": "霹雳火", "己丑": "霹雳火", "庚寅": "松柏木", "辛卯": "松柏木",
  "壬辰": "长流水", "癸巳": "长流水", "甲午": "沙中金", "乙未": "沙中金",
  "丙申": "山下火", "丁酉": "山下火", "戊戌": "平地木", "己亥": "平地木",
  "庚子": "壁上土", "辛丑": "壁上土", "壬寅": "金箔金", "癸卯": "金箔金",
  "甲辰": "覆灯火", "乙巳": "覆灯火", "丙午": "天河水", "丁未": "天河水",
  "戊申": "大驿土", "己酉": "大驿土", "庚戌": "钗钏金", "辛亥": "钗钏金",
  "壬子": "桑柘木", "癸丑": "桑柘木", "甲寅": "大溪水", "乙卯": "大溪水",
  "丙辰": "沙中土", "丁巳": "沙中土", "戊午": "天上火", "己未": "天上火",
  "庚申": "石榴木", "辛酉": "石榴木", "壬戌": "大海水", "癸亥": "大海水",
};

const CANG_GAN: Record<string, string[]> = {
  "子": ["癸"], "丑": ["己", "癸", "辛"], "寅": ["甲", "丙", "戊"],
  "卯": ["乙"], "辰": ["戊", "乙", "癸"], "巳": ["丙", "庚", "戊"],
  "午": ["丁", "己"], "未": ["己", "丁", "乙"], "申": ["庚", "壬", "戊"],
  "酉": ["辛"], "戌": ["戊", "辛", "丁"], "亥": ["壬", "甲"],
};

const SEASON_MAP: Record<string, string> = {
  "寅": "春", "卯": "春", "辰": "春",
  "巳": "夏", "午": "夏", "未": "夏",
  "申": "秋", "酉": "秋", "戌": "秋",
  "亥": "冬", "子": "冬", "丑": "冬",
};

const SHICHEN_MAP: Record<string, number> = {
  "子": 0, "丑": 1, "寅": 2, "卯": 3, "辰": 4, "巳": 5,
  "午": 6, "未": 7, "申": 8, "酉": 9, "戌": 10, "亥": 11,
};

function getShichen(hour: number): number {
  if (hour >= 23 || hour < 1) return 0;  // 子
  if (hour < 3) return 1;  // 丑
  if (hour < 5) return 2;  // 寅
  if (hour < 7) return 3;  // 卯
  if (hour < 9) return 4;  // 辰
  if (hour < 11) return 5; // 巳
  if (hour < 13) return 6; // 午
  if (hour < 15) return 7; // 未
  if (hour < 17) return 8; // 申
  if (hour < 19) return 9; // 酉
  if (hour < 21) return 10; // 戌
  return 11; // 亥
}

// ========= 类型定义 =========

export interface TianjiMemberInput {
  name: string;
  gender: string;
  solar_date: string;
  birth_time: string;
  birth_city?: string;
  surname_len?: number;
}

export interface TianjiResult {
  meta: { version: string; mode: string };
  members: TianjiPerson[];
  synastry: TianjiSynastry;
}

export interface TianjiPerson {
  name: string;
  gender: string;
  solar_date: string;
  birth_time: string;
  bazi: string[];
  nayins: string[];
  day_gan: string;
  shengxiao: string;
  wx: Record<string, number>;
  missing_wx: string[];
  chenggu: ChengguResult;
  ziwei: ZweiFrontend;
  zodiac: ZodiacFrontend;
  name_wuge: NameWugeResult;
}

export interface ChengguResult {
  年: string;
  月: string;
  日: string;
  时: string;
  总重: string;
  总重数: number;
  歌诀: string;
  等级: string;
}

export interface ZweiFrontend {
  life_palace: string;
  body_palace: string;
  wuxing_ju: string;
  life_master: string;
  body_master: string;
  dayun_direction: string;
  life_palace_stars: string;
  格局: string[];
}

export interface ZodiacFrontend {
  sun_sign: string;
  moon_sign: string;
  rising_sign: string | null;
}

export interface NameWugeResult {
  [ge: string]: any;
}

export interface TianjiSynastry {
  scores: Record<string, number | null>;
  total: number | null;
  max_possible: number;
  rating: string;
}

// ========= 称骨算命 =========

const YEAR_WEIGHT: Record<string, number> = {
  "甲子": 12, "丙子": 16, "戊子": 15, "庚子": 7, "壬子": 5,
  "乙丑": 9, "丁丑": 8, "己丑": 7, "辛丑": 7, "癸丑": 7,
  "丙寅": 6, "戊寅": 8, "庚寅": 9, "壬寅": 9, "甲寅": 12,
  "丁卯": 7, "己卯": 19, "辛卯": 12, "癸卯": 12, "乙卯": 8,
  "戊辰": 12, "庚辰": 12, "壬辰": 10, "甲辰": 8, "丙辰": 8,
  "己巳": 5, "辛巳": 6, "癸巳": 7, "乙巳": 7, "丁巳": 6,
  "庚午": 9, "壬午": 8, "甲午": 15, "丙午": 13, "戊午": 19,
  "辛未": 8, "癸未": 7, "乙未": 6, "丁未": 5, "己未": 6,
  "壬申": 7, "甲申": 5, "丙申": 5, "戊申": 14, "庚申": 8,
  "癸酉": 8, "乙酉": 15, "丁酉": 14, "己酉": 5, "辛酉": 16,
  "甲戌": 15, "丙戌": 6, "戊戌": 14, "庚戌": 9, "壬戌": 10,
  "乙亥": 9, "丁亥": 16, "己亥": 9, "辛亥": 17, "癸亥": 6,
};

const MONTH_WEIGHT: Record<number, number> = { 1: 6, 2: 7, 3: 18, 4: 9, 5: 5, 6: 16, 7: 9, 8: 15, 9: 18, 10: 8, 11: 9, 12: 5 };

const DAY_WEIGHT: Record<number, number> = {
  1: 5, 2: 10, 3: 8, 4: 15, 5: 16, 6: 15, 7: 8, 8: 16, 9: 8, 10: 16,
  11: 9, 12: 17, 13: 8, 14: 17, 15: 10, 16: 8, 17: 9, 18: 18, 19: 5, 20: 15,
  21: 10, 22: 9, 23: 8, 24: 9, 25: 15, 26: 18, 27: 7, 28: 8, 29: 16, 30: 6,
};

const HOUR_WEIGHT: Record<number, number> = { 0: 16, 1: 6, 2: 7, 3: 10, 4: 9, 5: 16, 6: 10, 7: 8, 8: 8, 9: 9, 10: 6, 11: 6 };

const CHENGGU_POEM: Record<number, [string, string]> = {
  21: ["短命非业谓大凶，平生灾难事重重，凶祸频临限逆境，终世困苦事不成。", "命极薄"],
  22: ["身寒骨冷苦伶仃，此命推来行乞人，劳劳碌碌无度日，中年打拱过平生。", "命薄"],
  23: ["此命推来骨轻轻，求谋做事事难成，妻儿兄弟应难许，别处他乡作散人。", "命薄"],
  24: ["此命推来福禄无，门庭困苦总难荣，六亲骨肉皆无靠，流到他乡作老人。", "命薄"],
  25: ["此命推来祖业微，门庭营度似希奇，六亲骨肉如水炭，一世勤劳自把持。", "命轻"],
  26: ["平生一路苦中求，独自营谋事不休，离祖出门宜早计，晚来衣禄自无忧。", "命轻"],
  27: ["一生做事少商量，难靠祖宗作主张，独马单枪空作去，早年晚岁总无长。", "命轻"],
  28: ["一生作事似飘蓬，祖宗产业在梦中，若不过房并改姓，也当移徒二三通。", "命轻"],
  29: ["初年运限未曾亨，纵有功名在后成，须过四旬方可上，移居改姓使为良。", "中等偏下"],
  30: ["劳劳碌碌苦中求，东走西奔何日休，若能终身勤与俭，老来稍可免忧愁。", "中等偏下"],
  31: ["忙忙碌碌苦中求，何日云开见日头，难得祖基家可立，中年衣食渐无忧。", "中等"],
  32: ["初年运错事难谋，渐有财源如水流，到的中年衣食旺，那时名利一齐来。", "中等"],
  33: ["早年做事事难成，百计徒劳枉费心，半世自如流水去，后来运到始得金。", "中等"],
  34: ["此命福气果如何，僧道门中衣禄多，离祖出家方得妙，终朝拜佛念弥陀。", "中等"],
  35: ["生平福量不周全，祖业根基觉少传，营事生涯宜守旧，时来衣食胜从前。", "中等"],
  36: ["不须劳碌过平生，独自成家福不轻，早有福星常照命，任君行去百般成。", "中等偏上"],
  37: ["此命般般事不成，弟兄少力自孤成，虽然祖业须微有，来的明时去的暗。", "中等"],
  38: ["一生骨肉最清高，早入学门姓名标，待看年将三十六，蓝衣脱去换红袍。", "中等偏上"],
  39: ["此命终身运不通，劳劳做事尽皆空，苦心竭力成家计，到得那时在梦中。", "中等偏下"],
  40: ["平生衣禄是绵长，件件心中自主张，前面风霜都受过，从来必定享安泰。", "中上"],
  41: ["此命推来事不同，为人能干异凡庸，中年还有逍遥福，不比前年云未通。", "中上"],
  42: ["得宽处怀且宽怀，何用双眉总不开，若使中年命运济，那时名利一齐来。", "中上"],
  43: ["为人心性最聪明，做事轩昂近贵人，衣禄一生天数定，不须劳碌是丰亨。", "中上"],
  44: ["来事由天莫苦求，须知福禄胜前途，当年财帛难如意，晚景欣然便不忧。", "中上"],
  45: ["福中取贵格求真，明敏才华志自伸，福禄寿全家道吉，桂兰毓秀晚荣臻。", "上等"],
  46: ["东西南北尽皆通，出姓移名更觉隆，衣禄无亏天数定，中年晚景一般同。", "上等"],
  47: ["此命推来旺末年，妻荣子贵自怡然，平生原有滔滔福，可有财源如水流。", "上等"],
  48: ["幼年运道未曾享，苦是蹉跎再不兴，兄弟六亲皆无靠，一身事业晚年成。", "中上"],
  49: ["此命推来福不轻，自立自成显门庭，从来富贵人亲近，使婢差奴过一生。", "上等"],
  50: ["为利为名终日劳，中年福禄也多遭，老来是有财星照，不比前番目下高。", "上等"],
  51: ["一世荣华事事通，不须劳碌自亨通，兄弟叔侄皆如意，家业成时福禄宏。", "上等"],
  52: ["一世亨通事事能，不须劳思自然能，宗施欣然心皆好，家业丰亨自称心。", "上等"],
  53: ["此格推来气象真，兴家发达在其中，一生福禄安排定，却是人间一富翁。", "上等"],
  54: ["此命推来厚且清，诗书满腹看功成，丰衣足食自然稳，正是人间有福人。", "上等"],
  55: ["走马扬鞭争名利，少年做事废筹论，一朝福禄源源至，富贵荣华显六亲。", "上上"],
  56: ["此格推来礼仪通，一生福禄用无穷，甜酸苦辣皆尝过，财源滚滚稳且丰。", "上上"],
  57: ["福禄盈盈万事全，一生荣耀显双亲，名扬威震人钦敬，处世逍遥似遇春。", "上上"],
  58: ["平生福禄自然来，名利兼全福禄偕，雁塔提名为贵客，紫袍金带走金鞋。", "上上"],
  59: ["细推此格妙且清，必定才高礼仪通，甲第之中应有分，扬鞭走马显威荣。", "极佳"],
  60: ["一朝金榜快题名，显祖荣宗立大功，衣食定然原欲足，田园财帛更丰盈。", "极佳"],
  61: ["不做朝中金榜客，定为世上一财翁，聪明天赋经书熟，名显高克自是荣。", "极佳"],
  62: ["此名生来福不穷，读书必定显亲荣，紫衣金带为卿相，富贵荣华皆可同。", "极佳"],
  63: ["命主为官福禄长，得来富贵定非常，名题金塔传金榜，定中高科天下扬。", "极佳"],
  64: ["此格权威不可当，紫袍金带坐高堂，荣华富贵谁能及，积玉堆金满储仓。", "极佳"],
  65: ["细推此命福不轻，安国安邦极品人，文绣雕梁政富贵，威声照耀四方闻。", "极佳"],
  66: ["此格人间一福人，堆金积玉满堂春，从来富贵由天定，正笏垂绅谒圣君。", "极佳"],
  67: ["此名生来福自宏，田园家业最高隆，平生衣禄丰盈足，一世荣华万事通。", "极佳"],
  68: ["富贵由天莫苦求，万金家计不须谋，十年不比前番事，祖业根基水上舟。", "极佳"],
  69: ["君是人间衣禄星，一生福贵众人钦，纵然福禄由天定，安享荣华过一生。", "极佳"],
  70: ["此命推来福不轻，不须愁虑苦劳心，一生天定衣与禄，富贵荣华过一生。", "极佳"],
  71: ["此命生来大不同，公侯卿相在其中，一生自有逍遥福，富贵荣华极品隆。", "极佳"],
  72: ["此格世界罕有生，十代积善产此人，天上紫微来照命，统治万民乐太平。", "极佳"],
};

function weightStr(w: number): string {
  return w >= 10 ? `${Math.floor(w / 10)}两${w % 10}钱` : `${w}钱`;
}

function calcChenggu(yearGz: string, lunarMonth: number, lunarDay: number, hour: number): ChengguResult {
  const hourIdx = getShichen(hour);
  const yearW = YEAR_WEIGHT[yearGz] ?? 0;
  const monthW = MONTH_WEIGHT[lunarMonth] ?? 0;
  const dayW = DAY_WEIGHT[lunarDay] ?? 0;
  const hourW = HOUR_WEIGHT[hourIdx] ?? 0;
  const total = yearW + monthW + dayW + hourW;
  const [poem, level] = CHENGGU_POEM[total] ?? ["此骨重不在常规歌诀范围内", ""];
  return {
    年: weightStr(yearW), 月: weightStr(monthW),
    日: weightStr(dayW), 时: weightStr(hourW),
    总重: weightStr(total), 总重数: total,
    歌诀: poem, 等级: level,
  };
}

// ========= 星座计算（简版：太阳/月亮黄经 + 上升点） =========

const ZODIAC_ORDER = ["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
                      "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"];

/** 儒略日转 JDN */
function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/** 儒略日（包含时刻） */
function gregorianToJd(year: number, month: number, day: number, hour = 12, minute = 0): number {
  const jdn = gregorianToJdn(year, month, day);
  return jdn + (hour - 12) / 24 + minute / 1440;
}

/** 太阳黄经（Meeus 简化版），返回归一化到 [0,360) */
function solarLongitude(jdUt: number): number {
  const n = jdUt - 2451545.0;
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = (357.528 + 0.9856003 * n) % 360;
  const gRad = ((g % 360) + 360) % 360 * Math.PI / 180;
  const lambda = L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
  return ((lambda % 360) + 360) % 360;
}

/** 月亮黄经（简化 Meeus ELP2000-82B 前20项） */
function moonLongitude(jdUt: number): number {
  const T = (jdUt - 2451545.0) / 36525;
  const L0 = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699;
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868;

  const toR = (x: number) => (x % 360) * Math.PI / 180;
  const Mr = toR(M), Mpr = toR(Mp), Fr = toR(F), Dr = toR(D);

  const corr = (6288774 * Math.sin(Mpr) + 1274027 * Math.sin(2 * Dr - Mpr)
    + 658314 * Math.sin(2 * Dr) + 213618 * Math.sin(2 * Mpr)
    - 185116 * Math.sin(Mr) - 114332 * Math.sin(2 * Fr)
    + 58793 * Math.sin(2 * Dr - 2 * Mpr) + 57066 * Math.sin(2 * Dr - Mr - Mpr)
    + 53322 * Math.sin(2 * Dr + Mpr) + 45758 * Math.sin(2 * Dr - Mr)
    - 40923 * Math.sin(Mr - Mpr) - 34720 * Math.sin(Dr)
    - 30383 * Math.sin(Mr + Mpr) + 15327 * Math.sin(2 * Dr - 2 * Fr)
    - 12528 * Math.sin(Mpr + 2 * Fr) + 10980 * Math.sin(Mpr - 2 * Fr)
    + 10675 * Math.sin(4 * Dr - Mpr) + 10034 * Math.sin(3 * Mpr)
    + 8548 * Math.sin(4 * Dr - 2 * Mpr) - 7888 * Math.sin(2 * Dr + Mr - Mpr)) / 1000000;

  return ((L0 + corr) % 360 + 360) % 360;
}

/** 上升点黄经（整宫制） */
function calcAscendant(year: number, month: number, day: number, hour: number, minute: number, lat: number, lonDeg: number): number {
  const tzOffset = lat >= 17 && lat <= 55 && lonDeg >= 72 && lonDeg <= 135.5 ? 8 : Math.round(lonDeg / 15);
  const jd = gregorianToJd(year, month, day, hour, minute);
  const jdUt = jd - tzOffset / 24;
  const T = (jdUt - 2451545.0) / 36525;
  const theta0 = (280.46061837 + 360.98564736629 * (jdUt - 2451545.0)
    + 0.000387933 * T * T - T * T * T / 38710000) % 360;
  const lst = (theta0 + lonDeg) % 360;
  const eps = 23.439291111 - 0.013004167 * T;
  const epsR = eps * Math.PI / 180;
  const latR = lat * Math.PI / 180;
  const lstR = lst * Math.PI / 180;
  const ascLon = Math.atan2(Math.cos(lstR), -(Math.sin(lstR) * Math.cos(epsR) + Math.tan(latR) * Math.sin(epsR))) * 180 / Math.PI;
  return ((ascLon % 360) + 360) % 360;
}

const _CITY_COORDS: Record<string, [number, number]> = {
  "北京": [39.9042, 116.4074], "上海": [31.2304, 121.4737],
  "广州": [23.1291, 113.2644], "深圳": [22.5431, 114.0579],
  "成都": [30.5728, 104.0668], "重庆": [29.563, 106.5516],
  "杭州": [30.2741, 120.1551], "南京": [32.0603, 118.7969],
  "武汉": [30.5928, 114.3055], "西安": [34.3416, 108.9398],
  "纽约": [40.7128, -74.006], "伦敦": [51.5074, -0.1278],
  "东京": [35.6762, 139.6503], "巴黎": [48.8566, 2.3522],
  "悉尼": [-33.8688, 151.2093],
};

function resolveCity(city: string): [number, number] | null {
  if (!city) return null;
  const trimmed = city.trim();
  if (trimmed.includes(",")) {
    const parts = trimmed.split(",").map(s => s.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]), lon = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lon)) return [lat, lon];
    }
  }
  if (_CITY_COORDS[trimmed]) return _CITY_COORDS[trimmed];
  const stripped = trimmed.replace(/(特别行政区|自治州|地区|市|州|县|区)$/, "");
  if (_CITY_COORDS[stripped]) return _CITY_COORDS[stripped];
  for (const [name, coords] of Object.entries(_CITY_COORDS)) {
    if (name.includes(trimmed) || trimmed.includes(name)) return coords;
  }
  return null;
}

// ========= 五格姓名计算（精简版：基于 name_wuge_calc.py 转写） =========

/** 康熙笔画映射（需覆盖名字中常用字，这里按 name_wuge_calc.py 的数据缩编为核心表）
 *  完整的康熙笔画表较大，此处使用 fortune_calc 中 name_wuge_calc 的核心逻辑 */
const KANGXI_STROKES: Record<string, number> = {
  "一": 1, "二": 2, "三": 3, "四": 5, "五": 4, "六": 4, "七": 2, "八": 2, "九": 2, "十": 2,
  "王": 4, "李": 7, "张": 11, "刘": 15, "陈": 16, "杨": 13, "赵": 14, "黄": 12, "周": 8,
  "吴": 7, "徐": 10, "孙": 10, "马": 10, "胡": 9, "朱": 6, "郭": 15, "何": 7, "林": 8,
  "高": 10, "罗": 20, "郑": 19, "梁": 11, "谢": 17, "宋": 7, "唐": 10, "韩": 17, "曹": 11,
  "许": 11, "邓": 19, "萧": 19, "冯": 12, "曾": 12, "程": 12, "蔡": 17, "彭": 12, "潘": 16,
  "袁": 10, "于": 3, "董": 15, "余": 7, "叶": 15, "蒋": 17, "杜": 7, "苏": 22, "魏": 22,
  "吕": 7, "丁": 2, "任": 6, "沈": 8, "姚": 9, "卢": 16, "傅": 12, "钟": 20, "崔": 11,
  "谭": 19, "廖": 14, "汪": 8, "田": 5, "石": 5, "范": 11, "金": 8, "方": 4, "陆": 16,
  "夏": 10, "韦": 9, "贾": 13, "邹": 13, "熊": 14, "孟": 8, "白": 5, "秦": 10, "江": 7,
  "薛": 19, "闫": 14, "段": 9, "雷": 13, "侯": 9, "龙": 16, "万": 15, "贺": 12, "严": 20,
  "尹": 4, "钱": 16, "施": 9, "牛": 4, "洪": 10, "龚": 22, "汤": 13, "陶": 13, "温": 13,
  "康": 11, "文": 4, "武": 8, "安": 6, "毛": 4, "史": 5, "邱": 13, "黎": 15, "茅": 9,
  "郝": 14, "孔": 4, "顾": 22, "邵": 12, "易": 8, "常": 11, "乔": 12, "赖": 16,
  // 常用名字用字
  "明": 8, "华": 14, "强": 12, "伟": 11, "军": 9, "杰": 12, "涛": 18, "勇": 9, "辉": 15,
  "磊": 15, "鹏": 19, "飞": 9, "超": 12, "波": 9, "浩": 11, "志": 7, "国": 11, "建": 9,
  "小": 3, "红": 9, "丽": 19, "敏": 11, "燕": 16, "芳": 10, "静": 16, "萍": 14, "琳": 13,
  "秀": 7, "梅": 11, "兰": 23, "凤": 14, "霞": 17, "雯": 12, "雪": 11, "婷": 12, "娜": 9,
  "怡": 9, "慧": 15, "佳": 8, "俊": 9, "凯": 12, "峰": 10,
  "大": 3, "中": 4, "天": 4, "山": 3, "水": 4,
};

// 复姓表
const SURNAMES: Record<string, number> = {
  "欧阳": 32, "司马": 5, "诸葛": 31, "司徒": 14, "司空": 11,
  "上官": 10, "夏侯": 22, "皇甫": 14, "长孙": 11, "慕容": 17,
  "鲜于": 16, "闾丘": 19, "公羊": 7, "公冶": 8, "宗政": 18,
  "濮阳": 25, "淳于": 12, "单于": 10, "太史": 7, "叔孙": 14,
  "公孙": 12, "轩辕": 14, "令狐": 14, "钟离": 28, "宇文": 10,
  "申屠": 15, "端木": 21, "百里": 7, "呼延": 17, "第五": 19,
  "子车": 9, "颛孙": 18, "万俟": 13, "贺兰": 18, "拓跋": 20,
  "尉迟": 19, "完颜": 16, "赫连": 22, "夹谷": 18,
};

// 81 数理吉凶判定
const WUGE_81: Record<number, [string, string]> = {
  1: ["吉", "万物开泰，吉祥如意"],
  2: ["凶", "混沌未开，进退保守"],
  3: ["吉", "进取如意，名利双收"],
  4: ["凶", "破败多端，辛苦无成"],
  5: ["吉", "福禄寿全，名利双收"],
  6: ["吉", "安泰吉祥，万宝汇聚"],
  7: ["吉", "精悍向进，独立权威"],
  8: ["吉", "努力向上，坚忍志刚"],
  9: ["凶", "苦难浮沉，祸福无常"],
  10: ["凶", "暗淡凄凉，空虚寂寞"],
  11: ["吉", "草木逢春，稳健发展"],
  12: ["凶", "薄弱无力，家庭缘薄"],
  13: ["吉", "天赋奇才，智略超群"],
  14: ["凶", "家庭缘薄，孤独遭难"],
  15: ["吉", "福寿圆满，涵养雅量"],
  16: ["吉", "厚重载德，安富尊荣"],
  17: ["吉", "刚毅果断，权威突破"],
  18: ["吉", "有志竟成，博闻众智"],
  19: ["凶", "风云蔽月，辛苦重来"],
  20: ["凶", "非业破运，凄惨虑悲"],
  21: ["吉", "明月光照，独立权威"],
  22: ["凶", "秋草逢霜，壮志未酬"],
  23: ["吉", "旭日东升，威势冲天"],
  24: ["吉", "白手起家，财源广进"],
  25: ["吉", "资性英敏，刚毅果断"],
  26: ["凶", "变怪莫测，波澜重叠"],
  27: ["吉", "不屈不挠，终成大业"],
  28: ["凶", "遭难运凶，英雄气短"],
  29: ["吉", "青云直上，才略奏功"],
  30: ["吉", "一成一败，浮沉不定"],
  31: ["吉", "智勇兼备，可享清福"],
  32: ["吉", "幸运多望，贵人相助"],
  33: ["吉", "家门隆昌，才德兼备"],
  34: ["凶", "破家亡身，短命非业"],
  35: ["吉", "温和平顺，渐入佳境"],
  36: ["凶", "波澜重叠，常陷穷困"],
  37: ["吉", "权威显达，发展壮大"],
  38: ["吉", "意志薄弱，刻意经营"],
  39: ["吉", "身尊望隆，万事如意"],
  40: ["凶", "智谋胆略，浮沉不定"],
  41: ["吉", "天赋吉运，德望兼备"],
  42: ["凶", "十艺不成，多才多艺"],
  43: ["凶", "雨夜之花，外祥内苦"],
  44: ["凶", "烦闷破家，凡事难展"],
  45: ["吉", "顺风扬帆，万事如意"],
  46: ["凶", "坎坷不平，艰难重重"],
  47: ["吉", "花开之象，万事如意"],
  48: ["吉", "智谋兼备，鹤立鸡群"],
  49: ["凶", "吉凶难分，不断努力"],
  50: ["凶", "一成一败，浮沉不定"],
  51: ["吉", "盛衰交加，先吉后凶"],
  52: ["吉", "卓识达眼，先见之明"],
  53: ["吉", "盛衰交加，内心忧愁"],
  54: ["凶", "多难悲运，难望成功"],
  55: ["吉", "外貌昌隆，内隐祸患"],
  56: ["凶", "浪里行舟，历尽艰辛"],
  57: ["吉", "寒雪青松，百事如意"],
  58: ["吉", "半凶半吉，浮沉多端"],
  59: ["凶", "难以为继，行事不成"],
  60: ["凶", "黑暗无光，迷津难渡"],
  61: ["吉", "万宝聚集，繁盛安康"],
  62: ["凶", "基础虚弱，渐入衰微"],
  63: ["吉", "万物化育，繁荣之象"],
  64: ["凶", "徒劳无功，坐吃山空"],
  65: ["吉", "吉运自来，富贵长寿"],
  66: ["凶", "进退维谷，黑暗长夜"],
  67: ["吉", "利路亨通，万事如意"],
  68: ["吉", "兴家立业，思虑周详"],
  69: ["凶", "动摇不定，常陷逆境"],
  70: ["凶", "惨淡经营，难逃贫困"],
  71: ["凶", "吉凶参半，耗费心力"],
  72: ["凶", "荣枯相伴，进退维谷"],
  73: ["吉", "安乐自来，自然吉祥"],
  74: ["凶", "残花经霜，无进取力"],
  75: ["吉", "退守保吉，妄动则败"],
  76: ["凶", "倾覆离散，骨肉分离"],
  77: ["吉", "半吉半凶，幸福开端"],
  78: ["吉", "晚境荣华，中年发达"],
  79: ["凶", "身疲力竭，精神不安"],
  80: ["凶", "辛苦一生，华而不实"],
  81: ["吉", "万物还元，极数之吉"],
};

/** 获取字对应的康熙笔画（未知字默认 10 画） */
function getStroke(char: string): number {
  return KANGXI_STROKES[char] ?? 10;
}

/** 检测复姓并返回姓氏笔画 */
function detectSurname(name: string): { surnameChars: number; givenChars: number; surnameStroke: number } {
  for (const [sur, surStroke] of Object.entries(SURNAMES)) {
    if (name.startsWith(sur) && name.length > sur.length) {
      const given = name.slice(sur.length);
      let givenStroke = 0;
      for (const ch of given) givenStroke += getStroke(ch);
      return { surnameChars: sur.length, givenChars: given.length, surnameStroke: surStroke };
    }
  }
  // 单姓（默认姓氏1字，但允许姓氏2字自动识别失败的情况）
  const surnameStroke = getStroke(name[0]);
  let givenStroke = 0;
  for (let i = 1; i < name.length; i++) givenStroke += getStroke(name[i]);
  return { surnameChars: 1, givenChars: name.length - 1, surnameStroke };
}

/** 计算81数理循环 */
function wugeCycle(n: number): number {
  return ((n - 1) % 81) + 1;
}

function calcWuGe(name: string): NameWugeResult {
  if (!name) return { 综合评分: 0, 综合评级: "未提供姓名" };

  const { surnameChars, givenChars, surnameStroke } = detectSurname(name);
  if (givenChars === 0) return { 综合评分: 0, 综合评级: "仅单名" };

  // 姓氏笔画总和
  let surTotal = surnameStroke;
  if (surnameChars === 2) {
    const surGiven = name.slice(0, surnameChars);
    surTotal = SURNAMES[surGiven] ?? getStroke(surGiven[0]) + getStroke(surGiven[1]);
  } else {
    surTotal = getStroke(name[0]);
  }

  // 名字笔画总和
  let givenTotal = 0;
  for (let i = surnameChars; i < name.length; i++) givenTotal += getStroke(name[i]);
  // 单字笔画
  const given1Stroke = surnameChars < name.length ? getStroke(name[surnameChars]) : 0;
  const given2Stroke = surnameChars + 1 < name.length ? getStroke(name[surnameChars + 1]) : 0;

  // 全名笔画
  const totalStroke = surTotal + givenTotal;

  const tianGe = surnameChars === 1 ? surTotal + 1 : surTotal;
  const renGe = surnameChars === 1 ? surTotal + given1Stroke : surTotal + given1Stroke;
  const diGe = surnameChars === 1 ? given1Stroke + given2Stroke : givenTotal;
  const waiGe = surnameChars === 1 ? totalStroke - renGe + 1 : totalStroke - renGe + surnameChars;
  const zongGe = totalStroke;

  const geData = (n: number) => {
    const cyc = wugeCycle(n);
    const [luck, meaning] = WUGE_81[cyc] ?? ["凶", "未知"];
    return { 数理: n, 循环: cyc, 吉凶: luck, 含义: meaning };
  };

  // 综合评分（基于天人格地外总五格的吉凶加权）
  const wugeMap = { 天格: tianGe, 人格: renGe, 地格: diGe, 外格: waiGe, 总格: zongGe };
  let score = 0;
  const weight: Record<string, number> = { 人格: 40, 地格: 25, 总格: 20, 外格: 10, 天格: 5 };
  for (const [ge, n] of Object.entries(wugeMap)) {
    const luck = WUGE_81[wugeCycle(n)]?.[0] ?? "凶";
    if (luck === "吉") score += weight[ge] ?? 0;
    else if (luck === "大吉") score += weight[ge] ?? 0;
  }

  const wuge: Record<string, any> = {};
  for (const [ge, n] of Object.entries(wugeMap)) {
    wuge[ge] = geData(n);
  }
  wuge["综合评分"] = Math.round(score);
  const pct = score / 100;
  wuge["综合评级"] = pct >= 0.8 ? "大吉" : pct >= 0.6 ? "吉" : pct >= 0.4 ? "中" : pct >= 0.2 ? "凶" : "大凶";

  return wuge;
}

// ========= 合盘分析 =========

const SHENGXIAO_DELTA: Record<string, number> = {
  "六合": 20, "三合": 15, "同支比和": 8, "六冲": -12, "相害": -8, "相刑": -6, "相破": -4,
};

const LIU_HE_SET = new Set(["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"].map(s => [...s].sort().join("|")));
const LIU_HE_LOOKUP = (z1: string, z2: string): boolean => {
  const pair = [z1, z2].sort();
  return ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"].includes(pair[0] + pair[1]);
};
const SAN_HE_GROUPS = [["申", "子", "辰"], ["寅", "午", "戌"], ["巳", "酉", "丑"], ["亥", "卯", "未"]];
const SAN_HE_LOOKUP = (z1: string, z2: string): boolean => {
  return SAN_HE_GROUPS.some(g => g.includes(z1) && g.includes(z2));
};
const LIU_CHONG_SET = new Set(["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"].flatMap(s => [[...s].sort().join("|")]));
const XIANG_HAI_SET = new Set(["子未", "丑午", "寅巳", "卯辰", "申亥", "酉戌"].flatMap(s => [[...s].sort().join("|")]));
const XIANG_XING_SET = new Set(["寅巳", "巳申", "寅申"].flatMap(s => [[...s].sort().join("|")]));
const XIANG_PO_SET = new Set(["子酉", "卯午", "辰丑", "未戌", "申亥", "寅亥"].flatMap(s => [[...s].sort().join("|")]));

function isPairInSet(z1: string, z2: string, set: Set<string>): boolean {
  const a = [z1, z2].sort().join("|");
  return set.has(a);
}

const TIAN_GAN_HE: Record<string, string> = { "甲乙": "戊己", "甲己": "土", "乙庚": "金", "丙辛": "水", "丁壬": "木", "戊癸": "火" };

function scoreShengxiao(z1: string, z2: string): { score: number; labels: string[] } {
  const labels: string[] = [];
  let delta = 0;
  if (z1 === z2) { labels.push("同支比和"); delta += 8; }
  if (LIU_HE_LOOKUP(z1, z2)) { labels.push("六合"); delta += 20; }
  if (SAN_HE_LOOKUP(z1, z2)) { labels.push("三合"); delta += 15; }
  if (isPairInSet(z1, z2, LIU_CHONG_SET)) { labels.push("六冲"); delta -= 12; }
  if (isPairInSet(z1, z2, XIANG_HAI_SET)) { labels.push("相害"); delta -= 8; }
  if (isPairInSet(z1, z2, XIANG_XING_SET)) { labels.push("相刑"); delta -= 6; }
  if (isPairInSet(z1, z2, XIANG_PO_SET)) { labels.push("相破"); delta -= 4; }
  if (labels.length === 0) labels.push("无特殊关系");
  return { score: Math.max(0, Math.min(20, 12 + delta)), labels };
}

function scoreRizhuPair(g1: string, g2: string): { score: number; label: string } {
  const wx1 = WUXING_GAN[g1], wx2 = WUXING_GAN[g2];
  // 天干五合
  for (const [pair, _] of Object.entries(TIAN_GAN_HE)) {
    if (pair.includes(g1) && pair.includes(g2) && g1 !== g2) {
      return { score: 20, label: "天干五合" };
    }
  }
  const sheng = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" } as Record<string, string>;
  const ke = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" } as Record<string, string>;
  if (sheng[wx1] === wx2 || sheng[wx2] === wx1) return { score: 15, label: "相生" };
  if (wx1 === wx2) return { score: 10, label: "比和" };
  if (ke[wx1] === wx2 || ke[wx2] === wx1) return { score: 6, label: "相克" };
  return { score: 10, label: "中性" };
}

function zodiacAngle(z1: string, z2: string): number {
  const idx1 = ZODIAC_ORDER.indexOf(z1), idx2 = ZODIAC_ORDER.indexOf(z2);
  let diff = Math.abs(idx2 - idx1);
  if (diff > 6) diff = 12 - diff;
  return diff * 30;
}

const XINGZUO_ASPECT: Record<number, number> = { 0: 15, 30: 10, 60: 12, 90: 8, 120: 13, 150: 9, 180: 10 };

const BAND_WUXING_BALANCE = 20;
const BAND_WUXING_COMPLETE = 5;
const BAND_SHENGXIAO = 20;
const BAND_XINGZUO = 15;
const BAND_RIZHU = 20;
const BAND_CHENGGU = 15;
const BAND_XINGMING = 5;

function analyzeSynastry(persons: TianjiPerson[]): TianjiSynastry {
  if (persons.length < 2) {
    return { scores: {}, total: null, max_possible: 100, rating: "至少需要2人才能合盘" };
  }

  const pairs: [TianjiPerson, TianjiPerson][] = [];
  for (let i = 0; i < persons.length; i++)
    for (let j = i + 1; j < persons.length; j++)
      pairs.push([persons[i], persons[j]]);

  const groupWx: Record<string, number> = { "金": 0, "木": 0, "水": 0, "火": 0, "土": 0 };
  for (const p of persons) {
    for (const [k, v] of Object.entries(p.wx)) groupWx[k] = (groupWx[k] ?? 0) + v;
  }
  const maxWx = Math.max(...Object.values(groupWx));
  const minWx = Math.min(...Object.values(groupWx));
  const balance = maxWx - minWx;
  const missingGroup = Object.entries(groupWx).filter(([_, v]) => v === 0).map(([k]) => k);

  let wxBalanceScore: number;
  if (balance <= 3) wxBalanceScore = 20;
  else if (balance <= 5) wxBalanceScore = 15;
  else if (balance <= 8) wxBalanceScore = 10;
  else wxBalanceScore = 5;

  const wxCompleteScore = missingGroup.length === 0 ? BAND_WUXING_COMPLETE : 0;

  const sxScores: number[] = [];
  for (const [m1, m2] of pairs) {
    const r = scoreShengxiao(m1.shengxiao, m2.shengxiao);
    sxScores.push(r.score);
  }
  const shengxiaoScore = sxScores.length > 0 ? sxScores.reduce((a, b) => a + b, 0) / sxScores.length : 0;

  const xzScores: number[] = [];
  for (const [m1, m2] of pairs) {
    const angle = zodiacAngle(m1.zodiac.sun_sign, m2.zodiac.sun_sign);
    xzScores.push(XINGZUO_ASPECT[angle] ?? 8);
  }
  const xingzuoScore = xzScores.length > 0 ? xzScores.reduce((a, b) => a + b, 0) / xzScores.length : 0;

  const rzScores: number[] = [];
  for (const [m1, m2] of pairs) {
    const r = scoreRizhuPair(m1.day_gan, m2.day_gan);
    rzScores.push(r.score);
  }
  const rizhuScore = rzScores.length > 0 ? rzScores.reduce((a, b) => a + b, 0) / rzScores.length : 0;

  const avgWeight = persons.reduce((sum, p) => sum + (p.chenggu.总重数 ?? 0), 0) / persons.length;
  let chengguScore: number;
  if (avgWeight >= 45) chengguScore = 15;
  else if (avgWeight >= 40) chengguScore = 12;
  else if (avgWeight >= 35) chengguScore = 9;
  else if (avgWeight >= 30) chengguScore = 6;
  else chengguScore = 3;

  // 姓名合盘（有 wuge 时计分）
  let xingmingScore = 0;
  const allHaveWuge = persons.every(p => p.name_wuge && p.name_wuge["综合评分"] !== undefined);
  const maxPossible = BAND_WUXING_BALANCE + BAND_WUXING_COMPLETE + BAND_SHENGXIAO + BAND_XINGZUO + BAND_RIZHU + BAND_CHENGGU + (allHaveWuge ? BAND_XINGMING : 0);

  if (allHaveWuge && persons.length <= 10) {
    // 简单人名合盘：五格数理契合度
    let nameScore = 0;
    for (const [m1, m2] of pairs) {
      const g1 = m1.name_wuge["人格"]?.数理 ?? 0;
      const g2 = m2.name_wuge["人格"]?.数理 ?? 0;
      if (g1 && g2) {
        const diff = Math.abs(g1 - g2);
        nameScore += diff <= 5 ? 5 : diff <= 10 ? 3 : 1;
      }
    }
    nameScore = pairs.length > 0 ? nameScore / pairs.length : 0;
    xingmingScore = parseFloat((nameScore / 5 * BAND_XINGMING).toFixed(1));
  }

  let total = Math.round((wxBalanceScore + wxCompleteScore + shengxiaoScore + xingzuoScore + rizhuScore + chengguScore + xingmingScore) * 10) / 10;
  total = Math.min(total, maxPossible);

  const pct = total / maxPossible * 100;
  let rating: string;
  if (pct >= 85) rating = "★★★★★ 极佳组合";
  else if (pct >= 70) rating = "★★★★☆ 良好组合";
  else if (pct >= 55) rating = "★★★☆☆ 中等组合";
  else if (pct >= 40) rating = "★★☆☆☆ 有待改善";
  else rating = "★☆☆☆☆ 需多加注意";

  return {
    scores: {
      wuxing_balance: wxBalanceScore,
      wuxing_complete: wxCompleteScore,
      shengxiao: parseFloat(shengxiaoScore.toFixed(1)),
      rizhu: parseFloat(rizhuScore.toFixed(1)),
      zodiac: parseFloat(xingzuoScore.toFixed(1)),
      chenggu: chengguScore,
      wuge: xingmingScore,
    },
    total,
    max_possible: maxPossible,
    rating,
  };
}

// ========= 主聚合函数 =========

export function calcTianji(input: { members: TianjiMemberInput[] }): TianjiResult {
  if (!input.members || input.members.length === 0) {
    return { meta: { version: "v8.3", mode: "personal" }, members: [], synastry: { scores: {}, total: null, max_possible: 100, rating: "" } };
  }

  const persons: TianjiPerson[] = [];

  for (const m of input.members) {
    const solarParts = m.solar_date.split("-").map(Number);
    const timeParts = m.birth_time.split(":").map(Number);
    const year = solarParts[0], month = solarParts[1], day = solarParts[2];
    const hour = timeParts[0], minute = timeParts[1] || 0;
    const hourFloat = hour + minute / 60;

    // ----- 八字（已有 TS 引擎） -----
    let baziResult: BaZiResult;
    try {
      baziResult = buildBazi(year, month, day, hour, m.gender === "女" ? 0 : 1);
    } catch {
      // fallback: 手动构建最简四柱
      baziResult = { 四柱: { 年柱: "", 月柱: "", 日柱: "", 时柱: "" }, 日主: "", 日主五行: "", 日主阴阳: "", 十神: {}, 五行旺衰: {} } as any;
    }

    const baziArr = [baziResult.四柱?.年柱 ?? "", baziResult.四柱?.月柱 ?? "", baziResult.四柱?.日柱 ?? "", baziResult.四柱?.时柱 ?? ""];
    const yearGz = baziArr[0];
    const dayGz = baziArr[2];
    const dayGan = dayGz ? dayGz[0] : "";
    const yearZhi = yearGz ? yearGz[1] : "";

    // 生肖
    const sxIdx = DIZHI.indexOf(yearZhi);
    const shengxiao = sxIdx >= 0 ? SHENGXIAO[yearZhi] ?? "" : "";

    // 五行旺衰
    const wx: Record<string, number> = { "金": 0, "木": 0, "水": 0, "火": 0, "土": 0 };
    for (const p of baziArr) {
      const g = p[0], z = p[1];
      if (WUXING_GAN[g]) wx[WUXING_GAN[g]] = (wx[WUXING_GAN[g]] ?? 0) + 1;
    }
    const missingWx = Object.entries(wx).filter(([_, v]) => v === 0).map(([k]) => k);

    // 纳音
    const nayins = baziArr.map(p => NAYIN[p] ?? "未知");

    // ----- 农历（已有 lunar.ts） -----
    let lunarMonth = month, lunarDay = day;
    try {
      const lunar = solarToLunar(year, month, day);
      if (lunar) {
        lunarMonth = lunar.month;
        lunarDay = lunar.day;
      }
    } catch {
      // fallback 使用公历月日
    }

    // ----- 称骨 -----
    const chenggu = calcChenggu(yearGz, lunarMonth, lunarDay, hourFloat);

    // ----- 星座 -----
    const jd = gregorianToJd(year, month, day, 12, 0);
    const jdUt = jd - 8 / 24;
    const sunLon = solarLongitude(jdUt);
    const sunIdx = Math.floor(sunLon / 30) % 12;
    const sunSign = ZODIAC_ORDER[sunIdx];

    const moonLon = moonLongitude(jdUt);
    const moonIdx = Math.floor(moonLon / 30) % 12;
    const moonSign = ZODIAC_ORDER[moonIdx];

    // 上升星座（如果有城市）
    let risingSign: string | null = null;
    if (m.birth_city) {
      const coords = resolveCity(m.birth_city);
      if (coords) {
        const [lat, lon] = coords;
        const ascLon = calcAscendant(year, month, day, hour, minute, lat, lon);
        const ascIdx = Math.floor(ascLon / 30) % 12;
        risingSign = ZODIAC_ORDER[ascIdx];
      }
    }

    const zodiac: ZodiacFrontend = { sun_sign: sunSign, moon_sign: moonSign, rising_sign: risingSign };

    // ----- 紫微（已有 TS 引擎） -----
    let zweiResult: ZweiResult;
    try {
      zweiResult = buildChart(year, month, day, hour, m.gender === "女" ? 0 : 1);
    } catch {
      zweiResult = { 命宫: "", 身宫: "", 五行局: "", 命主: "", 身主: "", 大运方向: "", 命宫主星: [], 格局识别: [] } as any;
    }

    // 命主（年支查表）
    const MING_ZHU: Record<string, string> = {
      "子": "贪狼", "丑": "巨门", "寅": "禄存", "卯": "文曲",
      "辰": "廉贞", "巳": "武曲", "午": "破军", "未": "武曲",
      "申": "廉贞", "酉": "文曲", "戌": "禄存", "亥": "巨门",
    };
    // 身主（年支查表）
    const SHEN_ZHU: Record<string, string> = {
      "子": "火星", "丑": "天相", "寅": "天梁", "卯": "天同",
      "辰": "文昌", "巳": "天机", "午": "火星", "未": "天相",
      "申": "天梁", "酉": "天同", "戌": "文昌", "亥": "天机",
    };
    // 大运方向：阳男阴女→顺行，阴男阳女→逆行
    // 判断年干阴阳
    const MING_GAN_YANG = ["甲", "丙", "戊", "庚", "壬"];
    const isYangYear = MING_GAN_YANG.includes(yearGz[0]);
    const isMale = m.gender === "男";
    const dayunDir = (isYangYear && isMale) || (!isYangYear && !isMale) ? "顺行" : "逆行";

    // 身宫：以月支为起点，时辰顺数
    // 身宫安法：正月(寅)起，顺数至生月，再从生月顺数至生时 = 身宫地支
    const yearZhiIdx = DIZHI.indexOf(yearZhi);
    const bodyZhiIdx = (yearZhiIdx + 2 + getShichen(hourFloat)) % 12;
    const bodyPalaceZhi = DIZHI[bodyZhiIdx];
    // 身宫天干用五虎遁（与命宫相同规则）
    // 简单起见：用命宫天干的相同五虎遁逻辑
    const WUHU_TG: Record<string, string> = {
      "甲": "丙", "乙": "戊", "丙": "庚", "丁": "壬", "戊": "甲",
      "己": "丙", "庚": "戊", "辛": "庚", "壬": "壬", "癸": "甲",
    };
    // 寅宫天干（年干五虎遁）
    const yinGan = WUHU_TG[yearGz[0]] ?? "甲";
    const yinGanIdx = TIANGAN.indexOf(yinGan);
    const bodyGan = TIANGAN[(yinGanIdx + bodyZhiIdx) % 10];
    const bodyPalace = `${bodyGan}${bodyPalaceZhi}宫`;

    const zweiR = zweiResult as any;
    const mingGan = zweiR.命宫天干 ?? (zweiR.命宫 ? "" : "");
    const mingZhi = zweiR.命宫地支 ?? "";
    const palaceStars: string[] = zweiR.星曜?.命宫 ?? [];
    const ziwei: ZweiFrontend = {
      life_palace: mingGan && mingZhi ? `${mingGan}${mingZhi}宫` : (zweiR.命宫 ?? ""),
      body_palace: bodyPalace,
      wuxing_ju: zweiR.五行局 ?? "",
      life_master: MING_ZHU[yearZhi] ?? "",
      body_master: SHEN_ZHU[yearZhi] ?? "",
      dayun_direction: dayunDir,
      life_palace_stars: palaceStars.join(","),
      格局: zweiR.格局 ?? [],
    };

    // ----- 五格 -----
    const nameWuge = calcWuGe(m.name);

    persons.push({
      name: m.name,
      gender: m.gender,
      solar_date: m.solar_date,
      birth_time: m.birth_time,
      bazi: baziArr,
      nayins,
      day_gan: dayGan,
      shengxiao,
      wx,
      missing_wx: missingWx,
      chenggu,
      ziwei,
      zodiac,
      name_wuge: nameWuge,
    });
  }

  const synastry = persons.length >= 2 ? analyzeSynastry(persons) : { scores: {}, total: null, max_possible: 100, rating: "" };

  return {
    meta: { version: "v8.3", mode: persons.length > 1 ? "synastry" : "personal" },
    members: persons,
    synastry,
  };
}