/**
 * 八字 · 大师版排盘引擎 (TypeScript)
 * 完整四柱：年柱/月柱/日柱/时柱 + 十神 + 五行旺衰 + 用神 + 大运 + 流年
 */

// ========= 基础常数 =========

const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DIZHI   = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const TG_IDX: Record<string, number> = {};
TIANGAN.forEach((g, i) => { TG_IDX[g] = i; });
const DZ_IDX: Record<string, number> = {};
DIZHI.forEach((z, i) => { DZ_IDX[z] = i; });

const YIN_YANG: Record<string, string> = {
  "甲": "阳", "乙": "阴", "丙": "阳", "丁": "阴", "戊": "阳",
  "己": "阴", "庚": "阳", "辛": "阴", "壬": "阳", "癸": "阴"
};

// 五虎遁（年干定月干）：甲己丙为首，乙庚戊为头，丙辛庚起，丁壬壬位，戊癸甲
const WUHU: Record<string, string> = {
  "甲": "丙", "乙": "戊", "丙": "庚", "丁": "壬", "戊": "甲",
  "己": "丙", "庚": "戊", "辛": "庚", "壬": "壬", "癸": "甲",
};

// 五鼠遁（日干定时干）：甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
const WUSHU: Record<string, string> = {
  "甲": "甲", "乙": "丙", "丙": "戊", "丁": "庚", "戊": "壬",
  "己": "甲", "庚": "丙", "辛": "戊", "壬": "庚", "癸": "壬",
};

// 十神
const SHI_SHEN: Record<string, string> = {
  "比肩阳": "比肩", "比肩阴": "劫财",
  "劫财阳": "劫财", "劫财阴": "比肩",
  "食神阳": "食神", "食神阴": "伤官",
  "伤官阳": "伤官", "伤官阴": "食神",
  "正财阳": "正财", "正财阴": "偏财",
  "偏财阳": "偏财", "偏财阴": "正财",
  "正官阳": "正官", "正官阴": "七杀",
  "七杀阳": "七杀", "七杀阴": "正官",
  "正印阳": "正印", "正印阴": "偏印",
  "偏印阳": "偏印", "偏印阴": "正印",
};

// 五行
const WUXING: Record<string, string> = {
  "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土",
  "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
};

const WUXING_SHENG: Record<string, string> = {"木": "火", "火": "土", "土": "金", "金": "水", "水": "木"};
const WUXING_KE: Record<string, string>   = {"木": "土", "土": "水", "水": "火", "火": "金", "金": "木"};

// 地支藏干
const DIZHI_CANG: Record<string, string[]> = {
  "子": ["癸"],
  "丑": ["己", "癸", "辛"],
  "寅": ["甲", "丙", "戊"],
  "卯": ["乙"],
  "辰": ["戊", "乙", "癸"],
  "巳": ["丙", "庚", "戊"],
  "午": ["丁", "己"],
  "未": ["己", "丁", "乙"],
  "申": ["庚", "壬", "戊"],
  "酉": ["辛"],
  "戌": ["戊", "辛", "丁"],
  "亥": ["壬", "甲"],
};

// ========= 类型定义 =========

export interface BaZiResult {
  四柱: Record<string, string>;
  日主: string;
  日主五行: string;
  日主阴阳: string;
  十神: Record<string, [string, string | string[]]>;
  五行旺衰: Record<string, number>;
  日主力量: string;
  用神: string;
  喜神: string;
  忌神: string;
  是否身强: boolean;
  大运: { 大运: string; 年龄: string }[];
  流年: string;
  交易解读: Record<string, string>;
}

// ========= 核心函数 =========

/**
 * 已知2026年1月1日为乙卯日，推算任意日干支
 */
function getGanzhiForDate(year: number, month: number, day: number): [string, string, number, number] {
  const base = new Date(2026, 0, 1);
  const target = new Date(year, month - 1, day);
  const delta = Math.round((target.getTime() - base.getTime()) / 86400000);
  const tgIdx = ((1 + delta) % 10 + 10) % 10;
  const dzIdx = ((3 + delta) % 12 + 12) % 12;
  return [TIANGAN[tgIdx], DIZHI[dzIdx], tgIdx, dzIdx];
}

/**
 * 年干定正月天干（五虎遁）
 */
function getMonthGan(tgYear: string): number[] {
  const first = WUHU[tgYear];
  const firstIdx = TG_IDX[first];
  return Array.from({ length: 12 }, (_, i) => (firstIdx + i) % 10);
}

/**
 * 日干定时干（五鼠遁）
 */
function getShiGan(dayTg: string, shichenIdx: number): string {
  const first = WUSHU[dayTg];
  const firstIdx = TG_IDX[first];
  return TIANGAN[(firstIdx + shichenIdx) % 10];
}

/**
 * 时辰索引
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
 * 十神判断
 */
function getShiShen(dayTg: string, otherTg: string): string {
  const dayWx = WUXING[dayTg];
  const otherWx = WUXING[otherTg];
  const dayYy = YIN_YANG[dayTg];
  const otherYy = YIN_YANG[otherTg];

  let relation: string;
  if (dayWx === otherWx) {
    relation = "比肩";
  } else if (WUXING_SHENG[dayWx] === otherWx) {
    relation = "食神";  // 日主生
  } else if (WUXING_SHENG[otherWx] === dayWx) {
    relation = "正印";  // 生日主
  } else if (WUXING_KE[dayWx] === otherWx) {
    relation = "正财";  // 日主克
  } else if (WUXING_KE[otherWx] === dayWx) {
    relation = "正官";  // 克日主
  } else {
    relation = "比肩";
  }

  return SHI_SHEN[`${relation}${otherYy}`] || relation;
}

// ========= 主排盘函数 =========

export function buildBazi(year: number, month: number, day: number, hour: number, gender: number = 1): BaZiResult {
  // 1. 年柱
  const yearTg = TIANGAN[((year - 4) % 10 + 10) % 10];
  const yearDz = DIZHI[((year - 4) % 12 + 12) % 12];

  // 2. 日柱
  const [dayTg, dayDz, dayTgIdx, dayDzIdx] = getGanzhiForDate(year, month, day);

  // 3. 月柱
  const monthGanList = getMonthGan(yearTg);
  const monthDzIdx = (month + 1) % 12;  // 寅月=2, 卯月=3...子月=0
  const monthlyGans = monthGanList.map(idx => TIANGAN[idx]);
  const monthTg = monthlyGans[monthDzIdx];
  const monthDz = DIZHI[monthDzIdx % 12];

  // 4. 时柱
  const shichenIdx = getShichen(hour);
  const shiTg = getShiGan(dayTg, shichenIdx);
  const shiDz = DIZHI[shichenIdx];

  // 四柱
  const bazi: Record<string, string> = {
    "年柱": `${yearTg}${yearDz}`,
    "月柱": `${monthTg}${monthDz}`,
    "日柱": `${dayTg}${dayDz}`,
    "时柱": `${shiTg}${shiDz}`,
  };

  const baziRaw: Record<string, [string, string]> = {
    "年": [yearTg, yearDz],
    "月": [monthTg, monthDz],
    "日": [dayTg, dayDz],
    "时": [shiTg, shiDz],
  };

  // 5. 十神
  const shiShenResults: Record<string, [string, string | string[]]> = {};
  for (const [pos, [tg, dz]] of Object.entries(baziRaw)) {
    const tgSs = getShiShen(dayTg, tg);
    shiShenResults[`${pos}干`] = [tg, tgSs];

    const cangs = DIZHI_CANG[dz] || [];
    const cangInfo = cangs.map(c => `${c}${getShiShen(dayTg, c)}`);
    shiShenResults[`${pos}支`] = [dz, cangInfo];
  }

  // 6. 五行旺衰
  const allGan = [yearTg, monthTg, dayTg, shiTg];
  const allZhiCang: string[] = [];
  for (const dz of [yearDz, monthDz, dayDz, shiDz]) {
    allZhiCang.push(...(DIZHI_CANG[dz] || []));
  }

  const wxCount: Record<string, number> = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };
  for (const g of allGan) { wxCount[WUXING[g]] += 1; }
  for (const g of allZhiCang) { wxCount[WUXING[g]] += 0.5; }

  // 7. 日主
  const rizhu = `${dayTg} ${dayDz}`;
  const dayWx = WUXING[dayTg];

  // 8. 用神
  const sortedWx = Object.entries(wxCount).sort((a, b) => b[1] - a[1]);
  const strongest = sortedWx[0][0];
  const weakest = sortedWx[sortedWx.length - 1][0];

  let rizhuCount = wxCount[dayWx] || 0;
  rizhuCount += 0.5 * allZhiCang.filter(g => WUXING[g] === dayWx).length;

  const isStrong = rizhuCount >= 3.5;

  let yongshen: string, xishen: string, jishen: string;
  if (isStrong) {
    yongshen = WUXING_KE[dayWx];  // 官杀
    xishen = WUXING_SHENG[dayWx]; // 食伤泄
    jishen = dayWx;               // 忌比劫
  } else {
    yongshen = WUXING_SHENG[dayWx]; // 印星
    xishen = dayWx;                // 喜比劫
    jishen = WUXING_KE[dayWx];     // 忌官杀
  }

  // 9. 大运
  const yearYinyang = YIN_YANG[yearTg];
  const isYang = yearYinyang === "阳";
  const isMan = gender === 1;
  const forward = (isYang && isMan) || (!isYang && !isMan);

  const startAge = 3;

  const dayun: { 大运: string; 年龄: string }[] = [];
  for (let i = 0; i < 8; i++) {
    let yunTgIdx: number, yunDzIdx: number;
    if (forward) {
      yunTgIdx = (TG_IDX[monthTg] + i + 1) % 10;
      yunDzIdx = (DZ_IDX[monthDz] + i + 1) % 12;
    } else {
      yunTgIdx = ((TG_IDX[monthTg] - i - 1) % 10 + 10) % 10;
      yunDzIdx = ((DZ_IDX[monthDz] - i - 1) % 12 + 12) % 12;
    }
    const yunStart = startAge + i * 10;
    const yunEnd = yunStart + 9;
    dayun.push({
      "大运": `${TIANGAN[yunTgIdx]}${DIZHI[yunDzIdx]}`,
      "年龄": `${yunStart}-${yunEnd}岁`,
    });
  }

  // 10. 流年 (当前年份)
  const cy = new Date().getFullYear();
  const liunianTg = TIANGAN[((cy - 4) % 10 + 10) % 10];
  const liunianDz = DIZHI[((cy - 4) % 12 + 12) % 12];
  const liunian = `${liunianTg}${liunianDz}`;

  // 11. 交易解读
  let caiCount = 0;
  for (const [pos, [tg]] of Object.entries(baziRaw)) {
    if (["正财", "偏财"].includes(getShiShen(dayTg, tg))) caiCount += 1;
  }
  caiCount += allZhiCang.filter(g => ["正财", "偏财"].includes(getShiShen(dayTg, g))).length * 0.3;
  const hasCai = caiCount >= 1.5;

  let guanshaCount = 0;
  for (const [pos, [tg]] of Object.entries(baziRaw)) {
    if (["正官", "七杀"].includes(getShiShen(dayTg, tg))) guanshaCount += 1;
  }
  const hasGuansha = guanshaCount >= 1;

  let shishangCount = 0;
  for (const [pos, [tg]] of Object.entries(baziRaw)) {
    if (["食神", "伤官"].includes(getShiShen(dayTg, tg))) shishangCount += 1;
  }
  const hasShishang = shishangCount >= 1;

  let minggeLevel = "中等";
  if (hasCai && hasGuansha) minggeLevel = "上等（财官双美）";
  if (hasCai && hasShishang) minggeLevel = "上等（伤官生财）";
  if (!hasCai && !hasGuansha) minggeLevel = "下等（财官缺位）";

  return {
    "四柱": bazi,
    "日主": rizhu,
    "日主五行": dayWx,
    "日主阴阳": YIN_YANG[dayTg],
    "十神": shiShenResults,
    "五行旺衰": Object.fromEntries(sortedWx),
    "日主力量": isStrong ? "偏强" : "偏弱",
    "用神": yongshen,
    "喜神": xishen,
    "忌神": jishen,
    "是否身强": isStrong,
    "大运": dayun,
    "流年": liunian,
    "交易解读": {
      "命格": minggeLevel,
      "财星": `${hasCai ? '旺' : '弱'} (${caiCount.toFixed(1)})`,
      "官杀": `${hasGuansha ? '旺' : '弱'} (${guanshaCount.toFixed(0)})`,
      "食伤": `${hasShishang ? '旺' : '弱'} (${shishangCount.toFixed(0)})`,
    },
  };
}

/**
 * 格式化输出（纯文本，用于展示/分享）
 */
export function formatBazi(bazi: BaZiResult): string {
  const lines: string[] = [];
  lines.push("═".repeat(44));
  lines.push("  八字 · 大师版命盘");
  lines.push("═".repeat(44));
  lines.push("");

  lines.push("【八字四柱】");
  const cols = bazi["四柱"];
  lines.push(`  ${cols['年柱'].padStart(4)}  ${cols['月柱'].padStart(4)}  ${cols['日柱'].padStart(4)}  ${cols['时柱'].padStart(4)}`);
  lines.push("");

  lines.push(`【日主】${bazi['日主']}（${bazi['日主五行']}，${bazi['日主阴阳']}）`);
  lines.push(`  身${bazi['日主力量']}`);
  lines.push("");

  lines.push("【十神分布】");
  const posKeys = ["年干", "年支", "月干", "月支", "日干", "日支", "时干", "时支"];
  for (const pk of posKeys) {
    const info = bazi["十神"][pk];
    if (info) {
      if (Array.isArray(info[1])) {
        lines.push(`  ${pk}：${info[0]}[${(info[1] as string[]).join(", ")}]`);
      } else {
        lines.push(`  ${pk}：${info[0]}`);
      }
    }
  }
  lines.push("");

  lines.push("【五行旺衰】");
  for (const [wx, count] of Object.entries(bazi["五行旺衰"])) {
    const bar = "█".repeat(Math.round(count * 4)) + "░".repeat(20 - Math.round(count * 4));
    lines.push(`  ${wx}：${count.toFixed(1)} ${bar}`);
  }
  lines.push("");

  lines.push("【用神喜忌】");
  lines.push(`  日主${bazi['是否身强'] ? '偏强' : '偏弱'}，${bazi['是否身强'] ? '宜克泄耗' : '宜生扶'}`);
  lines.push(`  用神：${bazi['用神']}（最重要的五行）`);
  lines.push(`  喜神：${bazi['喜神']}`);
  lines.push(`  忌神：${bazi['忌神']}（避免过度操作）`);
  lines.push("");

  lines.push("【交易命格解读】");
  const td = bazi["交易解读"];
  lines.push(`  命格等级：${td['命格']}`);
  lines.push(`  财星：${td['财星']}（${td['财星'].includes('旺') ? '' : '需后天培养现金流能力'}）`);
  lines.push(`  官杀：${td['官杀']}（${td['官杀'].includes('旺') ? '纪律性强' : '风控需加强'}）`);
  lines.push(`  食伤：${td['食伤']}（${td['食伤'].includes('旺') ? '策略创新能力强' : '需加强策略研究'}）`);
  lines.push("");

  const wxForMarket: Record<string, string> = {
    "金": "贵金属/外汇/硬资产交易",
    "木": "成长股/科技股/新兴市场",
    "水": "加密货币/高流动性市场",
    "火": "高频交易/动量策略",
    "土": "价值投资/蓝筹股/房地产",
  };
  const sortedEntries = Object.entries(bazi["五行旺衰"]);
  const bestWx = sortedEntries[0][0];
  const worstWx = sortedEntries[sortedEntries.length - 1][0];
  lines.push(`  天然优势市场：${wxForMarket[bestWx] || '待分析'}`);
  lines.push(`  需要注意的市场：${wxForMarket[worstWx] || '待分析'}`);
  lines.push("");

  lines.push("【大运走势】");
  for (const dy of bazi["大运"].slice(0, 5)) {
    lines.push(`  ${dy['大运']}  ${dy['年龄']}`);
  }
  lines.push("  ...");
  lines.push("");

  lines.push(`【当前流年】${bazi['流年']}`);
  lines.push("");
  lines.push("═".repeat(44));

  return lines.join("\n");
}