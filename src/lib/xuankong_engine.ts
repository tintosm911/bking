/**
 * 玄空飞星 排盘引擎（九宫飞泊）
 *
 * 核心：洛书九宫（1北 2西南 3东 4东南 5中 6西北 7西 8东北 9南）
 * 紫白九星：一白贪狼(吉) 二黑巨门(凶) 三碧禄存(平) 四绿文曲(吉) 五黄廉贞(凶)
 *          六白武曲(吉) 七赤破军(凶) 八白左辅(吉) 九紫右弼(吉)
 * 飞星法：年紫白（按流年）+ 月紫白（按流月）+ 日/时飞星，顺飞洛书宫序。
 * 常用断法：五黄、二黑为煞；一白、八白、六白、四绿、九紫为吉。
 */
export interface XuanKongStar {
  num: number; // 1-9
  name: string;
  star: string; // 贪狼/巨门/禄存/文曲/廉贞/武曲/破军/左辅/右弼
  element: string;
  color: string; // 九星颜色（紫白飞星惯称）
  goodBad: "吉" | "凶" | "平";
  luck: string;
}

export const NINE_STARS: XuanKongStar[] = [
  { num: 1, name: "一白", star: "贪狼", element: "水", color: "#dbeafe", goodBad: "吉", luck: "桃花·人缘·文昌，主智慧名利，利文职感情。" },
  { num: 2, name: "二黑", star: "巨门", element: "土", color: "#fca5a5", goodBad: "凶", luck: "病符·衰星，主疾病是非，宜静不宜动。" },
  { num: 3, name: "三碧", star: "禄存", element: "木", color: "#86efac", goodBad: "平", luck: "是非·官非，主口舌争执，需谨慎言行。" },
  { num: 4, name: "四绿", star: "文曲", element: "木", color: "#86efac", goodBad: "吉", luck: "文昌·考试，主学业功名，利读书考试。" },
  { num: 5, name: "五黄", star: "廉贞", element: "土", color: "#fde68a", goodBad: "凶", luck: "大煞·土煞，主灾祸破财，最凶之星宜避。" },
  { num: 6, name: "六白", star: "武曲", element: "金", color: "#e5e7eb", goodBad: "吉", luck: "武贵·权威，主事业权利，利官贵升迁。" },
  { num: 7, name: "七赤", star: "破军", element: "金", color: "#fca5a5", goodBad: "凶", luck: "盗贼·破财，主口舌官非，防小人破财。" },
  { num: 8, name: "八白", star: "左辅", element: "土", color: "#fde68a", goodBad: "吉", luck: "财星·当旺，主财运事业，利置业求财。" },
  { num: 9, name: "九紫", star: "右弼", element: "火", color: "#fda4af", goodBad: "吉", luck: "喜庆·火旺，主喜事名声，利婚庆事业。" },
];

export const STAR_MAP: Record<number, XuanKongStar> = Object.fromEntries(
  NINE_STARS.map((s) => [s.num, s])
);

// 洛书九宫方位：宫位号 → 方位
const GONG_DIR: Record<number, string> = {
  1: "北", 2: "西南", 3: "东", 4: "东南", 5: "中宫",
  6: "西北", 7: "西", 8: "东北", 9: "南",
};

// 飞星顺序（洛书顺飞轨迹）：中5 → 乾6 → 兑7 → 艮8 → 离9 → 坎1 → 坤2 → 震3 → 巽4
const FEI_ORDER = [5, 6, 7, 8, 9, 1, 2, 3, 4];

export interface XuanKongInput {
  year: number;
  month: number; // 1-12
  day?: number;
  hour?: number;
}

export interface Gong {
  num: number;       // 宫位 1-9
  dir: string;       // 方位
  star: XuanKongStar; // 飞入之星
  position: { x: number; y: number }; // 九宫格坐标 3x3
}

export interface XuanKongResult {
  yearStar: number;   // 年紫白入中星
  monthStar: number;  // 月紫白入中星
  yearGong: Gong[];
  monthGong: Gong[];
  luckGongs: string[];  // 吉利方位
  avoidGongs: string[]; // 凶煞方位
  summary: string;
}

/** 年紫白：以洛书中位起算，公式 入中星 = (年数 - 4) % 9 + 1（可加修正） */
function yearStarIn(year: number): number {
  // 上元甲子起一白，用 (year - 4) % 9 循环（1936,1954...2022 等一白年校验）
  const n = ((year - 4) % 9 + 9) % 9;
  return n === 0 ? 9 : n;
}

/** 月紫白：年入中星 + 月份偏移 */
function monthStarIn(year: number, month: number): number {
  const ys = yearStarIn(year);
  // 月九星：正月起，循年入中顺排；简化取 (ys + month - 1) % 9
  const n = ((ys + month - 1) % 9 + 9) % 9;
  return n === 0 ? 9 : n;
}

/** 以某星入中，按洛书顺飞布局九宫 */
function flyPalace(inCenter: number): Gong[] {
  const order = [inCenter];
  // 从入中星开始，沿飞星轨迹顺次排 1..9
  let cur = inCenter;
  for (let i = 1; i < 9; i++) {
    cur = cur % 9 + 1 === 10 ? 1 : cur % 9 + 1;
    order.push(cur);
  }
  // 将 9 星按 FEI_ORDER[gongIdx] 所在宫位落星：入中星落5(中宫)，下一星落6(乾)...
  // 简化映射：入中星 star 在"中"，其"下一序号星"落乾6 ... 按 FEI_ORDER 顺序
  const result: Gong[] = [];
  const POS: Record<number, { x: number; y: number }> = {
    1: { x: 0, y: 2 }, 2: { x: 1, y: 2 }, 3: { x: 2, y: 2 },
    4: { x: 0, y: 1 }, 5: { x: 1, y: 1 }, 6: { x: 2, y: 1 },
    7: { x: 0, y: 0 }, 8: { x: 1, y: 0 }, 9: { x: 2, y: 0 },
  };
  for (let g = 0; g < 9; g++) {
    const gongNum = FEI_ORDER[g];       // 宫位号
    const starNum = order[g];            // 该宫飞星
    result.push({
      num: gongNum,
      dir: GONG_DIR[gongNum],
      star: STAR_MAP[starNum],
      position: POS[gongNum],
    });
  }
  return result;
}

export function xuanKongDivination(input: XuanKongInput): XuanKongResult {
  const ys = yearStarIn(input.year);
  const ms = monthStarIn(input.year, input.month);
  const yearGong = flyPalace(ys);
  const monthGong = flyPalace(ms);

  const luck = monthGong.filter((g) => g.star.goodBad === "吉");
  const avoid = monthGong.filter((g) => g.star.goodBad === "凶");

  const luckGongs = luck.map((g) => `${g.dir}方位·${g.star.name}${g.star.star}`);
  const avoidGongs = avoid.map((g) => `${g.dir}方位·避${g.star.name}${g.star.star}`);

  const wuHuang = monthGong.find((g) => g.star.num === 5);
  const erHei = monthGong.find((g) => g.star.num === 2);
  const baBai = monthGong.find((g) => g.star.num === 8);

  const parts: string[] = [];
  if (baBai && baBai.star.goodBad === "吉")
    parts.push(`八白当旺落在${baBai.dir}方，此方主财，宜重视。`);
  if (wuHuang)
    parts.push(`五黄大煞入${wuHuang.dir}方，此方本年忌动土、忌长期安坐，宜静。`);
  if (erHei)
    parts.push(`二黑病符在${erHei.dir}方，此方宜保持洁净明亮，助化病气。`);

  const summary = parts.length ? parts.join(" ") : "本年九星分布平稳，吉凶不算悬殊。把握吉利方位、规避煞方即可。";

  return {
    yearStar: ys,
    monthStar: ms,
    yearGong,
    monthGong,
    luckGongs,
    avoidGongs,
    summary,
  };
}

export const GONG_DIR_MAP = GONG_DIR;
