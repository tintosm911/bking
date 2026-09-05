/**
 * 小六壬（六宫掌诀）占卜引擎
 *
 * 六宫：大安、留连、速喜、赤口、小吉、空亡
 * 起课：从大安起正月，数至所求月份 → 以该宫从初一数至所求日 → 以该宫从子时数至所求时辰。
 * 支持两种玩法：① 指定月/日/时；② 直接给三个数（随心取数）。
 */

export interface LiurenPalace {
  index: number; // 0-5
  name: string;
  emoji: string;
  position: "东南" | "东北" | "南" | "西" | "西南" | "北";
  element: string;
  body: string; // 身宫
  general: string; // 主断
  goodBad: "吉" | "凶" | "先吉后凶" | "半吉半凶";
  color: string; // 五行颜色用于渲染
}

export const PALACES: LiurenPalace[] = [
  {
    index: 0, name: "大安", emoji: "🟢", position: "东北", element: "木", body: "身不动时",
    general: "身不动时，属木青龙，主谋事一、五、七。断曰：事主安宁，失物南方，行人立便至，求财往南方，行人未归时有消息，凡事皆宜静处。诸事可求，谋事有成，不宜妄动。",
    goodBad: "吉", color: "#22c55e",
  },
  {
    index: 1, name: "留连", emoji: "🔶", position: "东北", element: "水", body: "卒未归时",
    general: "卒未归时，属水玄武（玄武主拖延），主谋事二、八、十。断曰：诸事难成，去者未回程，失物南方见，急讨方称心，更须防口舌，人事且平平。凡事宜缓，不宜急进。",
    goodBad: "半吉半凶", color: "#f59e0b",
  },
  {
    index: 2, name: "速喜", emoji: "🔴", position: "南", element: "火", body: "人即至时",
    general: "人即至时，属火朱雀，主谋事三、六、九。断曰：喜事来临，行人立便至，失物便见，谋望皆称心，出行皆顺利，交易财即至。凡事宜速，宜主动为之。",
    goodBad: "吉", color: "#ef4444",
  },
  {
    index: 3, name: "赤口", emoji: "⚫", position: "西", element: "金", body: "官事凶时",
    general: "官事凶时，属金白虎，主谋事四、七、十。断曰：口舌是非，失物急去寻，行人有惊恐，官事主防侵，求财费力，谨防破财。凡事忌刚强，宜忍耐退让。",
    goodBad: "凶", color: "#6b7280",
  },
  {
    index: 4, name: "小吉", emoji: "🔵", position: "西南", element: "木", body: "人来喜时",
    general: "人来喜时，属木六合，主谋事一、五、七。断曰：凡事和合，行人立便至，失物便得见，求财十分利，婚姻有喜，一切皆称心。凡事宜和顺，谦和成大。",
    goodBad: "吉", color: "#3b82f6",
  },
  {
    index: 5, name: "空亡", emoji: "⚪", position: "西南", element: "土", body: "音信稀时",
    general: "音信稀时，属土勾陈，主谋事三、六、九。断曰：事不长久，行人有灾殃，失物寻不见，官事有刑伤，病人逢暗鬼，宜防小人。凡事不宜,谋事不成,动静皆宜守。",
    goodBad: "凶", color: "#9ca3af",
  },
];

/** 取某数落宫（1 起于 index=0） */
function palaceForCount(count: number): LiurenPalace {
  const mod = ((count - 1) % 6 + 6) % 6;
  return PALACES[mod];
}

/**
 * 小六壬起课
 * @param p 第一个数（月/第一个随机数）
 * @param d 第二个数（日/第二个随机数）
 * @param t 第三个数（时辰/第三个随机数）
 */
export function liurenDivination(p: number, d: number, t: number) {
  // 归一为正整数
  const clean = (n: number) => (Math.abs(Math.round(n)) % 6 === 0 ? 6 : (Math.abs(Math.round(n)) % 6 + 6) % 6 || 6);
  const a = clean(p);
  const b = clean(d);
  const c = clean(t);

  const monthPalace = palaceForCount(a);
  const dayPalace = palaceForCount(monthPalace.index + 1 + b - 1);
  const finalPalace = palaceForCount(dayPalace.index + 1 + c - 1);

  return {
    input: { a, b, c },
    monthPalace,
    dayPalace,
    finalPalace,
  };
}

/** 按当前时刻起课（公历月/日/时辰） */
export function liurenNow(dt: Date = new Date()) {
  const month = dt.getMonth() + 1;
  const day = dt.getDate();
  const hour = dt.getHours();
  const shichen = Math.floor((hour + 1) / 2) % 12 || 12; // 子时=1...亥时=12
  const r = liurenDivination(month, day, shichen);
  return { ...r, shichen, month, day };
}

/** 时辰名称映射（用于展示输入的是哪个时辰） */
export const SHICHEN_NAMES: { key: number; name: string; range: string }[] = [
  { key: 1, name: "子时", range: "23:00–01:00" },
  { key: 2, name: "丑时", range: "01:00–03:00" },
  { key: 3, name: "寅时", range: "03:00–05:00" },
  { key: 4, name: "卯时", range: "05:00–07:00" },
  { key: 5, name: "辰时", range: "07:00–09:00" },
  { key: 6, name: "巳时", range: "09:00–11:00" },
  { key: 7, name: "午时", range: "11:00–13:00" },
  { key: 8, name: "未时", range: "13:00–15:00" },
  { key: 9, name: "申时", range: "15:00–17:00" },
  { key: 10, name: "酉时", range: "17:00–19:00" },
  { key: 11, name: "戌时", range: "19:00–21:00" },
  { key: 12, name: "亥时", range: "21:00–23:00" },
];
