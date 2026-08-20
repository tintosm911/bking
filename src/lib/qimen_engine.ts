/**
 * 奇门遁甲 · 大师版排盘引擎 (TypeScript)
 * 时家转盘奇门 — 节气定局 / 九星八门八神 / 用神体系 / 格局分析 / 交易判断
 */

// ========= 基础常数 =========

const TIANGAN_Q = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DIZHI_Q   = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const SHICHEN_Q: [string, number, number][] = [
  ["子", 23, 1], ["丑", 1, 3], ["寅", 3, 5], ["卯", 5, 7],
  ["辰", 7, 9], ["巳", 9, 11], ["午", 11, 13], ["未", 13, 15],
  ["申", 15, 17], ["酉", 17, 19], ["戌", 19, 21], ["亥", 21, 23],
];

const TG_IDX_Q: Record<string, number> = {};
TIANGAN_Q.forEach((g, i) => { TG_IDX_Q[g] = i; });
const DZ_IDX_Q: Record<string, number> = {};
DIZHI_Q.forEach((z, i) => { DZ_IDX_Q[z] = i; });

// 九宫信息
const GONG_INFO_Q: Record<number, { gua: string; wuxing: string; fangwei: string }> = {
  0: { gua: "坎", wuxing: "水", fangwei: "北" },
  1: { gua: "坤", wuxing: "土", fangwei: "西南" },
  2: { gua: "震", wuxing: "木", fangwei: "东" },
  3: { gua: "巽", wuxing: "木", fangwei: "东南" },
  4: { gua: "中", wuxing: "土", fangwei: "中" },
  5: { gua: "乾", wuxing: "金", fangwei: "西北" },
  6: { gua: "兑", wuxing: "金", fangwei: "西" },
  7: { gua: "艮", wuxing: "土", fangwei: "东北" },
  8: { gua: "离", wuxing: "火", fangwei: "南" },
};

// 2026年节气数据 (名称, 月, 日, 时, 分)
const JIEQI_2026: [string, number, number, number, number][] = [
  ["小寒", 1, 5, 11, 24], ["大寒", 1, 20, 4, 30],
  ["立春", 2, 4, 10, 59], ["雨水", 2, 19, 6, 46],
  ["惊蛰", 3, 6, 5, 7],  ["春分", 3, 21, 5, 59],
  ["清明", 4, 5, 9, 47], ["谷雨", 4, 20, 16, 38],
  ["立夏", 5, 6, 2, 51], ["小满", 5, 21, 15, 56],
  ["芒种", 6, 6, 7, 7],  ["夏至", 6, 21, 23, 23],
  ["小暑", 7, 7, 16, 59],["大暑", 7, 23, 10, 19],
  ["立秋", 8, 7, 20, 40],["处暑", 8, 23, 11, 35],
  ["白露", 9, 7, 22, 55],["秋分", 9, 23, 8, 3],
  ["寒露", 10, 8, 14, 29],["霜降", 10, 23, 17, 20],
  ["立冬", 11, 7, 17, 8],["小雪", 11, 22, 14, 38],
  ["大雪", 12, 7, 9, 51],["冬至", 12, 22, 3, 49],
];

// 阳遁局数
const YANG_DUN: Record<string, number> = {
  "冬至": 7, "小寒": 8, "大寒": 8,
  "立春": 8, "雨水": 7, "惊蛰": 6,
  "春分": 3, "清明": 4, "谷雨": 3,
  "立夏": 4, "小满": 5, "芒种": 6,
};

// 阴遁局数
const YIN_DUN: Record<string, number> = {
  "夏至": 9, "小暑": 8, "大暑": 7,
  "立秋": 2, "处暑": 7, "白露": 9,
  "秋分": 7, "寒露": 6, "霜降": 5,
  "立冬": 3, "小雪": 2, "大雪": 1,
};

const SANQI_LIUYI = ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"];

// 八门原始宫位
const BA_MEN_Q = ["休", "生", "伤", "杜", "景", "死", "惊", "开"];
const BA_MEN_YUAN_GONG = [0, 7, 2, 3, 8, 1, 6, 5];

// 九星
const JIU_XING_Q = ["天蓬", "天芮", "天冲", "天辅", "天禽", "天心", "天柱", "天任", "天英"];
const JIU_XING_YUAN_GONG = [0, 1, 2, 3, 4, 5, 6, 7, 8];

// 八神
const BA_SHEN_Q = ["值符", "腾蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"];

// ========= 类型定义 =========

export interface QimenGong {
  gua: string;
  wuxing: string;
  fangwei: string;
  di: string;
  tian: string;
  ren: string;
  shen: string;
}

export interface QimenResult {
  timestamp: string;
  节气: string;
  阴阳: string;
  局数: number;
  日干支: string;
  日干: string;
  时干支: string;
  时干: string;
  时辰: string;
  旬首: string;
  值符: string;
  值符落宫: string;
  值使: string;
  值使落宫: string;
  用神: Record<string, { 宫位: string; 八门: string; 九星: string; 八神: string; 地盘干: string }>;
  格局: { 宫: string; 格: string; 吉凶: string }[];
  评分: number;
  方向: string;
  建议: string;
  细节: string[];
  九宫: Record<string, QimenGong>;
}

// ========= 工具函数 =========

function getShichenIndexQ(hour: number): number {
  for (let i = 0; i < SHICHEN_Q.length; i++) {
    const [, s, e] = SHICHEN_Q[i];
    if (s > e) {
      // 跨天（子时 23-1）
      if (hour >= 23 || hour < 1) return i;
    } else if (hour >= s && hour < e) {
      return i;
    }
  }
  return 0;
}

function getJieqiForDate(dt: Date): [string, number, number, number, number] {
  for (let i = 0; i < JIEQI_2026.length; i++) {
    const [name, m, d, h, min] = JIEQI_2026[i];
    const jqDt = new Date(dt.getFullYear(), m - 1, d, h, min);
    if (dt < jqDt) {
      if (i === 0) {
        const prev = JIEQI_2026[JIEQI_2026.length - 1];
        return [prev[0], prev[1], prev[2], prev[3], prev[4]];
      }
      const prev = JIEQI_2026[i - 1];
      return [prev[0], prev[1], prev[2], prev[3], prev[4]];
    }
  }
  const last = JIEQI_2026[JIEQI_2026.length - 1];
  return [last[0], last[1], last[2], last[3], last[4]];
}

function getJuNumberQ(jieqiName: string): [number, string] {
  if (YANG_DUN[jieqiName] !== undefined) return [YANG_DUN[jieqiName], "阳遁"];
  return [YIN_DUN[jieqiName] ?? 9, "阴遁"];
}

function isYangQ(jieqiName: string): boolean {
  return YANG_DUN[jieqiName] !== undefined;
}

function getGanzhiForDateQ(year: number, month: number, day: number): [string, string, number, number] {
  const base = new Date(2026, 0, 1);
  const target = new Date(year, month - 1, day);
  const delta = Math.round((target.getTime() - base.getTime()) / 86400000);
  const tgIdx = ((1 + delta) % 10 + 10) % 10;
  const dzIdx = ((3 + delta) % 12 + 12) % 12;
  return [TIANGAN_Q[tgIdx], DIZHI_Q[dzIdx], tgIdx, dzIdx];
}

function getShiGanzhiQ(dayTgIdx: number, shichenIdx: number): [string, string, number, number] {
  const WUSHU_MAP_Q: Record<number, number> = { 0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 0, 6: 2, 7: 4, 8: 6, 9: 8 };
  const baseTg = WUSHU_MAP_Q[((dayTgIdx % 10) + 10) % 10] ?? 0;
  const shiTgIdx = (baseTg + shichenIdx) % 10;
  const shiDzIdx = shichenIdx;
  return [TIANGAN_Q[shiTgIdx], DIZHI_Q[shiDzIdx], shiTgIdx, shiDzIdx];
}

// ========= 主排盘函数 =========

export function qimenMasterPan(dt?: Date): QimenResult {
  dt = dt ?? new Date();

  const year = dt.getFullYear();
  const month = dt.getMonth() + 1;
  const day = dt.getDate();
  const hour = dt.getHours();

  // 1. 节气与局
  const [jieqiName] = getJieqiForDate(dt);
  const yang = isYangQ(jieqiName);
  const [ju, directionText] = getJuNumberQ(jieqiName);

  // 2. 干支
  const [dayTg, dayDz, dayTgIdx, dayDzIdx] = getGanzhiForDateQ(year, month, day);
  const shichenIdx = getShichenIndexQ(hour);
  const [shiTg, shiDz, shiTgIdx, shiDzIdx] = getShiGanzhiQ(dayTgIdx, shichenIdx);
  const shichenName = SHICHEN_Q[shiDzIdx][0];

  // 3. 地盘三奇六仪
  const diPan: Record<number, string> = {};
  if (yang) {
    const start = ju - 1;
    for (let i = 0; i < SANQI_LIUYI.length; i++) {
      const gong = (start + i) % 9;
      diPan[gong] = SANQI_LIUYI[i];
    }
  } else {
    const start = ju - 1;
    for (let i = 0; i < SANQI_LIUYI.length; i++) {
      const gong = ((start - i) % 9 + 9) % 9;
      diPan[gong] = SANQI_LIUYI[i];
    }
  }

  // 4. 时干在地盘的宫位
  let shiganGong: number | null = null;
  for (const [g, gan] of Object.entries(diPan)) {
    if (gan === shiTg) {
      shiganGong = parseInt(g);
      break;
    }
  }
  if (shiganGong === null) shiganGong = 0;

  // 5. 值符值使
  const zhifu = JIU_XING_Q[shiganGong];
  const zhishi = yang
    ? BA_MEN_Q[shiganGong % 8]
    : BA_MEN_Q[((8 - shiganGong) % 8 + 8) % 8];

  // 6. 天盘九星
  const tianPan: Record<number, string> = {};
  tianPan[shiganGong] = zhifu;
  for (let i = 0; i < 9; i++) {
    if (i === shiganGong) continue;
    if (yang) {
      const offset = ((i - shiganGong) % 9 + 9) % 9;
      const srcGong = (JIU_XING_YUAN_GONG[shiganGong] + offset) % 9;
      tianPan[i] = JIU_XING_Q[srcGong];
    } else {
      const offset = ((shiganGong - i) % 9 + 9) % 9;
      const srcGong = ((JIU_XING_YUAN_GONG[shiganGong] - offset) % 9 + 9) % 9;
      tianPan[i] = JIU_XING_Q[srcGong];
    }
  }

  // 7. 人盘八门
  const renPan: Record<number, string> = {};
  const zhishiYuanGong = BA_MEN_YUAN_GONG[BA_MEN_Q.indexOf(zhishi)];
  const gong8 = [0, 1, 2, 3, 5, 6, 7, 8];

  for (const g of gong8) {
    if (yang) {
      const offset = ((g - zhishiYuanGong) % 8 + 8) % 8;
      const menIdx = (shiganGong + offset) % 8;
      renPan[g] = BA_MEN_Q[menIdx];
    } else {
      const offset = ((zhishiYuanGong - g) % 8 + 8) % 8;
      const menIdx = ((shiganGong - offset) % 8 + 8) % 8;
      renPan[g] = BA_MEN_Q[menIdx];
    }
  }

  // 8. 神盘八神
  const shenPan: Record<number, string> = {};
  const gong8Order = [0, 1, 2, 3, 5, 6, 7, 8];
  const shenOrder = yang ? BA_SHEN_Q : [...BA_SHEN_Q].reverse();

  let zfIdxIn8 = gong8Order.indexOf(shiganGong);
  if (zfIdxIn8 === -1) zfIdxIn8 = 0;

  for (let i = 0; i < gong8Order.length; i++) {
    const g = gong8Order[i];
    shenPan[g] = shenOrder[(zfIdxIn8 + i) % 8];
  }

  // 9. 组装九宫
  const gongData: Record<number, QimenGong> = {};
  for (let g = 0; g < 9; g++) {
    if (g === 4) {
      gongData[g] = {
        ...GONG_INFO_Q[g],
        di: diPan[g] ?? "",
        tian: tianPan[g] ?? "",
        ren: "死",
        shen: shenPan[4] ?? "值符",
      };
    } else {
      gongData[g] = {
        ...GONG_INFO_Q[g],
        di: diPan[g] ?? "",
        tian: tianPan[g] ?? "",
        ren: renPan[g] ?? "杜",
        shen: shenPan[g] ?? "值符",
      };
    }
  }

  // 10. 日干宫
  let riganGong: number | null = null;
  for (const [g, gan] of Object.entries(diPan)) {
    if (gan === dayTg) {
      riganGong = parseInt(g);
      break;
    }
  }
  if (riganGong === null) riganGong = 0;

  // 11. 格局判定
  const patterns: { 宫: string; 格: string; 吉凶: string }[] = [];
  for (let g = 0; g < 9; g++) {
    if (g === 4) continue;
    const gd = gongData[g];
    const d = gd.di;
    const t = gd.tian;
    const m = gd.ren;
    const s = gd.shen;

    if (d === "戊" && t.includes("丙")) {
      patterns.push({ 宫: gd.gua, 格: "龙回首（青龙返首）", 吉凶: "吉" });
    }
    if (d === "丙" && t.includes("戊")) {
      patterns.push({ 宫: gd.gua, 格: "飞鸟跌穴（丙+戊）", 吉凶: "吉" });
    }
    if (d === "丁" && t.includes("乙")) {
      patterns.push({ 宫: gd.gua, 格: "玉女守门", 吉凶: "吉" });
    }
    if (s === "白虎") {
      patterns.push({ 宫: gd.gua, 格: `白虎+${d}+${m}`, 吉凶: "凶" });
    }
    if (s === "玄武") {
      patterns.push({ 宫: gd.gua, 格: `玄武+${d}+${m}`, 吉凶: "凶（防假信号）" });
    }
    if (m === "死") {
      patterns.push({ 宫: gd.gua, 格: `死门+${d}`, 吉凶: "凶" });
    }
    if (m === "开" && (s === "值符" || s === "九天")) {
      patterns.push({ 宫: gd.gua, 格: `开门+${s}`, 吉凶: "大吉" });
    }
    if (m === "生" && s === "九天") {
      patterns.push({ 宫: gd.gua, 格: "生门+九天", 吉凶: "大吉（暴涨）" });
    }
    if (s === "九地" && (m === "死" || m === "惊")) {
      patterns.push({ 宫: gd.gua, 格: `九地+${m}`, 吉凶: "凶（阴跌）" });
    }
  }

  // 12. 交易综合判定
  const zhifuGongInfo = gongData[shiganGong];
  const zhifuMen = zhifuGongInfo.ren;
  const zhifuShen = zhifuGongInfo.shen;

  const MEN_SCORE: Record<string, number> = { "开": 80, "休": 60, "生": 90, "伤": 30, "杜": 40, "景": 50, "死": 5, "惊": 20 };
  const SHEN_MOD: Record<string, number> = { "值符": 15, "腾蛇": -15, "太阴": -5, "六合": 5, "白虎": -20, "玄武": -25, "九地": -10, "九天": 20 };
  const XING_MOD: Record<string, number> = { "天蓬": -10, "天芮": -5, "天冲": 10, "天辅": 5, "天禽": 0, "天心": 10, "天柱": -5, "天任": 0, "天英": 5 };

  let score = (MEN_SCORE[zhifuMen] ?? 40) + (SHEN_MOD[zhifuShen] ?? 0) + (XING_MOD[zhifu] ?? 0) + (yang ? 5 : -5);
  score = Math.max(0, Math.min(100, score));

  let tradeAdvice: string, direction: string;
  if (score >= 70) { tradeAdvice = "🟢 开仓信号强"; direction = "偏多"; }
  else if (score >= 50) { tradeAdvice = "🟡 谨慎参与，轻仓试单"; direction = score >= 55 ? "谨慎偏多" : "震荡偏空"; }
  else if (score >= 30) { tradeAdvice = "🟠 观望为宜，不宜重仓"; direction = "偏空"; }
  else { tradeAdvice = "🔴 不宜交易，休息等待"; direction = "大凶"; }

  const detailNotes: string[] = [];
  if (["死", "惊"].includes(zhifuMen)) detailNotes.push(`值使${zhifuMen}门，主凶，不宜冲动操作`);
  if (["白虎", "玄武"].includes(zhifuShen)) detailNotes.push(`${zhifuShen}临宫，注意假突破或暴跌风险`);
  if (zhifuShen === "九天") detailNotes.push("九天临宫，有大波动，注意加速行情");
  if (zhifuShen === "值符") detailNotes.push("值符临宫，趋势有支撑");
  if (zhifu === "天蓬") detailNotes.push("天蓬星主大波动，高风险高收益");
  if (["开", "生"].includes(zhifuMen) && ["值符", "九天", "六合"].includes(zhifuShen)) {
    detailNotes.push("吉门吉神相会，利于操作");
  }

  // 旬首
  const xunShouGan = "甲";
  const xunShouZhi = DIZHI_Q[((shiDzIdx - shiTgIdx) % 12 + 12) % 12];

  // ========= 输出 =========
  const gongNames_Q: Record<number, string> = {
    0: "坎", 1: "坤", 2: "震", 3: "巽", 4: "中", 5: "乾", 6: "兑", 7: "艮", 8: "离"
  };

  const result: QimenResult = {
    timestamp: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`,
    节气: jieqiName,
    阴阳: directionText,
    局数: ju,
    日干支: dayTg + dayDz,
    日干: dayTg,
    时干支: shiTg + shiDz,
    时干: shiTg,
    时辰: shichenName,
    旬首: `${xunShouGan}${xunShouZhi}`,
    值符: zhifu,
    值符落宫: gongNames_Q[shiganGong],
    值使: zhishi,
    值使落宫: gongNames_Q[shiganGong],
    用神: {
      "时干宫": { 宫位: gongNames_Q[shiganGong], 八门: zhifuMen, 九星: zhifu, 八神: zhifuShen, 地盘干: diPan[shiganGong] ?? "" },
      "日干宫": { 宫位: gongNames_Q[riganGong], 八门: gongData[riganGong].ren, 九星: gongData[riganGong].tian, 八神: gongData[riganGong].shen, 地盘干: gongData[riganGong].di },
      "值符宫": { 宫位: gongNames_Q[shiganGong], 八门: zhifuMen, 九星: zhifu, 八神: zhifuShen, 地盘干: diPan[shiganGong] ?? "" },
    },
    格局: patterns.slice(0, 5),
    评分: score,
    方向: direction,
    建议: tradeAdvice,
    细节: detailNotes,
    九宫: Object.fromEntries(
      Array.from({ length: 9 }, (_, g) => [gongNames_Q[g], gongData[g]])
    ),
  };

  return result;
}

/**
 * 大师版格式化输出
 */
export function formatQimenOutput(pan: QimenResult): string {
  const lines: string[] = [];
  lines.push("━".repeat(40));
  lines.push(`  奇门遁甲 · 大师版排盘`);
  lines.push(`  ${pan['timestamp']}`);
  lines.push("━".repeat(40));
  lines.push("");

  lines.push("【基本信息】");
  lines.push(`  节气：${pan['节气']}　${pan['阴阳']}${pan['局数']}局`);
  lines.push(`  日干支：${pan['日干支']}　时干支：${pan['时干支']}（${pan['时辰']}时）`);
  lines.push(`  旬首：${pan['旬首']}`);
  lines.push(`  值符：${pan['值符']}（落${pan['值符落宫']}宫）`);
  lines.push(`  值使：${pan['值使']}（落${pan['值使落宫']}宫）`);
  lines.push("");

  lines.push("【九宫详盘】");
  lines.push(`  ${'宫位'.padEnd(6)} ${'地盘'.padEnd(6)} ${'天盘'.padEnd(8)} ${'人盘'.padEnd(6)} ${'神盘'.padEnd(6)} ${'五行'.padEnd(4)} ${'方位'.padEnd(6)}`);
  lines.push(`  ${'-'.repeat(42)}`);
  for (const [gName, gd] of Object.entries(pan['九宫'])) {
    const ren = gName === "中" ? "─" : gd.ren;
    lines.push(`  ${gName.padEnd(6)} ${gd.di.padEnd(6)} ${gd.tian.padEnd(8)} ${ren.padEnd(6)} ${gd.shen.padEnd(6)} ${gd.wuxing.padEnd(4)} ${gd.fangwei.padEnd(6)}`);
  }
  lines.push("");

  lines.push("【用神分析 · 交易版】");
  for (const [key, info] of Object.entries(pan['用神'])) {
    lines.push(`  ${key}：${info['宫位']}宫`);
    lines.push(`    八门：${info['八门']}　九星：${info['九星']}　八神：${info['八神']}　地盘：${info['地盘干']}`);
  }
  lines.push("");

  if (pan['格局'].length > 0) {
    lines.push("【格局显现】");
    for (const p of pan['格局']) {
      const emoji = p['吉凶'].includes("吉") ? "🟢" : p['吉凶'] === "凶" ? "🔴" : "🟡";
      lines.push(`  ${emoji} ${p['宫']}宫：${p['格']}（${p['吉凶']}）`);
    }
    lines.push("");
  }

  lines.push("【交易综合判断】");
  lines.push(`  评分：${pan['评分']}/100　方向：${pan['方向']}`);
  lines.push(`  → ${pan['建议']}`);
  for (const note of pan['细节']) lines.push(`  · ${note}`);
  lines.push("");
  lines.push("━".repeat(40));

  return lines.join("\n");
}