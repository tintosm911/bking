/**
 * 梅花易数引擎
 *
 * 原理（邵雍《梅花易数》）：
 * 1. 起卦：上卦 = 数 & 8 余（1乾2兑3离4震5巽6坎7艮8坤0→8）；下卦同理；动爻 = 数 & 6 余（0→6）。
 * 2. 三卦：本卦（上+下）、互卦（本卦 2-3-4 爻为下、3-4-5 爻为上）、变卦（本卦动爻阴阳互变）。
 * 3. 体用：动爻所在卦为「用」（所问之事），另一卦为「体」（占者自身）。
 * 4. 断吉凶：体用之五行生克 → 吉/凶/平；辅以互卦、变卦信息。
 *
 * 复用 liuyao_engine 的八卦常量。数理起卦逻辑独立实现，不依赖摇卦。
 */

import { TRIGRAMS, TRIGRAM_BITS, HEX_NAMES } from "./liuyao_engine";

export const TRIGRAM_ORDER = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];

/** 数字 → 卦（1-8，0=8归坤） */
function numToTrigram(n: number): string {
  const r = ((n - 1) % 8 + 8) % 8; // 0..7
  return TRIGRAM_ORDER[r];
}

/** 数字 → 动爻位（1-6，0=6） */
function numToMoving(index: number): number {
  const r = ((index - 1) % 6 + 6) % 6; // 0..5
  return r === 0 ? 6 : 6 - r; // 爻位：下起为初爻(6-5=1)…上爻(6-0=6)
}

/** 由上/下卦名 + 动爻位，构建六爻 value 数组（下起）并支持互变 */
function guaHexagram(upper: string, lower: string, moving: number): {
  values: (0 | 1)[];
  upper: string; lower: string;
} {
  const ub = TRIGRAM_BITS[upper];
  const lb = TRIGRAM_BITS[lower];
  // 六爻 value：初爻(1)…六爻(6)；TRIGRAM_BITS 为自下而上的三爻，直接顺序填入
  // 下卦三爻(初二三)：lb[0]初、lb[1]二、lb[2]三；上卦三爻(四五六)：ub[0]四、ub[1]五、ub[2]六
  const values: (0 | 1)[] = [
    lb[0], lb[1], lb[2],
    ub[0], ub[1], ub[2],
  ];
  return { values, upper, lower };
}

/**
 * 梅花占卜主入口
 * @param upperNum 上卦数（时间起卦用年月日时和）
 * @param lowerNum 下卦数
 * @param moveNum  动爻数
 */
export function meihuaDivination(upperNum: number, lowerNum: number, moveNum: number) {
  const upperName = numToTrigram(upperNum);
  const lowerName = numToTrigram(lowerNum);
  const moving = numToMoving(moveNum);

  const movingIndex = moving; // 1-6
  // 动爻所在卦：动爻<4 → 下卦为用；否则上卦为用
  const movingInLower = movingIndex <= 3;
  const yongName = movingInLower ? lowerName : upperName;
  const tiName = movingInLower ? upperName : lowerName;

  // 本卦名
  const benName = HEX_NAMES[`${upperName}_${lowerName}`];

  // 互卦：本卦 2-3-4爻为下、3-4-5爻为上
  const hub = guaHexagram(upperName, lowerName, moving);
  const huLowerName = findTrigramByBits([hub.values[1], hub.values[2], hub.values[3]]);
  const huUpperName = findTrigramByBits([hub.values[2], hub.values[3], hub.values[4]]);
  const huName = HEX_NAMES[`${huUpperName}_${huLowerName}`] || `${huUpperName}${huLowerName}`;

  // 变卦：动爻阴阳互变
  const bvhub = guaHexagram(upperName, lowerName, moving);
  const newValues = bvhub.values.map((v, i) => (i === movingIndex - 1 ? (v === 0 ? 1 : 0) : v));
  // 由变卦六爻反推上下卦
  const bianLower = findTrigramByBits([newValues[0], newValues[1], newValues[2]]);
  const bianUpper = findTrigramByBits([newValues[3], newValues[4], newValues[5]]);
  const bianName = HEX_NAMES[`${bianUpper}_${bianLower}`] || `${bianUpper}${bianLower}`;

  // 体用五行
  const tiWx = TRIGRAMS[tiName].element;
  const yongWx = TRIGRAMS[yongName].element;

  // 生克断
  const SHENG: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  const KE: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

  let relation: string, good: "吉" | "凶" | "平", score: number, verdict: string;
  if (tiWx === yongWx) {
    relation = "比和";
    good = "吉"; score = 75;
    verdict = "体用比和，同气连枝，主事情顺遂、人心相助，诸事易成，虽有小阻亦无碍。";
  } else if (SHENG[yongWx] === tiWx) {
    // 用生体
    relation = "用生体";
    good = "吉"; score = 90;
    verdict = "用卦生体卦，所谓「得助者昌」，主外事来助、所问之事有望得利，大吉之象。";
  } else if (SHENG[tiWx] === yongWx) {
    // 体生用
    relation = "体生用";
    good = "凶"; score = 20;
    verdict = "体卦生用卦，主己方耗损以成事，事虽可为却需付出的代价不小，谓「泄气」，宜量力而行。";
  } else if (KE[tiWx] === yongWx) {
    // 体克用
    relation = "体克用";
    good = "平"; score = 55;
    verdict = "体卦克用卦，主己方主动、能制所问之事，然克者费力，事可成而过程较辛劳。";
  } else {
    // 用克体
    relation = "用克体";
    good = "凶"; score = 15;
    verdict = "用卦克体卦，主所问之事克耗己身，障碍较大，事难成且防损，宜谨慎避让、静待时机。";
  }

  // 五行生克判断体用吉凶
  return {
    moving,
    upperName, lowerName, upperWx: TRIGRAMS[upperName].element, lowerWx: TRIGRAMS[lowerName].element,
    benName,
    huName,
    bianName,
    tiName, yongName, tiWx, yongWx,
    relation, good, score, verdict,
    upperNature: TRIGRAMS[upperName].nature,
    lowerNature: TRIGRAMS[lowerName].nature,
  };
}

function findTrigramByBits(bits: (0 | 1)[]): string {
  // TRIGRAM_BITS 与传入片段均为自下而上的三爻顺序，直接匹配
  return (
    (Object.entries(TRIGRAM_BITS) as [string, [0 | 1, 0 | 1, 0 | 1]][]).find(([, b]) =>
      b[0] === bits[0] && b[1] === bits[1] && b[2] === bits[2]
    )?.[0] || "坤"
  );
}
