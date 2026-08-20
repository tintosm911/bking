/**
 * 紫微斗数 · 大师版排盘引擎 (TypeScript)
 * 完整安星：十四主星 + 辅星 + 四化 + 格局 + 交易风格
 */

import { solarToLunar } from "./lunar";

// ========= 基础常数 =========

const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DIZHI   = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const DZ_IDX: Record<string, number> = {};
DIZHI.forEach((z, i) => { DZ_IDX[z] = i; });
const TG_IDX: Record<string, number> = {};
TIANGAN.forEach((g, i) => { TG_IDX[g] = i; });

// 十二宫名称
const GONG_NAMES = ["命宫", "兄弟宫", "夫妻宫", "子女宫", "财帛宫", "疾厄宫",
                    "迁移宫", "交友宫", "官禄宫", "田宅宫", "福德宫", "父母宫"];

// 六十甲子纳音
const NAYIN: Record<number, string> = {
  0: "金", 1: "金", 2: "火", 3: "火", 4: "木", 5: "木",
  6: "水", 7: "水", 8: "土", 9: "土", 10: "金", 11: "金",
  12: "火", 13: "火", 14: "木", 15: "木", 16: "水", 17: "水",
  18: "土", 19: "土", 20: "金", 21: "金", 22: "火", 23: "火",
};

const WUXING_JU_NAMES: Record<number, string> = { 2: "水二局", 3: "木三局", 4: "金四局", 5: "土五局", 6: "火六局" };

// 生年四化
const SIHUA_YEAR: Record<string, Record<string, string>> = {
  "甲": { "廉贞": "化禄", "破军": "化权", "武曲": "化科", "太阳": "化忌" },
  "乙": { "天机": "化禄", "天梁": "化权", "紫微": "化科", "太阴": "化忌" },
  "丙": { "天同": "化禄", "天机": "化权", "文昌": "化科", "廉贞": "化忌" },
  "丁": { "太阴": "化禄", "天同": "化权", "天机": "化科", "巨门": "化忌" },
  "戊": { "贪狼": "化禄", "太阴": "化权", "右弼": "化科", "天机": "化忌" },
  "己": { "武曲": "化禄", "贪狼": "化权", "天梁": "化科", "文曲": "化忌" },
  "庚": { "太阳": "化禄", "武曲": "化权", "天同": "化科", "天相": "化忌" },
  "辛": { "巨门": "化禄", "太阳": "化权", "文曲": "化科", "文昌": "化忌" },
  "壬": { "天梁": "化禄", "紫微": "化权", "左辅": "化科", "武曲": "化忌" },
  "癸": { "破军": "化禄", "巨门": "化权", "太阴": "化科", "贪狼": "化忌" },
};

// 五虎遁
const WUHU: Record<string, string> = {
  "甲": "丙", "乙": "戊", "丙": "庚", "丁": "壬", "戊": "甲",
  "己": "丙", "庚": "戊", "辛": "庚", "壬": "壬", "癸": "甲",
};

// 天魁天钺
const TIAN_KUI: Record<string, string> = {"甲": "丑", "乙": "子", "丙": "亥", "丁": "酉", "戊": "丑", "己": "子", "庚": "丑", "辛": "午", "壬": "卯", "癸": "卯"};
const TIAN_YUE: Record<string, string> = {"甲": "未", "乙": "申", "丙": "酉", "丁": "亥", "戊": "未", "己": "申", "庚": "未", "辛": "巳", "壬": "酉", "癸": "酉"};

// 禄存擎羊陀罗
const LUCUN: Record<string, string> = {"甲": "寅", "乙": "卯", "丙": "巳", "丁": "午", "戊": "巳", "己": "午", "庚": "申", "辛": "酉", "壬": "亥", "癸": "子"};

// 火星铃星
const HUOXING: Record<string, string> = {"甲": "卯", "乙": "丑", "丙": "寅", "丁": "巳", "戊": "巳", "己": "未", "庚": "酉", "辛": "亥", "壬": "子", "癸": "亥"};
const LINGXING: Record<string, string> = {"甲": "戌", "乙": "亥", "丙": "戌", "丁": "亥", "戊": "辰", "己": "巳", "庚": "未", "辛": "申", "壬": "巳", "癸": "巳"};

// 天马
const TIANMA: Record<string, string> = {"子": "寅", "丑": "亥", "寅": "申", "卯": "巳", "辰": "寅", "巳": "亥", "午": "申", "未": "巳", "申": "寅", "酉": "亥", "戌": "申", "亥": "巳"};

// 紫微星系偏移（逆时针）
const ZIWEI_OFFSETS: Record<string, number> = {"紫微": 0, "天机": -1, "太阳": -3, "武曲": -4, "天同": -5, "廉贞": -9};
// 天府星系偏移（顺时针）
const TIANFU_OFFSETS: Record<string, number> = {"天府": 0, "太阴": 2, "贪狼": 3, "巨门": 4, "天相": 5, "天梁": 6, "七杀": 7, "破军": 10};

// ========= 类型定义 =========

export interface ZweiResult {
  姓名: string;
  性别: string;
  公历: string;
  农历: string;
  命宫: string;
  命宫天干: string;
  命宫地支: string;
  五行局: string;
  紫微星: string;
  生年四化: Record<string, string>;
  大限: { 宫: string; 起始年龄: number; 结束年龄: number }[];
  星曜: Record<string, string[]>;
  四化: Record<string, string[]>;
  格局: string[];
  交易风格: Record<string, number>;
  关键宫位: Record<string, string[]>;
  [key: string]: any;
}

// ========= 核心函数 =========
/**
 * 公历转农历（标准算法，用于紫微排盘）
 */
function lunarDate(year: number, month: number, day: number): [number, number, number] {
  const l = solarToLunar(year, month, day);
  return [l.year, l.month, l.day];
}

/**
 * 小时转时辰索引
 */
function getShichen(hour: number): number {
  if (hour >= 23 || hour < 1) return 0;
  if (hour >= 1 && hour < 3) return 1;
  if (hour >= 3 && hour < 5) return 2;
  if (hour >= 5 && hour < 7) return 3;
  if (hour >= 7 && hour < 9) return 4;
  if (hour >= 9 && hour < 11) return 5;
  if (hour >= 11 && hour < 13) return 6;
  if (hour >= 13 && hour < 15) return 7;
  if (hour >= 15 && hour < 17) return 8;
  if (hour >= 17 && hour < 19) return 9;
  if (hour >= 19 && hour < 21) return 10;
  return 11;
}

/**
 * 宫名索引 → 地支（偏移量 based on 命宫位置）
 */
function gongToDz(gongIdx: number, mingPos: number): string {
  return DIZHI[(gongIdx + mingPos + 2) % 12];
}

// ========= 主排盘函数 =========

export function buildChart(year: number, month: number, day: number, hour: number, gender: number = 1): ZweiResult {
  // 1. 转农历
  const [lyr, lmo, lday] = lunarDate(year, month, day);
  const shichenIdx = getShichen(hour);

  // 2. 生年干支
  const yearTg = TIANGAN[((lyr - 4) % 10 + 10) % 10];
  const yearDz = DIZHI[((lyr - 4) % 12 + 12) % 12];

  // 3. 定命宫
  const mingPos = (lmo - 1 + (12 - shichenIdx)) % 12;
  const mingDz = gongToDz(0, mingPos);

  // 4. 各宫天干（五虎遁）
  const yinTg = WUHU[yearTg];
  const yinTgIdx = TG_IDX[yinTg];
  const gongTg: Record<string, string> = {};

  for (let i = 0; i < 12; i++) {
    const dz = gongToDz(i, mingPos);
    const dzIdx = DZ_IDX[dz];
    let tgIdx: number;
    if (dzIdx >= 2) {
      tgIdx = (yinTgIdx + dzIdx - 2) % 10;
    } else {
      tgIdx = (yinTgIdx + dzIdx + 10) % 10;
    }
    gongTg[GONG_NAMES[i]] = TIANGAN[tgIdx];
  }

  const mingTg = gongTg["命宫"];

  // 5. 纳音五行局
  const mingTgIdx = TG_IDX[mingTg];
  const mingDzIdx = DZ_IDX[mingDz];
  const nayinPair = (mingTgIdx * 6 + mingDzIdx) % 60;
  const wuxing = NAYIN[Math.floor(nayinPair / 2)] || "土";
  const juMap: Record<string, number> = { "金": 4, "木": 3, "水": 2, "火": 6, "土": 5 };
  const juNum = juMap[wuxing] || 2;
  const wuxingJuName = WUXING_JU_NAMES[juNum];

  // 6. 安紫微
  const ziweiGongBase = Math.ceil((lday + juNum - 1) / juNum);
  const ziweiPos = ((2 - (ziweiGongBase - 1)) % 12 + 12) % 12;

  // 7. 安十四主星 + 辅星
  const zwDzIdx = ziweiPos;
  const tianfuDz = (zwDzIdx + 6) % 12;

  // 紫微星系
  const ziweiStars: Record<string, string> = {};
  for (const [star, offset] of Object.entries(ZIWEI_OFFSETS)) {
    const pos = ((zwDzIdx + offset) % 12 + 12) % 12;
    const gongIdx = ((pos - mingPos) % 12 + 12) % 12;
    ziweiStars[star] = GONG_NAMES[gongIdx];
  }

  // 天府星系
  const tianfuStars: Record<string, string> = {};
  for (const [star, offset] of Object.entries(TIANFU_OFFSETS)) {
    const pos = (tianfuDz + offset) % 12;
    const gongIdx = ((pos - mingPos) % 12 + 12) % 12;
    tianfuStars[star] = GONG_NAMES[gongIdx];
  }

  // 辅星
  const wenchangDz = (4 + shichenIdx) % 12;
  const wenquDz = ((10 - shichenIdx) % 12 + 12) % 12;
  const zuofuDz = (4 + lmo - 1) % 12;
  const youbiDz = ((10 - lmo + 1) % 12 + 12) % 12;

  const fuStarMap: [string, string][] = [
    ["文昌", GONG_NAMES[((DZ_IDX[DIZHI[wenchangDz]] - mingPos) % 12 + 12) % 12]],
    ["文曲", GONG_NAMES[((DZ_IDX[DIZHI[wenquDz]] - mingPos) % 12 + 12) % 12]],
    ["左辅", GONG_NAMES[((DZ_IDX[DIZHI[zuofuDz]] - mingPos) % 12 + 12) % 12]],
    ["右弼", GONG_NAMES[((DZ_IDX[DIZHI[youbiDz]] - mingPos) % 12 + 12) % 12]],
    ["天魁", GONG_NAMES[((DZ_IDX[TIAN_KUI[yearTg]] - mingPos) % 12 + 12) % 12]],
    ["天钺", GONG_NAMES[((DZ_IDX[TIAN_YUE[yearTg]] - mingPos) % 12 + 12) % 12]],
    ["禄存", GONG_NAMES[((DZ_IDX[LUCUN[yearTg]] - mingPos) % 12 + 12) % 12]],
    ["擎羊", GONG_NAMES[((DZ_IDX[DIZHI[(DZ_IDX[LUCUN[yearTg]] + 1) % 12]] - mingPos) % 12 + 12) % 12]],
    ["陀罗", GONG_NAMES[((DZ_IDX[DIZHI[((DZ_IDX[LUCUN[yearTg]] - 1) % 12 + 12) % 12]] - mingPos) % 12 + 12) % 12]],
    ["火星", GONG_NAMES[((DZ_IDX[HUOXING[yearTg]] - mingPos) % 12 + 12) % 12]],
    ["铃星", GONG_NAMES[((DZ_IDX[LINGXING[yearTg]] - mingPos) % 12 + 12) % 12]],
    ["地空", GONG_NAMES[((DZ_IDX[DIZHI[((4 - shichenIdx) % 12 + 12) % 12]] - mingPos) % 12 + 12) % 12]],
    ["地劫", GONG_NAMES[((DZ_IDX[DIZHI[((10 - shichenIdx) % 12 + 12) % 12]] - mingPos) % 12 + 12) % 12]],
    ["天马", GONG_NAMES[((DZ_IDX[TIANMA[yearDz]] - mingPos) % 12 + 12) % 12]],
  ];

  // 8. 组装星曜
  const gongStars: Record<string, string[]> = {};
  for (const name of GONG_NAMES) gongStars[name] = [];

  for (const [star, gongName] of Object.entries(ziweiStars)) gongStars[gongName].push(star);
  for (const [star, gongName] of Object.entries(tianfuStars)) gongStars[gongName].push(star);
  for (const [star, gongName] of fuStarMap) gongStars[gongName].push(star);

  // 9. 四化
  const gongSihua: Record<string, string[]> = {};
  for (const name of GONG_NAMES) gongSihua[name] = [];
  const yearSihua = SIHUA_YEAR[yearTg] || {};
  for (const [star, huaType] of Object.entries(yearSihua)) {
    for (const gongName of GONG_NAMES) {
      if (gongStars[gongName].includes(star)) {
        gongSihua[gongName].push(`${star}${huaType}`);
      }
    }
  }

  // 10. 大限
  const yinyangYear = ["甲", "丙", "戊", "庚", "壬"].includes(yearTg) ? "阳" : "阴";
  const forward = (yinyangYear === "阳" && gender === 1) || (yinyangYear === "阴" && gender === 0);
  const daiyanStartMap: Record<number, number> = { 2: 2, 3: 4, 4: 6, 5: 8, 6: 10 };
  const daiyanStart = daiyanStartMap[juNum] || 2;

  const daiyan: { 宫: string; 起始年龄: number; 结束年龄: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const pos = forward ? (mingPos + i) % 12 : ((mingPos - i) % 12 + 12) % 12;
    const startAge = daiyanStart + i * 10;
    daiyan.push({
      宫: GONG_NAMES[pos],
      起始年龄: startAge,
      结束年龄: startAge + 9,
    });
  }

  // ========= 格局判定 =========
  const patterns: string[] = [];
  const mingStars = gongStars["命宫"];

  if (mingStars.some(s => ["七杀", "破军", "贪狼"].includes(s))) {
    patterns.push("杀破狼格 — 人生变动大，适合开拓型交易风格");
  }
  if (mingStars.some(s => ["天机", "太阴", "天同", "天梁"].includes(s))) {
    patterns.push("机月同梁格 — 适合精密分析、波段交易");
  }
  if (mingStars.some(s => ["紫微", "天府", "天相", "廉贞", "武曲"].includes(s))) {
    patterns.push("紫府相廉武 — 财格，适合趋势跟踪、价值投资");
  }
  if (mingStars.includes("太阳") && mingStars.includes("太阴")) {
    patterns.push("日月并明格 — 阴阳协调，多市场通吃");
  }
  if (mingStars.includes("天相") && (mingStars.includes("擎羊") || mingStars.includes("铃星"))) {
    patterns.push("刑囚夹印 — 易有法律或规则纠纷");
  }
  if (gongSihua["财帛宫"].some(h => h.includes("化禄"))) {
    patterns.push("财帛化禄 — 正财运强，交易为生者的好配置");
  }
  if (gongStars["迁移宫"].includes("天马")) {
    patterns.push("天马入迁移 — 适合跨市场、跨周期交易");
  }
  if (gongSihua["疾厄宫"].some(h => h.includes("化忌"))) {
    patterns.push("疾厄化忌 — 注意交易压力导致的身心疲劳");
  }

  // ========= 交易风格评分 =========
  const styleScores: Record<string, number> = {
    "纪律": 50, "灵活": 50, "心态": 50, "韧性": 50,
    "风控": 50, "直觉": 50, "深度": 50, "执行力": 50,
  };

  const styleModifiers: Record<string, [string, number][]> = {
    "武曲": [["纪律", 15], ["风控", 10]],
    "天府": [["纪律", 15], ["风控", 10]],
    "贪狼": [["灵活", 15], ["直觉", 10]],
    "破军": [["灵活", 15], ["直觉", 10]],
    "太阳": [["执行力", 10], ["直觉", 10]],
    "廉贞": [["执行力", 10], ["直觉", 10]],
    "天机": [["深度", 15], ["灵活", 5]],
    "太阴": [["深度", 15], ["灵活", 5]],
    "天同": [["心态", 20], ["风控", 10]],
    "天梁": [["心态", 20], ["风控", 10]],
    "七杀": [["执行力", 20], ["韧性", 15]],
    "天相": [["纪律", 10], ["风控", 15]],
    "紫微": [["纪律", 10], ["风控", 15]],
  };

  for (const gongName of GONG_NAMES) {
    for (const star of gongStars[gongName]) {
      const mods = styleModifiers[star];
      if (mods) {
        for (const [k, v] of mods) styleScores[k] += v;
      }
    }
  }

  // 辅星修正
  for (const gongName of GONG_NAMES) {
    const gs = gongStars[gongName];
    if (gs.includes("文昌") || gs.includes("文曲")) styleScores["深度"] += 8;
    if (gs.includes("左辅") || gs.includes("右弼")) styleScores["灵活"] += 5;
    if (gs.includes("天魁") || gs.includes("天钺")) styleScores["直觉"] += 8;
    if (gs.includes("禄存")) styleScores["心态"] += 5;
    if (gs.some(s => ["擎羊", "陀罗", "火星", "铃星"].includes(s))) {
      styleScores["执行力"] += 5;
      styleScores["风控"] -= 8;
    }
    if (gs.includes("地空") || gs.includes("地劫")) {
      styleScores["心态"] -= 5;
      styleScores["灵活"] += 5;
    }
  }

  // 四化修正
  for (const gongName of GONG_NAMES) {
    for (const hua of gongSihua[gongName]) {
      if (hua.includes("化权")) styleScores["执行力"] += 10;
      if (hua.includes("化忌")) {
        styleScores["心态"] -= 10;
        styleScores["风控"] -= 5;
      }
    }
  }

  for (const k of Object.keys(styleScores)) {
    styleScores[k] = Math.max(0, Math.min(100, styleScores[k]));
  }

  // ========= 结果组装 =========
  const result: ZweiResult = {
    姓名: "",
    性别: gender === 1 ? "男" : "女",
    公历: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${hour}:00`,
    农历: `${yearTg}${yearDz}年 ${lmo}月 ${lday}日 ${DIZHI[shichenIdx]}时`,
    命宫: "命宫",
    命宫在地支盘位置: GONG_NAMES[mingPos], // 命宫地支对应十二宫盘的位置
    命宫天干: mingTg,
    命宫地支: mingDz,
    五行局: wuxingJuName,
    紫微星: DIZHI[ziweiPos],
    生年四化: yearSihua,
    大限: daiyan,
    星曜: gongStars,
    四化: gongSihua,
    格局: patterns,
    交易风格: styleScores,
    关键宫位: {
      "命宫": gongStars["命宫"],
      "财帛宫": gongStars["财帛宫"],
      "官禄宫": gongStars["官禄宫"],
      "福德宫": gongStars["福德宫"],
      "迁移宫": gongStars["迁移宫"],
      "夫妻宫": gongStars["夫妻宫"],
      "疾厄宫": gongStars["疾厄宫"],
      "田宅宫": gongStars["田宅宫"],
    },
    命宫四化: gongSihua["命宫"],
    财帛四化: gongSihua["财帛宫"],
    官禄四化: gongSihua["官禄宫"],
    福德四化: gongSihua["福德宫"],
  };

  return result;
}

/**
 * 格式化输出
 */
export function formatChart(chart: ZweiResult): string {
  const lines: string[] = [];
  lines.push("═".repeat(44));
  lines.push("  紫微斗数 · 大师版命盘");
  lines.push(`  ${chart['公历']}`);
  lines.push("═".repeat(44));
  lines.push("");

  lines.push("【基本信息】");
  lines.push(`  农历：${chart['农历']}`);
  lines.push(`  命宫：${chart['命宫']}（${chart['命宫天干']}${chart['命宫地支']}）`);
  lines.push(`  五行局：${chart['五行局']}`);
  lines.push(`  紫微星：在${chart['紫微星']}`);
  lines.push(`  性别：${chart['性别']}`);
  lines.push("");

  lines.push("【十二宫星曜】");
  for (const name of GONG_NAMES) {
    const stars = chart['星曜'][name];
    const sihua = chart['四化'][name];
    if (stars && stars.length > 0) {
      const s = stars.join("  ");
      const h = sihua && sihua.length > 0 ? `  [${sihua.join(', ')}]` : "";
      lines.push(`  ${name}：${s}${h}`);
    } else {
      lines.push(`  ${name}：空宫`);
    }
  }
  lines.push("");

  if (chart['格局'] && chart['格局'].length > 0) {
    lines.push("【格局显现】");
    for (const p of chart['格局']) lines.push(`  · ${p}`);
    lines.push("");
  }

  lines.push("【交易关键宫位】");
  for (const [g, stars] of Object.entries(chart['关键宫位'])) {
    if (stars && stars.length > 0) {
      lines.push(`  ${g}：${stars.join('  ')}`);
    } else {
      lines.push(`  ${g}：空宫`);
    }
  }
  lines.push("");

  lines.push("【重要四化】");
  if (chart['命宫四化']?.length) lines.push(`  命宫：${chart['命宫四化'].join(', ')}`);
  if (chart['财帛四化']?.length) lines.push(`  财帛宫：${chart['财帛四化'].join(', ')}`);
  if (chart['官禄四化']?.length) lines.push(`  官禄宫：${chart['官禄四化'].join(', ')}`);
  if (chart['福德四化']?.length) lines.push(`  福德宫：${chart['福德四化'].join(', ')}`);
  lines.push("");

  lines.push("【交易风格评分】");
  for (const [k, v] of Object.entries(chart['交易风格'])) {
    const bar = "█".repeat(Math.floor(v / 5)) + "░".repeat(20 - Math.floor(v / 5));
    lines.push(`  ${k}：${String(v).padStart(3)}/100 ${bar}`);
  }
  lines.push("");

  lines.push("【大限运势】");
  for (const d of chart['大限'].slice(0, 3)) {
    lines.push(`  ${d['起始年龄']}-${d['结束年龄']}岁：${d['宫']}`);
  }
  lines.push("  ...（共12大限，完整信息可通过详细查询获取）");
  lines.push("");

  lines.push("【生年四化】");
  for (const [star, hua] of Object.entries(chart['生年四化'])) {
    lines.push(`  ${star}${hua}`);
  }
  lines.push("");
  lines.push("═".repeat(44));

  return lines.join("\n");
}