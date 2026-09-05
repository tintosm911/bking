/**
 * 日干支工具：返回某公历日期的日干（天干），供六神起卦 / 其他场景复用。
 * 算法：儒略日标准公式，锚点 2000-01-01 = 戊午日。
 */
const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

function jd(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) -
    Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

/** 干支全字（如：壬午） */
export function dayGanzhiOf(y: number, m: number, d: number): string {
  const idx = (jd(y, m, d) + 49) % 60;
  return GAN[idx % 10] + GAN2ZHI(idx % 12);
}

/** 仅日干（天干） */
export function dayGanOf(y: number, m: number, d: number): string {
  const idx = (jd(y, m, d) + 49) % 60;
  return GAN[idx % 10];
}

const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
function GAN2ZHI(zhiIdx: number): string {
  return ZHI[zhiIdx];
}
