/**
 * 六爻（文王金钱课）占卜引擎
 *
 * 摇卦：三枚铜钱六次（自下而上）。
 *   - 三正（3 正）= 老阳 ○ → 动爻，变阴
 *   - 三反（0 正）= 老阴 × → 动爻，变阳
 *   - 二正一反（2 正）= 少阳 —（静）
 *   - 一正二反（1 正）= 少阴 --（静）
 *
 * 装卦：本卦（上卦+下卦）→ 变卦（动爻变后所得卦）。
 * 世应：按京房八宫卦序定世爻应爻（纯卦世6应3…归魂世3应6）。
 * 六亲：以本卦所属宫之五行（我）与各爻五行生克定。
 * 六神：按起卦日干起：甲乙青龙、丙丁朱雀、戊勾陈、己腾蛇、庚辛白虎、壬癸玄武，自初爻顺排。
 */

// ---------- 单卦定义 ----------
export interface GuaInfo {
  trigram: string;
  symbol: string;
  element: string;
  nature: string;
}

const TRIGRAMS: Record<string, GuaInfo> = {
  乾: { trigram: "乾", symbol: "☰", element: "金", nature: "天 · 刚健" },
  兑: { trigram: "兑", symbol: "☱", element: "金", nature: "泽 · 喜悦" },
  离: { trigram: "离", symbol: "☲", element: "火", nature: "火 · 光明" },
  震: { trigram: "震", symbol: "☳", element: "木", nature: "雷 · 震动" },
  巽: { trigram: "巽", symbol: "☴", element: "木", nature: "风 · 入" },
  坎: { trigram: "坎", symbol: "☵", element: "水", nature: "水 · 险陷" },
  艮: { trigram: "艮", symbol: "☶", element: "土", nature: "山 · 静止" },
  坤: { trigram: "坤", symbol: "☷", element: "土", nature: "地 · 柔顺" },
};

const TRIGRAM_BITS: Record<string, [0 | 1, 0 | 1, 0 | 1]> = {
  乾: [1, 1, 1], 兑: [1, 1, 0], 离: [1, 0, 1], 震: [1, 0, 0],
  巽: [0, 1, 1], 坎: [0, 1, 0], 艮: [0, 0, 1], 坤: [0, 0, 0],
};

/** 六十四卦名：上卦名_下卦名 → 卦名 */
const HEX_NAMES: Record<string, string> = {
  "乾_乾": "乾为天", "乾_兑": "天泽履", "乾_离": "天火同人", "乾_震": "天雷无妄",
  "乾_巽": "天风姤", "乾_坎": "天水讼", "乾_艮": "天山遁", "乾_坤": "天地否",
  "兑_乾": "泽天夬", "兑_兑": "兑为泽", "兑_离": "泽火革", "兑_震": "泽雷随",
  "兑_巽": "泽风大过", "兑_坎": "泽水困", "兑_艮": "泽山咸", "兑_坤": "泽地萃",
  "离_乾": "火天大有", "离_兑": "火泽睽", "离_离": "离为火", "离_震": "火雷噬嗑",
  "离_巽": "火风鼎", "离_坎": "火水未济", "离_艮": "火山旅", "离_坤": "火地晋",
  "震_乾": "雷天大壮", "震_兑": "雷泽归妹", "震_离": "雷火丰", "震_震": "震为雷",
  "震_巽": "雷风恒", "震_坎": "雷水解", "震_艮": "雷山小过", "震_坤": "雷地豫",
  "巽_乾": "风天小畜", "巽_兑": "风泽中孚", "巽_离": "风火家人", "巽_震": "风雷益",
  "巽_巽": "巽为风", "巽_坎": "风水涣", "巽_艮": "风山渐", "巽_坤": "风地观",
  "坎_乾": "水天需", "坎_兑": "水泽节", "坎_离": "水火既济", "坎_震": "水雷屯",
  "坎_巽": "水风井", "坎_坎": "坎为水", "坎_艮": "水山蹇", "坎_坤": "水地比",
  "艮_乾": "山天大畜", "艮_兑": "山泽损", "艮_离": "山火贲", "艮_震": "山雷颐",
  "艮_巽": "山风蛊", "艮_坎": "山水蒙", "艮_艮": "艮为山", "艮_坤": "山地剥",
  "坤_乾": "地天泰", "坤_兑": "地泽临", "坤_离": "地火明夷", "坤_震": "地雷复",
  "坤_巽": "地风升", "坤_坎": "地水师", "坤_艮": "地山谦", "坤_坤": "坤为地",
};

const SHENG: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const KE: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

/** 宫五行 */
const GONG_ELEMENT: Record<string, string> = {
  乾: "金", 兑: "金", 离: "火", 震: "木", 巽: "木", 坎: "水", 艮: "土", 坤: "土",
};

// ---------- 摇卦 ----------
export interface Yao {
  index: number;
  value: 0 | 1;
  moving: boolean;
  type: string;
  counts: string;
}

/** 三枚铜钱摇一次，返回 0-3 个正面 */
export function tossOnce(): number {
  return (Math.random() < 0.5 ? 1 : 0) +
    (Math.random() < 0.5 ? 1 : 0) +
    (Math.random() < 0.5 ? 1 : 0);
}

/** 由正面数得爻 */
export function yaoFromCounts(yangCount: number, index: number): Yao {
  const moving = yangCount === 3 || yangCount === 0;
  const value: 0 | 1 = yangCount >= 2 ? 1 : 0;
  const type = yangCount === 3 ? "老阳" : yangCount === 0 ? "老阴" : yangCount === 2 ? "少阳" : "少阴";
  return { index, value, moving, type, counts: `${yangCount}正${3 - yangCount}反` };
}

/** 六爻 value（初爻至上爻），由下/上卦名 */
function yaoValues(lower: string, upper: string): (0 | 1)[] {
  const lb = TRIGRAM_BITS[lower];
  const ub = TRIGRAM_BITS[upper];
  return [lb[0], lb[1], lb[2], ub[0], ub[1], ub[2]];
}

/** 由六爻 value 反推下/上卦名 */
function guaFromValues(values: (0 | 1)[]): { lower: string; upper: string } {
  const find = (bits: [0 | 1, 0 | 1, 0 | 1]) =>
    (Object.entries(TRIGRAM_BITS) as [string, [0 | 1, 0 | 1, 0 | 1]][]).find(([, b]) =>
      b[0] === bits[0] && b[1] === bits[1] && b[2] === bits[2])![0];
  return { lower: find([values[0], values[1], values[2]]), upper: find([values[3], values[4], values[5]]) };
}

// ---------- 京房八宫卦序（世应） ----------
function buildBaGongTable(): Record<string, { gong: string; shi: number; ying: number; stage: string }> {
  const table: Record<string, { gong: string; shi: number; ying: number; stage: string }> = {};
  const STAGE: Record<string, [number, number, string]> = {
    "纯": [6, 3, "本宫纯卦"], "一世": [1, 4, "一世卦"], "二世": [2, 5, "二世卦"],
    "三世": [3, 6, "三世卦"], "四世": [4, 1, "四世卦"], "五世": [5, 2, "五世卦"],
    "游魂": [4, 1, "游魂卦"], "归魂": [3, 6, "归魂卦"],
  };

  const gongNames: [string, 0 | 1, 0 | 1, 0 | 1][] = [
    ["乾", 1, 1, 1], ["坎", 0, 1, 0], ["艮", 0, 0, 1], ["震", 1, 0, 0],
    ["巽", 0, 1, 1], ["离", 1, 0, 1], ["坤", 0, 0, 0], ["兑", 1, 1, 0],
  ];

  const setGua = (values: (0 | 1)[], stageName: string, gongName: string) => {
    const { lower, upper } = guaFromValues(values);
    const name = HEX_NAMES[`${upper}_${lower}`];
    const [shi, ying] = STAGE[stageName];
    table[name] = { gong: gongName, shi, ying, stage: stageName };
  };

  for (const [gongName, b0, b1, b2] of gongNames) {
    // 本宫纯卦
    const pure: (0 | 1)[] = [b0, b1, b2, b0, b1, b2];
    setGua(pure, "纯", gongName);

    // 一世~五世：从初爻逐爻变
    let cur = [...pure];
    const stageOf = (i: number) => i === 1 ? "一世" : i === 2 ? "二世" : i === 3 ? "三世" : i === 4 ? "四世" : "五世";
    for (let i = 1; i <= 5; i++) {
      cur = [...cur];
      cur[i - 1] = (cur[i - 1] === 1 ? 0 : 1) as 0 | 1;
      setGua(cur, stageOf(i), gongName);
    }

    // 游魂：变第 4 爻
    cur = [...cur];
    cur[3] = (cur[3] === 1 ? 0 : 1) as 0 | 1;
    setGua(cur, "游魂", gongName);

    // 归魂：内卦三爻变回本宫单卦
    cur = [...cur];
    cur[0] = b0 as 0 | 1; cur[1] = b1 as 0 | 1; cur[2] = b2 as 0 | 1;
    setGua(cur, "归魂", gongName);
  }
  return table;
}

const BA_GONG = buildBaGongTable();

// ---------- 六亲 / 六神 ----------
function liuqinOf(gongElement: string, yaoElement: string): string {
  if (yaoElement === gongElement) return "兄弟";
  if (SHENG[gongElement] === yaoElement) return "子孙";   // 我生者子孙
  if (SHENG[yaoElement] === gongElement) return "父母";   // 生我者父母
  if (KE[gongElement] === yaoElement) return "妻财";      // 我克者妻财
  if (KE[yaoElement] === gongElement) return "官鬼";      // 克我者官鬼
  return "兄弟";
}

const LIUSHEN_ORDER = ["青龙", "朱雀", "勾陈", "腾蛇", "白虎", "玄武"];

/** 六神：由日干定起始神，自初爻顺排 */
function liuShenOf(dayGan: string, yaoIndex: number): string {
  let startIdx: number;
  if (dayGan === "甲" || dayGan === "乙") startIdx = 0; // 青龙
  else if (dayGan === "丙" || dayGan === "丁") startIdx = 1; // 朱雀
  else if (dayGan === "戊") startIdx = 2; // 勾陈
  else if (dayGan === "己") startIdx = 3; // 腾蛇
  else if (dayGan === "庚" || dayGan === "辛") startIdx = 4; // 白虎
  else startIdx = 5; // 壬癸 → 玄武
  return LIUSHEN_ORDER[(startIdx + (yaoIndex - 1)) % 6];
}

function ZHI_ELEM(z: string): string {
  const m: Record<string, string> = {
    子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
    午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
  };
  return m[z];
}

/** 纳甲地支五行，每宫六爻（初→上） */
const NAIJIA_ELEMENTS: Record<string, string[]> = {
  乾: ["子", "寅", "辰", "午", "申", "戌"].map(ZHI_ELEM), // 金
  坎: ["寅", "辰", "午", "申", "戌", "子"].map(ZHI_ELEM), // 水
  艮: ["辰", "午", "申", "戌", "子", "寅"].map(ZHI_ELEM), // 土
  震: ["子", "寅", "辰", "午", "申", "戌"].map(ZHI_ELEM), // 木
  巽: ["丑", "亥", "酉", "未", "巳", "卯"].map(ZHI_ELEM), // 木
  离: ["卯", "丑", "亥", "酉", "未", "巳"].map(ZHI_ELEM), // 火
  坤: ["未", "巳", "卯", "丑", "亥", "酉"].map(ZHI_ELEM), // 土
  兑: ["巳", "卯", "丑", "亥", "酉", "未"].map(ZHI_ELEM), // 金
};

export const YAO_LINE = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

// ---------- 主入口 ----------
export interface LiuYaoResult {
  benGua: { upper: string; lower: string; name: string; symbol: string; element: string };
  bianGua?: { upper: string; lower: string; name: string; symbol: string };
  gong: string;
  shiYao: number;
  yingYao: number;
  stage: string;
  yaos: {
    index: number;
    value: 0 | 1;
    line: string;
    moving: boolean;
    type: string;
    counts: string;
    element: string;
    liuqin: string;
    liushen: string;
    isShi: boolean;
    isYing: boolean;
  }[];
  movingCount: number;
  hexText: string;
}

/**
 * 六爻起卦
 * @param counts 六次摇卦的正面数数组（长度6）
 * @param dayGan 起卦日干（用于六神）
 */
export function liuyaoDivination(counts: number[], dayGan: string = "甲"): LiuYaoResult {
  const yaos = counts.map((c, i) => yaoFromCounts(c, i + 1));
  const values = yaos.map(y => y.value);
  const { lower, upper } = guaFromValues(values);
  const benName = HEX_NAMES[`${upper}_${lower}`];
  const gongInfo = BA_GONG[benName] || { gong: lower, shi: 6, ying: 3, stage: "本宫纯卦" };

  // 变卦
  let bianGua: LiuYaoResult["bianGua"];
  const movingCount = yaos.filter(y => y.moving).length;
  if (movingCount > 0) {
    const mv = values.map((v, i) => (yaos[i].moving ? (v === 1 ? 0 : 1) : v));
    const bg = guaFromValues(mv);
    const bName = HEX_NAMES[`${bg.upper}_${bg.lower}`];
    bianGua = {
      upper: bg.upper, lower: bg.lower, name: bName,
      symbol: TRIGRAMS[bg.upper].symbol + TRIGRAMS[bg.lower].symbol,
    };
  }

  const gongYaoElem = NAIJIA_ELEMENTS[gongInfo.gong] || ["水", "木", "木", "土", "土", "金"];

  const outYaos = yaos.map((y, i) => {
    const yaoElement = gongYaoElem[i];
    return {
      index: y.index,
      value: y.value,
      line: y.moving ? (y.value === 1 ? "○" : "×") : y.value === 1 ? "—" : "--",
      moving: y.moving,
      type: y.type,
      counts: y.counts,
      element: yaoElement,
      liuqin: liuqinOf(GONG_ELEMENT[gongInfo.gong], yaoElement),
      liushen: liuShenOf(dayGan, y.index),
      isShi: y.index === gongInfo.shi,
      isYing: y.index === gongInfo.ying,
    };
  });

  return {
    benGua: {
      upper, lower, name: benName,
      symbol: TRIGRAMS[upper].symbol + TRIGRAMS[lower].symbol,
      element: GONG_ELEMENT[gongInfo.gong],
    },
    bianGua,
    gong: gongInfo.gong,
    shiYao: gongInfo.shi,
    yingYao: gongInfo.ying,
    stage: gongInfo.stage,
    yaos: outYaos,
    movingCount,
    hexText: yaos.map(y => y.value).join(""),
  };
}
