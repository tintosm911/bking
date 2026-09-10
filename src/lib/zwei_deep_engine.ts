/**
 * 紫微斗数 · 大师级深度解读引擎
 * =====================================================
 * 在现有排盘（zwei_engine：星曜/四化/格局/大限数据）之上，
 * 增加「逐宫解读 / 三方四正 / 格局详批 / 四化入宫 / 大限批注 / 命盘总评」。
 *
 * 设计目标（对标八字反推的大师级信服度）：
 *   - 具体：讲清每宫这组合"意味着你怎样"，落到性格/事件
 *   - 画面感：读起来像老命师对着命盘细批，而非列数据
 *   - 留白：不句句全中，关键处给"提示"而非"断言"，防失真
 *   - 年龄适配：大限批注对未成年不说成人事（婚姻/破财），少年用学业措辞
 */

import { buildChart, ZweiResult } from "./zwei_engine";

// ==================== 星曜释义词典 ====================

/** 十四主星 · 核心性格画像 */
const STAR_MEANING: Record<string, string> = {
  紫微: "帝星，重威仪、有主见，天生领导气场，不甘居人下，行事有格局",
  天机: "智星，善谋虑、心思灵巧，脑子转得快，爱规划、好研究，然多思虑易反复",
  太阳: "官贵之星，光明磊落、热心大方，重名声与体面，男命主贵显",
  武曲: "财星，刚毅果决、执行力强，重实务、善理财，性格直爽略带硬",
  天同: "福星，温和随缘、与人为善，重享受安逸，人缘好但易懒散、欠冲劲",
  廉贞: "次桃花兼官禄，有才情、个性鲜明，重感情与名声，亦正亦邪、能文能武",
  天府: "库星，稳重内敛、善守成，重实质与积累，有包容力、顾家守业",
  太阴: "母星，细腻柔和、重家庭情感，心思绵密，女命尤主温柔贤惠",
  贪狼: "桃花星兼才艺，多才多艺、交际广，重欲望与享乐，善变求新",
  巨门: "口舌星，能说会道、心思缜密，善察言观色，然多思多想易惹口舌是非",
  天相: "印星，方正稳重、重规矩体面，为人和善讲道理，辅佐之才",
  天梁: "荫星，正直可靠、有担当，善解疑难、能担事，带长辈缘与贵人相",
  七杀: "将星，果敢决断、行动力强，能拼敢闯，性格刚烈、不喜受制",
  破军: "破耗之星，敢破敢立、不惧变动，有开创与变革之力，然大破大立、动静皆大",
};

/** 常用辅星 · 强化含义 */
const AUX_MEANING: Record<string, string> = {
  文昌: "主文书、才学，利读书考试与文墨，多一分书卷气",
  文曲: "主口才、才艺，利表达与技艺，多一分才情灵动",
  左辅: "助力之星，主得人助、贵人相扶，行事多顺",
  右弼: "助力之星，主得人助，尤利合作与辅佐之事",
  天魁: "主贵人、机遇，逢难有解，多得提携",
  天钺: "主贵人、异性之助，逢凶化吉",
  禄存: "主财禄、积蓄，财源稳定，然亦主保守",
  擎羊: "煞星，主冲突、急促，行事带锋芒，易招是非但对冲能激发行动",
  陀罗: "煞星，主拖延、纠缠，行事易反复，需耐性化解",
  火星: "煞星，主爆发、急燥，来得快去得快，带冲劲",
  铃星: "煞星，主暗耗、烦忧，扰人心绪，需自静",
  地空: "主空耗、理想，务实不足，然亦主灵感与超脱",
  地劫: "主劫耗、破失，钱财与人事偶有损耗，需守成",
  天马: "主奔忙、变动，利走动迁移，主在外发展",
};

/** 星曜五行属性（用于四化与生克辅助） */
const STAR_ELEMENT: Record<string, string> = {
  紫微: "土", 天机: "木", 太阳: "火", 武曲: "金", 天同: "水", 廉贞: "火",
  天府: "土", 太阴: "水", 贪狼: "木", 巨门: "水", 天相: "水", 天梁: "土",
  七杀: "金", 破军: "水",
  文昌: "金", 文曲: "水", 左辅: "土", 右弼: "水", 天魁: "火", 天钺: "火",
  禄存: "土", 擎羊: "金", 陀罗: "金", 火星: "火", 铃星: "火", 地空: "火", 地劫: "火", 天马: "火",
};

// ==================== 宫位主题 ====================

/** 十二宫 · 人生主题 */
const GONG_THEME: Record<string, string> = {
  命宫: "本命根器、性格根基与先天禀赋",
  兄弟宫: "兄弟手足、平辈助力，或同事伙伴之缘",
  夫妻宫: "姻缘配偶、感情模式与婚姻走向",
  子女宫: "子女之缘、后辈福分，及个人才华表现",
  财帛宫: "财源财库、谋财方式与理财倾向",
  疾厄宫: "健康体质、暗疾隐患与养生方向",
  迁移宫: "外出际遇、环境适应与外在机缘",
  交友宫: "人际往来、朋友助力与下属从属",
  官禄宫: "事业成就、职业路线与仕途官禄",
  田宅宫: "置业田产、家宅根基与储蓄积累",
  福德宫: "精神福分、内心世界与晚年心境",
  父母宫: "父母长辈、遗传根基与早年家风",
};

/** 三方四正：宫位联动（命/财/官 三合，迁移对照） */
const SANFANG_GROUPS: { name: string; gongs: string[] }[] = [
  { name: "命三方", gongs: ["命宫", "财帛宫", "官禄宫"] },
  { name: "迁移对照", gongs: ["迁移宫", "命宫"] },
];

// ==================== 格局详批 ====================

const PATTERN_DETAIL: Record<string, string> = {
  杀破狼格: "杀破狼三星主大破大立，人生多变动、多开创。此格之人不甘平淡，常有换轨、跳槽、离乡、转型之机，适合走开拓型路线。格局大开大合，年轻时多折腾，中年后若能把变动化为积累，遂成大器。行事宜顺势而为，莫逆势硬闯。",
  紫府同宫: "紫微天府双帝星会照，贵气与守成兼备。此格主格局高、根基稳，能掌大局亦善守成，多有人上人之机缘。然双帝同气，易显强势、不服人，人际上宜多一分柔和。",
  紫微朝垣: "紫微坐命为身，帝星当头，主有主见、得尊位，天生带领导之象，宜掌权管事。",
  机月同梁: "机月同梁为纯儒、为清贵，主文职、专业、管理之才，行事稳妥、多思少动，适合技术、专业、幕僚路线。不喜冒险，守正亦能得福。",
  府相朝垣: "天府天相夹命朝垣，主根基稳固、多得助力，贵人相扶，适合辅佐、主事与管理事务。",
  日月并明: "太阳太阴得地，阴阳调和、光明磊落，主名声与外发，利外出发展、得众望。",
  火贪格: "火星贪狼同宫会照，主爆发之才，暴起暴落、机遇与风险并见。把握得当可一飞冲天，宜戒急用忍、见好就收。",
  铃贪格: "铃星贪狼会照，主突发之财与横发之机，然亦主大起大落，须守正防破。",
  刑囚夹印: "擎羊（刑）与廉贞（囚）夹天相（印），主是非官讼之扰，须谨言慎行、守规避祸。",
  火铃夹命: "火星铃星夹命，主性格急燥、多劳多动，生活节奏快，宜学养性。",
};

// ==================== 四化入宫 ====================

const HUA_MEANING: Record<string, string> = {
  化禄: "主得财、得利，人事物顺遂，多资源与助力",
  化权: "主掌权、得势，升迁掌事，性格更显果决主动",
  化科: "主名声、文名，多得表扬与体面，也主化解缓和",
  化忌: "主缺失、烦忧，该宫之事多波折、需多加留意守成",
};

// ==================== 大限主题（落岁批注） ====================

/** 大限宫名 → 该十年的主题方向（留白化：提示而非断言） */
const DAXIAN_THEME: Record<string, string> = {
  命宫: "自我成长、重立根基之期",
  兄弟宫: "平辈伙伴互动密切，合作机会多",
  夫妻宫: "感情婚姻有变动之机，是成家或升温的关口",
  子女宫: "子嗣后辈之事，或才华表现、创作欲强",
  财帛宫: "财源有动，是积累财库的关键十年",
  疾厄宫: "健康需留意调养，作息宜有常",
  迁移宫: "外出、变动、发展机遇多，利远行与转型",
  交友宫: "人际扩展，朋友助力增多，宜经营人脉",
  官禄宫: "事业重心，是打拼晋升的主要阶段",
  田宅宫: "置业、搬家、家宅之事，利置产储蓄",
  福德宫: "精神福分渐成，重内心修养与享受",
  父母宫: "长辈家事牵连，或受家风助益",
};

/**
 * 判断命主是否未成年（用于大限批注年龄适配）
 */
function isMinor(ageStart: number, ageEnd: number): boolean {
  // 大限若整段在 18 岁以下，判为少年段
  return ageEnd < 18;
}

/** 少年期的大限措辞（不说婚姻/破财，译成学业/校园） */
const DAXIAN_THEME_MINOR: Record<string, string> = {
  夫妻宫: "感情之事还早，此期重心在学业与交友，先把书读好",
  财帛宫: "此期少谈钱财之业，重点在增长学识、打好基础",
  官禄宫: "此期是求学攻坚的阶段，学业是当下最大的事业",
  福德宫: "此期重在心态养成，多培养积极的心性",
  田宅宫: "此期以家庭学业为主，多与长辈亲近学习",
};

// ==================== 解读主函数 ====================

export interface ZweiDeepResult {
  星曜解读: Record<string, string>;
  三方四正: { t型: string; 主星: string[]; 解读: string }[];
  格局详批: string[];
  四化解读: Record<string, string[]>;
  大限批注: { 年龄段: string; 主题: string }[];
  总评: string[];
}

/** 单宫解读：主星画像 + 辅星强化 + 宫位主题，合成一句到两句 */
function interpretGong(gong: string, stars: string[]): string {
  if (!stars || stars.length === 0) return `${GONG_THEME[gong] || "该宫"}，此宫空、多借三方之星，先天在此多为平隐，靠后天经营。`;

  // 主星挑选：取第一个主星作基调，其余主星叠加
  const MAINS = Object.keys(STAR_MEANING);
  const mains = stars.filter((s) => MAINS.includes(s));
  const auxs = stars.filter((s) => !MAINS.includes(s));

  let base = "";
  if (mains.length === 0) {
    base = `此宫空、借三方之星力，本身平隐，贵在借势`;
  } else if (mains.length === 1) {
    base = STAR_MEANING[mains[0]] || "";
  } else {
    // 双主星：取代表性组合
    const a = STAR_MEANING[mains[0]] || "";
    const b = STAR_MEANING[mains[1]] || "";
    base = a + "，又兼" + b;
  }

  // 辅星强化
  let auxNote = "";
  const AUX_KEYS = Object.keys(AUX_MEANING);
  const interesting = auxs.filter((a) => AUX_KEYS.includes(a) && a !== "文昌" && a !== "文曲");
  if (interesting.length > 0) {
    auxNote = interesting.slice(0, 2).map((a) => AUX_MEANING[a]).join("；") + "。";
  }
  // 文昌文曲特判（才学）
  if (auxs.includes("文昌") || auxs.includes("文曲")) {
    auxNote += "（带书卷才气，利文书才艺）";
  }

  const theme = GONG_THEME[gong] || "该宫";
  const segs = [`${gong}——${theme}`];
  if (base) segs.push(base.replace(/[。；]+$/, ""));
  if (auxNote) segs.push(auxNote.replace(/^[。；]+/, "").replace(/[。；]+$/, ""));
  return segs.join("。") + "。";
}

/**
 * 三方四正解读：命/财/官 看主运，迁移对照看外在
 */
function interpretSanfang(chart: ZweiResult): { t型: string; 主星: string[]; 解读: string }[] {
  const out: { t型: string; 主星: string[]; 解读: string }[] = [];
  const MAINS = Object.keys(STAR_MEANING);

  for (const grp of SANFANG_GROUPS) {
    const starSet: string[] = [];
    for (const g of grp.gongs) {
      const s = chart["星曜"][g] || [];
      for (const st of s) if (MAINS.includes(st) && !starSet.includes(st)) starSet.push(st);
    }
    const joined = starSet.length ? starSet.join("、") : "（无主星）";
    let note = "";
    if (grp.name === "命三方") {
      const strong = ["七杀", "破军", "太阳", "武曲", "紫微", "贪狼"].some((s) => starSet.includes(s));
      note = strong
        ? "命、财、官三方主星有力，一生主运在事业与开创，敢拼敢闯，能成事。"
        : "命、财、官三方偏文静守成，主运在稳步积累，宜走专业、技术、守正之路。";
    } else {
      note = starSet.includes("天马")
        ? "迁移带天马，利外出发展与走动，异地常有际遇。"
        : "迁移宫主出外际遇，外出多有机缘，宜多走动增长见闻。";
    }
    out.push({ t型: grp.name, 主星: starSet, 解读: `${joined}。${note}` });
  }
  return out;
}

/**
 * 格局详批：逐个展开（尽量讲透，不留一句带过）
 */
function interpretPattern(chart: ZweiResult): string[] {
  const patterns = chart["格局"] || [];
  const out: string[] = [];
  for (const p of patterns) {
    // 格局名可能带后缀（如 "杀破狼格 — 人生变动大，适合开拓型交易风格"），取冒号前核心名匹配
    const key = p.split(/[—\-．·:：]/)[0].trim();
    const detail = PATTERN_DETAIL[key];
    if (detail) out.push(detail);
    else out.push(`${p}——此格有专属之象，具体吉凶需观全盘星曜联动，此处点到即止。`);
  }
  if (out.length === 0) out.push("此命格局平稳，无特殊大格，然平中亦有福，守正自安。");
  return out;
}

/**
 * 四化入宫解读
 */
function interpretSihua(chart: ZweiResult): Record<string, string[]> {
  const sihua = chart["四化"] || chart["重要四化"] || {};
  const out: Record<string, string[]> = {};
  for (const [gong, list] of Object.entries(sihua)) {
    if (!list || list.length === 0) continue;
    const notes = (list as string[]).map((line) => {
      // line 形如 "X化禄" 或 "太阳化禄"
      const m = line.match(/化(禄|权|科|忌)/);
      const hua = m ? `化${m[1]}` : "化禄";
      const theme = GONG_THEME[gong] || gong;
      return `${theme}：${line}，${HUA_MEANING[hua] || ""}`;
    });
    out[gong] = notes;
  }
  return out;
}

/**
 * 大限流年批注（含年龄适配：未成年不说婚姻/破财）
 */
function interpretDaxian(chart: ZweiResult): { 年龄段: string; 主题: string }[] {
  const daxian = chart["大限"] || [];
  const out: { 年龄段: string; 主题: string }[] = [];
  for (const d of daxian) {
    const gong = d["宫"] || "";
    const a1 = d["起始年龄"] ?? 0;
    const a2 = d["结束年龄"] ?? 0;
    if (gong && a1 !== undefined && a2 !== undefined) {
      const theme = isMinor(a1, a2) && DAXIAN_THEME_MINOR[gong]
        ? DAXIAN_THEME_MINOR[gong]
        : DAXIAN_THEME[gong] || `${gong}为主之期`;
      out.push({ 年龄段: `${a1}-${a2}岁`, 主题: theme });
    }
  }
  return out;
}

/**
 * 命盘总评：性格画像 + 关键提示（留白，不句句全中）
 */
function interpretOverview(chart: ZweiResult): string[] {
  const out: string[] = [];
  const mingStars = chart["星曜"]["命宫"] || [];
  const MAINS = Object.keys(STAR_MEANING);
  const mains = mingStars.filter((s) => MAINS.includes(s));

  if (mains.length) {
    out.push(`命坐${mains.join("、")}，${mains.map((m) => STAR_MEANING[m]).join("；")}。此为您的性情底色，往后诸事多由此格推演。`);
  } else {
    out.push("命宫无主星，借三方之光，性情随环境而塑，多思而善应。");
  }

  // 用格局给一句提示（留白）
  const patterns = chart["格局"] || [];
  if (patterns.length) {
    out.push(`命带「${patterns.join("」「")}」，一生主基调在此，行事宜顺其势；至于具体岁运的成与败，需落到大限流年上细看，此处不妄断。`);
  }

  out.push("综上所批，此命贵在有根、有向。所谓命者，是底色而非定数——运可转，德可修，事在人为。缘主持正而行，自可于万变中得其所安。");
  return out;
}

/** 主入口：对已排好的 ZweiResult 生成深度解读 */
export function interpretZwei(chart: ZweiResult): ZweiDeepResult {
  // 逐宫解读
  const 星曜解读: Record<string, string> = {};
  for (const [gong, stars] of Object.entries(chart["星曜"] || {})) {
    星曜解读[gong] = interpretGong(gong, stars);
  }

  return {
    星曜解读,
    三方四正: interpretSanfang(chart),
    格局详批: interpretPattern(chart),
    四化解读: interpretSihua(chart),
    大限批注: interpretDaxian(chart),
    总评: interpretOverview(chart),
  };
}

// ==================== 文本输出（大师版） ====================

export function formatDeepChart(chart: ZweiResult): string {
  const deep = interpretZwei(chart);
  const lines: string[] = [];
  lines.push("═".repeat(44));
  lines.push("  紫微斗数 · 大师级细批命盘");
  lines.push(`  ${chart["公历"]}`);
  lines.push("═".repeat(44));
  lines.push("");

  lines.push("【命主根基】");
  lines.push(`  命宫：${chart["命宫"]}（${chart["命宫天干"]}${chart["命宫地支"]}）｜五行局：${chart["五行局"]}｜紫微在${chart["紫微星"]}`);
  lines.push("");

  lines.push("【十二宫细批】");
  for (const g of Object.keys(GONG_THEME)) {
    if (deep.星曜解读[g]) lines.push(`  · ${deep.星曜解读[g]}`);
  }
  lines.push("");

  lines.push("【三方四正】");
  for (const sf of deep.三方四正) lines.push(`  · ${sf.t型}：${sf.解读}`);
  lines.push("");

  if (deep.格局详批.length) {
    lines.push("【格局详批】");
    for (const p of deep.格局详批) lines.push(`  · ${p}`);
    lines.push("");
  }

  if (Object.keys(deep.四化解读).length) {
    lines.push("【四化入宫】");
    for (const notes of Object.values(deep.四化解读)) {
      for (const n of notes) lines.push(`  · ${n}`);
    }
    lines.push("");
  }

  lines.push("【大限流年批注】");
  for (const d of deep.大限批注) lines.push(`  · ${d.年龄段}：${d.主题}`);
  lines.push("");

  lines.push("【命盘总评】");
  for (const t of deep.总评) lines.push(`  · ${t}`);
  lines.push("");
  lines.push("═".repeat(44));

  return lines.join("\n");
}

// ==================== 便捷入口（一次排盘+解读） ====================

export function buildAndInterpret(
  year: number, month: number, day: number, hour: number, gender: number = 1
): { chart: ZweiResult; deep: ZweiDeepResult; text: string } {
  const chart = buildChart(year, month, day, hour, gender);
  const deep = interpretZwei(chart);
  const text = formatDeepChart(chart);
  return { chart, deep, text };
}
