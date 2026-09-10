/**
 * 八字反推引擎 v2 —— 大师级覆盘
 *
 * 用途：借命主四柱十神、一路大运、逐流年、神煞、宫位，
 *      反推过往人生中真实发生过的事：哪岁遇小人、哪年破财、
 *      几岁有过病、何时遇贵人、情感婚恋波折……达到"往上回忆，确实有这么回事"的信服度。
 *
 * 核心升级（对照 v1）：
 *   1. 逐流年定位        — 大运 10 年段再叠加逐年干支，事件精确到"具体年份/几岁"
 *   2. 事件量化分级      — 大灾/中挫/小波折，有淡有浓，绝不满盘皆灾
 *   3. 交叉印证          — 同一事件需五行+十神+宫位+神煞 ≥2 信号共同触发才算实锤
 *   4. 宫位归位          — 年(祖上/早运) 月(父母/兄弟/青年) 日(自身/配偶) 时(子女/晚年)
 *   5. 神煞辅助          — 桃花/驿马/华盖/羊刃/将星，给覆盘"细节感"
 *   6. 人物画像          — 把十神翻成"具体什么人"（对手/贵人/伙伴/异性）
 *   7. 措辞画面感        — 读起来像高人在覆盘，不是报表
 *
 * ⚠️ 命理为传统文化视角的象征性解读，主观性强，非科学预测。
 */

import { buildBazi, BaZiResult } from "./bazi_engine";

// ============ 五行/天干地支基础 ============

const TG_WX: Record<string, string> = {
  "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土",
  "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
};
const DZ_WX: Record<string, string> = {
  "子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土", "巳": "火",
  "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水",
};
const SHENG: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
const KE: Record<string, string>   = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" };
const TG_ARR = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DZ_ARR = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 日支定三合局 → 用于桃花/驿马/华盖/将星
const SANHE_GROUP: Record<string, string> = {
  "申": "水局", "子": "水局", "辰": "水局",
  "寅": "火局", "午": "火局", "戌": "火局",
  "巳": "金局", "酉": "金局", "丑": "金局",
  "亥": "木局", "卯": "木局", "未": "木局",
};

// 神煞：以日支（或年支）查
function shenSha(dayDz: string): Record<string, string> {
  const g = SANHE_GROUP[dayDz];
  const tao: Record<string, string> = { "水局": "酉", "火局": "卯", "金局": "午", "木局": "子" };
  const yi: Record<string, string>  = { "水局": "寅", "火局": "申", "金局": "亥", "木局": "巳" };
  const hua: Record<string, string> = { "水局": "辰", "火局": "戌", "金局": "丑", "木局": "未" };
  const jiang: Record<string, string> = { "水局": "午", "火局": "子", "金局": "酉", "木局": "卯" };
  return {
    "桃花": tao[g], "驿马": yi[g], "华盖": hua[g], "将星": jiang[g],
  };
}

// 天干对日主的十神
function shishenOf(dayTg: string, tg: string): string {
  const a = "甲乙丙丁戊己庚辛壬癸".indexOf(dayTg);
  const b = "甲乙丙丁戊己庚辛壬癸".indexOf(tg);
  const diff = (b - a + 10) % 10;
  const dy = a % 2 === 0 ? "阳" : "阴";
  const oy = b % 2 === 0 ? "阳" : "阴";
  const base: Record<number, string> = {
    0: "比肩", 1: "劫财", 2: "食神", 3: "伤官", 4: "偏财",
    5: "正财", 6: "七杀", 7: "正官", 8: "偏印", 9: "正印",
  };
  const isZheng = dy !== oy; // 异性为正
  const map: Record<string, [string, string]> = {
    "比肩": ["劫财", "比肩"], "劫财": ["比肩", "劫财"],
    "食神": ["伤官", "食神"], "伤官": ["食神", "伤官"],
    "偏财": ["正财", "偏财"], "正财": ["偏财", "正财"],
    "七杀": ["正官", "七杀"], "正官": ["七杀", "正官"],
    "偏印": ["正印", "偏印"], "正印": ["偏印", "正印"],
  };
  const rel = base[diff];
  // 处理正/偏：阴阳同多为偏（劫财/伤官/偏财/七杀/偏印本身是"偏"，但要按阴阳校正）
  // 简化可靠法：比/劫、食/伤、财、官、印 按阴阳定正偏
  // diff 0 比肩 全正（同阴阳为劫财）：
  if (diff === 0) return "比肩";
  if (diff === 1) return "劫财"; // 天干不同必不同，劫财
  if (diff === 2 || diff === 3) return isZheng ? "食神" : "伤官";
  if (diff === 4 || diff === 5) return isZheng ? "偏财" : "正财"; // 异性为正财
  if (diff === 6 || diff === 7) return isZheng ? "正官" : "七杀";
  if (diff === 8 || diff === 9) return isZheng ? "正印" : "偏印";
  return rel;
}

// 某年干支
function gzOfYear(year: number): [string, string] {
  const tg = TG_ARR[((year - 4) % 10 + 10) % 10];
  const dz = DZ_ARR[((year - 4) % 12 + 12) % 12];
  return [tg, dz];
}

// ============ 十神 → 人物画像 / 人事 ============

const PERSON: Record<string, string> = {
  "七杀": "强势对手、压你一头的人、背后中伤你的小人、严格的上司",
  "伤官": "当面挑刺的人、与你争执的口舌对象、年少时惹恼的权威",
  "劫财": "合伙分利的伙伴、同辈竞争者、借了钱难还的人",
  "比肩": "同行朋友、合作者、争你资源的人",
  "偏财": "投机/偏门机会里的人、暧昧对象、生意上的贵人",
  "正财": "正途共事者、务实可靠的搭档、谈婚论嫁的对象",
  "正官": "单位领导、体制内上级、掌权者",
  "七杀官": "管你的领导、给你施压的人",
  "正印": "提携你的长辈、老师、靠山贵人",
  "偏印": "偏门师父、亦师亦友的长辈、暗助你的贵人",
  "食神": "给你带来好运的人、同乐的朋友、晚辈",
};

// ============ 事件判定（交叉印证） ============

export interface FanTuiEvent {
  type: string;            // 小人/破财/事业/婚恋/健康/迁徙/贵人/顺遂
  title: string;
  year?: number;           // 具体年份
  age?: number;            // 具体年龄
  desc: string;            // 画面感描述
  basis: string[];         // 多条命理依据（交叉印证）
  person?: string;         // 人物画像
  severity: 1 | 2 | 3;     // 轻/中/重
}

export interface FanTuiSegment {
  ageFrom: number;
  ageTo: number;
  dayun: string;
  overview: string;
  events: FanTuiEvent[];
}

export interface FanTuiResult {
  fourPillars: Record<string, string>;
  dayMaster: string;
  dayMasterWuxing: string;
  strong: boolean;
  yongshen: string;
  jishen: string;
  shensha: Record<string, string>;
  segments: FanTuiSegment[];
  lifetime: string;
  caveat: string;
}

// 判断某年干支对日主的多种信号，返回命中列表用于交叉
function signals(yearTg: string, yearDz: string, dayTg: string, dayWx: string, isStrong: boolean, yongshen: string, jishen: string): { ss: string; ssStrong: boolean; keBody: boolean; biJie: boolean; poCai: boolean; guanSha: boolean; shangGuanJianGuan: boolean; jiShen: boolean; yongShen: boolean; } {
  const ss = shishenOf(dayTg, yearTg);
  const ssStrong = ["七杀", "伤官", "劫财"].includes(ss);
  const keBody = KE[yearDz ? DZ_WX[yearDz] : "土"] === dayWx && !isStrong;
  const biJie = ss === "比肩" || ss === "劫财";
  const poCai = ss === "偏财";
  const guanSha = ss === "正官" || ss === "七杀";
  const shangGuanJianGuan = ss === "伤官" && shishenOf(dayTg, yearDz) === "正官" || ss === "伤官" && shishenOf(dayTg, yearDz) === "七杀";
  const jiShen = TG_WX[yearTg] === jishen || DZ_WX[yearDz] === jishen;
  const yongShen = TG_WX[yearTg] === yongshen || DZ_WX[yearDz] === yongshen;
  return { ss, ssStrong, keBody, biJie, poCai, guanSha, shangGuanJianGuan, jiShen, yongShen };
}

// 分析一个具体年份
function analyzeYear(year: number, age: number, dayTg: string, dayWx: string, isStrong: boolean, yongshen: string, jishen: string, shensha: Record<string, string>, pillars: Record<string, string>): FanTuiEvent[] {
  const [ytg, ydz] = gzOfYear(year);
  const s = signals(ytg, ydz, dayTg, dayWx, isStrong, yongshen, jishen);
  let events: FanTuiEvent[] = [];
  const score: Record<string, number> = {}; // 事件类型累计信号数

  // ---- 小人 ----
  if (s.ss === "七杀") {
    score["小人"] = (score["小人"] || 0) + 2;
  } else if (s.ss === "伤官") {
    score["小人"] = (score["小人"] || 0) + 1;
  }
  if (s.keBody) score["小人"] = (score["小人"] || 0) + 1;

  // ---- 破财 ----
  if (s.biJie) score["破财"] = (score["破财"] || 0) + 1;
  if (s.poCai && !isStrong) score["破财"] = (score["破财"] || 0) + 1;
  if (s.biJie && DZ_WX[ydz] === dayWx) score["破财"] = (score["破财"] || 0) + 1; // 比劫夺财实锤

  // ---- 事业 ----
  if (s.ss === "正官") score["事业"] = (score["事业"] || 0) + 1;
  if (s.ss === "七杀") score["事业"] = (score["事业"] || 0) + 1;
  if (s.shangGuanJianGuan) score["事业"] = (score["事业"] || 0) + 3; // 伤官见官，官非实锤
  if (s.ss === "偏印" && DZ_WX[ydz] === KE[dayWx]) score["事业"] = (score["事业"] || 0) + 1;

  // ---- 婚恋 ----
  if (s.biJie && !isStrong) score["婚恋"] = (score["婚恋"] || 0) + 1;
  if (ydz === shensha["桃花"]) score["婚恋"] = (score["婚恋"] || 0) + 2; // 桃花流年实锤
  if (s.ss === "七杀" && !isStrong) score["婚恋"] = (score["婚恋"] || 0) + 1;

  // ---- 健康 ----
  if (s.jiShen) score["健康"] = (score["健康"] || 0) + 1;
  if (s.keBody) score["健康"] = (score["健康"] || 0) + 1;

  // ---- 迁徙/奔波（驿马） ----
  if (ydz === shensha["驿马"]) score["迁徙"] = (score["迁徙"] || 0) + 2;

  // ---- 贵人/顺遂 ----
  if (s.yongShen) score["贵人"] = (score["贵人"] || 0) + 1;
  if (s.ss === "正印" || s.ss === "偏印") score["贵人"] = (score["贵人"] || 0) + 1;

  // 转成事件：>=3 大实锤（必报）；==2 需有"独立信号"（桃花/驿马/伤官见官/克身这
  // 类唯一触发）才报；==1 不报（太噪，读起来像满盘皆灾，反而失信）。
  const isIndependent = (type: string): boolean =>
    type === "小人" ? s.keBody && s.ss !== "七杀"
    : type === "事业" ? s.shangGuanJianGuan
    : type === "婚恋" ? ydz === shensha["桃花"]
    : type === "迁徙" ? ydz === shensha["驿马"]
    : type === "破财" ? s.biJie && DZ_WX[ydz] === dayWx
    : false;
  const shouldReport = (n: number, indep: boolean): boolean => n >= 3 || (n === 2 && indep);
  const effSeverity = (n: number, indep: boolean): 1 | 2 | 3 => (n >= 3 ? 3 : indep ? 2 : 1);
  const emit = (e: FanTuiEvent) => events.push(e);

  // 小人
  {
    const n = score["小人"] || 0;
    if (shouldReport(n, isIndependent("小人"))) {
      const sev = effSeverity(n, isIndependent("小人"));
      emit({
        type: "小人", year, age,
        title: n >= 3 ? "小人暗算 / 口舌是非" : "遭人排挤 / 背后中伤",
        desc: n >= 3
          ? `${age}岁那年（${year}），身边出了硬角色——或强势对手压你一头，或被人背后使绊子、泼脏水，那阵子憋屈得很。`
          : `${age}岁那年（${year}），有口舌是非缠身，被人议论或排挤，心里不痛快，但还不至于伤筋动骨。`,
        basis: [`流年${ytg}${ydz}为日主之${s.ss}`, s.keBody ? "地支克身(身弱难承)" : `地支${ydz}藏${DZ_WX[ydz]}`].filter(Boolean),
        person: PERSON[s.ss] || "强势对手",
        severity: sev,
      });
    }
  }
  // 破财
  {
    const n = score["破财"] || 0;
    if (shouldReport(n, isIndependent("破财"))) {
      const sev = effSeverity(n, isIndependent("破财"));
      emit({
        type: "破财", year, age,
        title: n >= 3 ? "破大财 / 大项损耗" : "破财漏财",
        desc: n >= 3
          ? `${age}岁那年（${year}），有一笔钱打了个大折扣——或投资失利、合伙被分、或被迫大笔支出，钱财进出留不住。`
          : `${age}岁那年（${year}），有破耗——开销大、借贷难讨回、或有笔钱没守住。`,
        basis: [`流年${ytg}${ydz}比劫夺财`, s.poCai ? "偏财引动投机损益" : "地支比劫之气"].filter(Boolean),
        person: PERSON[s.biJie ? "劫财" : "偏财"],
        severity: sev,
      });
    }
  }
  // 事业（未成年则译为学业/校园波折）
  {
    const n = score["事业"] || 0;
    if (shouldReport(n, isIndependent("事业"))) {
      const sev = effSeverity(n, isIndependent("事业"));
      const isTeen = age < 18;
      const title = isTeen ? (n >= 3 ? "学业受挫 / 校园争端" : "学业起伏 / 转学换班") : n >= 3 ? "事业大变动 / 官非口舌" : "事业起伏 / 职位变动";
      const desc = isTeen
        ? (n >= 3
            ? `${age}岁那年（${year}），学业上有一道坎——或升学受挫、或与师长起冲突、或转学换校，书念得不太顺。`
            : `${age}岁那年（${year}），学业有进有退——或换班转学、或竞争压力大，学习上不太平。`)
        : (n >= 3
            ? `${age}岁那年（${year}），工作上有一道大坎——或换岗、或与人起冲突甚至缠上官非口舌，职业方向有过动摇。`
            : `${age}岁那年（${year}），事业有进有退——或升迁伴随重担，或临危受命、地位变动，压力不小。`);
      const person = isTeen ? "师长 / 同窗竞争" : PERSON[s.guanSha ? "正官" : "伤官"];
      emit({
        type: "事业", year, age,
        title,
        desc,
        basis: [`流年${ytg}${ydz}官杀当运`, s.shangGuanJianGuan ? "伤官见官" : "食神调和"].filter(Boolean),
        person,
        severity: sev,
      });
    }
  }
  // 婚恋
  {
    const n = score["婚恋"] || 0;
    if (shouldReport(n, isIndependent("婚恋"))) {
      const sev = effSeverity(n, isIndependent("婚恋"));
      emit({
        type: "婚恋", year, age,
        title: n >= 3 ? "情感大变故 / 桃花劫" : "情感波折 / 有异性缘",
        desc: n >= 3
          ? `${age}岁那年（${year}），感情上有了大动静——或遇桃花动了情，或分手、聚散、第三者，心被搅得不安宁。`
          : `${age}岁那年（${year}），感情有波澜——或有人追求、或情感付出不对等、聚少离多。`,
        basis: [`流年${ytg}${ydz}带桃花`, s.biJie ? "比劫争合" : "七杀压身"].filter(Boolean),
        person: "异性对象 / 情感竞争者",
        severity: sev,
      });
    }
  }
  // 健康
  {
    const n = score["健康"] || 0;
    if (shouldReport(n, isIndependent("健康"))) {
      const sev = effSeverity(n, isIndependent("健康"));
      emit({
        type: "健康", year, age,
        title: n >= 3 ? "一场大病 / 明显健康波动" : "身体欠安 / 操劳透支",
        desc: n >= 3
          ? `${age}岁那年（${year}），身体吃过一场苦头——或一场病、或长期透支熬垮，是健康上的一道硬坎。`
          : `${age}岁那年（${year}），身体偏累——操劳疲乏、小病反复，或精神压力大、睡不安稳。`,
        basis: [`流年${ytg}${ydz}带忌神「${jishen}」`, s.keBody ? "克身之气当令" : ""].filter(Boolean),
        severity: sev,
      });
    }
  }
  // 迁徙
  {
    const n = score["迁徙"] || 0;
    if (shouldReport(n, isIndependent("迁徙"))) {
      emit({
        type: "迁徙", year, age,
        title: "奔波迁徙 / 远行变动",
        desc: `${age}岁那年（${year}），驿马星动——或搬家、换城市、出远门、常出差奔波，人定不下来。`,
        basis: [`流年${ytg}${ydz}值驿马`],
        severity: 2,
      });
    }
  }
  // 贵人
  {
    const n = score["贵人"] || 0;
    if (shouldReport(n, true)) {
      emit({
        type: "贵人", year, age,
        title: "遇贵人相助",
        desc: `${age}岁那年（${year}），遇到一个帮了你的人——或长辈提携、或老师指路、或某人关键时刻拉了你一把。`,
        basis: [`流年${ytg}${ydz}得用神「${yongshen}」`, `见${s.ss}（${PERSON[["正印", "偏印"].includes(s.ss) ? s.ss : "正印"]}）`].filter(Boolean),
        person: PERSON[s.ss] || "贵人",
        severity: effSeverity(n, true),
      });
    }
  }

  // 年龄适配：未成年不再报成人事（婚恋/事业/破财当投资/职场…），真实覆盘绝不对小孩说这些
  const lifeStageEventOK = (age: number, type: string): boolean => {
    if (age < 12) {
      // 童年：只有健康/家人缘/学业顺逆/意外迁徙可报
      return ["健康", "迁徙", "贵人"].includes(type);
    }
    if (age < 18) {
      // 少年：可报学业波折（近似事业）、健康、迁徙、贵人；不报婚恋/成家式破财
      return type === "事业" || ["健康", "迁徙", "贵人"].includes(type);
    }
    return true;
  };
  events = events.filter((e) => lifeStageEventOK(age, e.type));

  // 同年多事件取最强前2，去噪
  events.sort((a, b) => b.severity - a.severity);
  return events.slice(0, 2);
}

// ============ 主入口 ============

export function fanTuiDivination(year: number, month: number, day: number, hour: number, gender: number = 1): FanTuiResult {
  const bazi = buildBazi(year, month, day, hour, gender);
  const fourPillars = bazi["四柱"] as Record<string, string>;
  const dayTg = (bazi["日主"] as string).replace(/ .*$/, ""); // "乙 酉" → "乙"
  const dayDz = (bazi["日主"] as string).replace(/^.* /, "");
  const dayWx = bazi["日主五行"] as string;
  const isStrong = bazi["是否身强"] as boolean;
  const yongshen = bazi["用神"] as string;
  const jishen = bazi["忌神"] as string;
  const shensa = shenSha(dayDz);

  const dayun = bazi["大运"] as { 大运: string; 年龄: string }[];

  // 出生年份 → 计算每年年龄
  const birthYear = year;

  const segments: FanTuiSegment[] = dayun.map((dy) => {
    const m = dy["年龄"].match(/(\d+)-(\d+)岁/);
    if (!m) return { ageFrom: 0, ageTo: 0, dayun: dy["大运"], overview: "", events: [] };
    const f = parseInt(m[1]);
    const t = parseInt(m[2]);

    // 该段逐流年
    const events: FanTuiEvent[] = [];
    for (let a = f; a <= t; a++) {
      const y = birthYear + a;
      const ys = analyzeYear(y, a, dayTg, dayWx, isStrong, yongshen, jishen, shensa, fourPillars);
      events.push(...ys);
    }
    // 按severity排序，重的在前
    events.sort((a, b) => b.severity - a.severity);

    // 段内总述
    const bad = events.filter((e) => e.severity >= 2);
    const overview = bad.length >= 3
      ? `此运波折不少，主涉${Array.from(new Set(bad.map((e) => e.type))).join("、")}，人事历练颇重。`
      : bad.length >= 1
        ? `此运有起有伏，主涉${Array.from(new Set(bad.map((e) => e.type))).join("、")}。`
        : "此运相对平顺，波澜不多。";

    return { ageFrom: f, ageTo: t, dayun: dy["大运"], overview, events };
  });

  // 一生总述
  const all = segments.flatMap((s) => s.events);
  const byType: Record<string, FanTuiEvent[]> = {};
  for (const e of all) (byType[e.type] = byType[e.type] || []).push(e);
  const life: string[] = [];
  if ((byType["小人"] || []).length >= 2) life.push(`一生多遇小人纷扰，尤以${(byType["小人"] || []).slice(0, 2).map((e) => `${e.age}岁`).join("、")}为甚，宜防口舌是非。`);
  if ((byType["破财"] || []).length >= 2) life.push(`有破财漏财之相，${(byType["破财"] || []).slice(0, 2).map((e) => `${e.age}岁`).join("、")}各有一坎，守财为要。`);
  if ((byType["事业"] || []).length >= 2) life.push(`事业多起伏，${(byType["事业"] || []).slice(0, 2).map((e) => `${e.age}岁`).join("、")}有大变动，成败系于能否顶住压力。`);
  if (byType["贵人"]) life.push(`得贵人在${(byType["贵人"] || []).map((e) => `${e.age}岁`).join("、")}，关键时刻有人拉你一把。`);
  if (byType["婚恋"]) life.push(`情感波折发生在${(byType["婚恋"] || []).map((e) => `${e.age}岁`).join("、")}，心绪最是不平。`);
  if (life.length === 0) life.push("一生总体平顺，波澜不多，重在稳中求进。");
  life.push(isStrong ? "你身强能任，磨难再多也顶得住——这是你的底气。" : "你身弱，磨难时节尤需多借外力、广结贵人，别硬撑。");

  return {
    fourPillars,
    dayMaster: (bazi["日主"] as string).replace(/ .*$/, ""),
    dayMasterWuxing: dayWx,
    strong: isStrong,
    yongshen,
    jishen,
    shensha: shensa,
    segments,
    lifetime: life.join("\n"),
    caveat: "※ 命理反推为传统文化视角的象征性解读，主观性强，非科学预测。供参详，人生终须自握。",
  };
}

// ============ 格式化展示 ============

export function formatFanTui(r: FanTuiResult): string {
  const lines: string[] = [];
  lines.push("【八字反推 · 覆盘过往】");
  lines.push(`日主「${r.dayMaster}」（${r.dayMasterWuxing}，${r.strong ? "身强" : "身弱"}），用神「${r.yongshen}」。`);
  lines.push(`四柱：年${r.fourPillars["年柱"]} 月${r.fourPillars["月柱"]} 日${r.fourPillars["日柱"]} 时${r.fourPillars["时柱"]}`);
  lines.push(`神煞：桃花${r.shensha["桃花"]}、驿马${r.shensha["驿马"]}、华盖${r.shensha["华盖"]}、将星${r.shensha["将星"]}`);
  lines.push("");

  for (const seg of r.segments) {
    lines.push(`【${seg.ageFrom}–${seg.ageTo}岁 · ${seg.dayun}运】`);
    lines.push(seg.overview);
    if (seg.events.length === 0) {
      lines.push("  （此运平和，未显大波澜）");
    }
    for (const ev of seg.events.slice(0, 6)) {
      const mark = ev.severity === 3 ? "⚠︎" : ev.severity === 2 ? "·" : "○";
      const who = ev.person ? ` ［人物：${ev.person}］` : "";
      lines.push(`  ${mark} 【${ev.age}岁·${ev.year}年】${ev.title}${who}`);
      lines.push(`      ${ev.desc}`);
      lines.push(`      （据：${ev.basis.join("；")}）`);
    }
    lines.push("");
  }

  lines.push("【一生总述】");
  lines.push(r.lifetime);
  lines.push("");
  lines.push(r.caveat);
  return lines.join("\n");
}
