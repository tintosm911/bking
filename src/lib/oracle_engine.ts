/**
 * 玄机大师 (Oracle) — AI 玄学对话助手引擎
 * =====================================================
 * 设计对比 mystical-oracle 的三大优势：
 *   1. 引擎自研        — 八字/紫微/奇门/天机 全用 BKing 本地 TS 引擎，零付费 API、零墙、零成本
 *   2. 无重依赖        — 不用 LangChain/Ollama/Qdrant/Redis；意图识别用规则路由 + 自研记忆，稳且快
 *   3. 工具更全        — 原版只有 八字/解梦/摇卦/搜索；我们接 4 大自研引擎 + 今日运势 + 命理解读
 *
 * 核心能力：
 *   - 意图识别路由     自动判断「排八字 / 紫微 / 奇门 / 天机合盘 / 今日运势 / 解梦 / 命理问答」
 *   - 出生信息提取     从用户一句话里抽出 年/月/日/时/性别
 *   - 会话记忆         用 better-sqlite3 存聊天记录，记住用户的姓名/生日
 *   - 情绪感知         识别用户口吻，切换大师的回答风格
 *   - 玄学解读         把引擎排盘结果转成有温度的中文解读
 */

import { buildBazi, formatBazi } from "./bazi_engine";
import { fanTuiDivination, formatFanTui } from "./fan_tui_engine";
import { buildChart, formatChart } from "./zwei_engine";
import { qimenMasterPan, formatQimenOutput } from "./qimen_engine";
import { calcTianji, TianjiMemberInput } from "./tianji_engine";

// ============ 类型定义 ============

export interface OracleMessage {
  role: "user" | "master";
  content: string;
  ts: number;
}

export interface OracleSession {
  id: string;
  userId?: number;
  messages: OracleMessage[];
  /** 已记住的用户信息 */
  profile: {
    name?: string;
    gender?: number;
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
  };
}

export interface OracleReply {
  message: string;
  /** 触发的技能，用于前端展示标签 */
  skill: string;
  mood: string;
  /** 是否需要用户补全出生信息 */
  needBirthInfo: boolean;
  /** 生成的排盘原始数据（可选，供前端展示结构化面板） */
  detail?: any;
  profile?: OracleSession["profile"];
}

// ============ 情绪识别 ============

const MOOD_KEYWORDS = {
  cheerful: ["开心", "高兴", "太好了", "哈哈", "兴奋", "棒", "耶", "爱了", "喜欢"],
  depressed: ["难过", "伤心", "哭", "低落", "烦", "郁闷", "难受", "绝望", "焦虑", "压力", "累", "迷茫"],
  angry: ["气死", "愤怒", "生气", "凭什么", "讨厌", "滚", "垃圾", "烦死", "md", "靠"],
  friendly: ["你好", "谢谢", "麻烦", "请教", "请问", "大师", "缘主", "求"],
} as const;

function detectMood(text: string): string {
  let mood: string = "default";
  let best = 0;
  for (const [m, words] of Object.entries(MOOD_KEYWORDS)) {
    let score = 0;
    for (const w of words) if (text.includes(w)) score++;
    if (score > best) { best = score; mood = m; }
  }
  return mood;
}

/**
 * 根据情绪返回大师的口吻开场 / 结尾
 */
function moodFlavor(mood: string): { opening: string; closing: string } {
  switch (mood) {
    case "cheerful": return { opening: "缘主今朝气色明朗，心念通达，", closing: "好兆头，莫负此心。🙏" };
    case "depressed": return { opening: "缘主且宽心。命有起伏，气有盈亏，", closing: "低谷是蓄势，天无绝人之路。🙏" };
    case "angry": return { opening: "缘主莫动肝火，气伤则神伤，", closing: "静一静，方得清明。🙏" };
    case "friendly": return { opening: "有缘人既至，", closing: "" };
    default: return { opening: "", closing: "" };
  }
}

// ============ 出生信息提取 ============

/**
 * 从一句话里尝试提取 年/月/日/时/性别。
 * 支持「1998年8月8日12时」「九八年八月八日午时」「男/女」等常见写法。
 */
function extractBirthInfo(text: string): Partial<OracleSession["profile"]> {
  const p: Partial<OracleSession["profile"]> = {};
  const t = text;

  // 性别
  if (/男/g.test(t)) p.gender = 0;
  else if (/女/g.test(t)) p.gender = 1;

  // 年份：四位数 or 「九几」年
  const yearMatch = t.match(/(?:19|20)(\d{2})年/) || t.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (yearMatch && /19|20/.test(yearMatch[0])) {
    p.year = parseInt(yearMatch[0].replace("年", ""), 10);
  } else {
    // 中文数字年「九八年」
    const cn = t.match(/([一二三四五六七八九零〇])([一二三四五六七八九零〇]?)年/);
    if (cn) {
      const numMap: Record<string, number> = { "零": 0, "〇": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9 };
      const a = numMap[cn[1]] ?? 0;
      const b = numMap[cn[2]] ?? 0;
      p.year = 1900 + a * 10 + b;
    }
  }

  // 月
  const monthMatch = t.match(/(\d{1,2})月/) || t.match(/([一二三四五六七八九十]{1,2})月/);
  if (monthMatch && !/^\d{4}/.test(monthMatch[1])) {
    if (/^\d+$/.test(monthMatch[1])) p.month = parseInt(monthMatch[1], 10);
    else {
      const cnNum: Record<string, number> = { "十": 10, "十一": 11, "十二": 12, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9 };
      p.month = cnNum[monthMatch[1]] ?? undefined;
    }
  }

  // 日
  const dayMatch = t.match(/(\d{1,2})日/) || t.match(/([一二三四五六七八九十]{1,2})日/);
  if (dayMatch && !/^\d{4}/.test(dayMatch[1])) {
    if (/^\d+$/.test(dayMatch[1])) p.day = parseInt(dayMatch[1], 10);
  }

  // 时：数字时 or 时辰名
  const hourMatch = t.match(/(\d{1,2})[点时]/);
  if (hourMatch) {
    p.hour = parseInt(hourMatch[1], 10);
  } else {
    const shichen = t.match(/(子|丑|寅|卯|辰|巳|午|未|申|酉|戌|亥)时/);
    const scIdx: Record<string, number> = { 子: 23, 丑: 1, 寅: 3, 卯: 5, 辰: 7, 巳: 9, 午: 11, 未: 13, 申: 15, 酉: 17, 戌: 19, 亥: 21 };
    if (shichen) p.hour = scIdx[shichen[1]];
  }

  // 名字
  const nameMatch = t.match(/(?:我叫|名字叫|我名|姓名)([^\s，。,!！?？]{1,4})/);
  if (nameMatch) p.name = nameMatch[1].replace(/叫$/, "");

  return p;
}

/** 判断出生信息是否完整（排盘需要 年/月/日/时） */
function birthComplete(p: Partial<OracleSession["profile"]>): boolean {
  return !!(p.year && p.month && p.day && p.hour !== undefined);
}

// ============ 意图识别 ============

function detectIntent(text: string): string {
  const t = text;

  if (/天机|合盘|配对|缘分|合婚|两个人|我们俩|契合/.test(t)) return "tianji";
  if (/奇门|遁甲|局|预测|择吉|方位|出行时机/.test(t) && /奇门|遁甲/.test(t)) return "qimen";
  if (/紫微|斗数|命盘|主星|星盘/.test(t)) return "zwei";
  if (/今日|今天|运势|财运|事业运|感情运|桃花/.test(t)) return "fortune";
  if (/解梦|梦见|梦到|做梦/.test(t)) return "dream";
  if (/反推|覆盘|复盘|过往|过去|经历|遭遇|之前|以前|回顾|回看|小人|破财|受过|吃过亏/.test(t)) return "fantu";
  if (/八字|排盘|生辰|命理|四柱|五行|日主|用神/.test(t)) return "bazi";
  if (/运势|命|前程|事业|感情|财运|婚姻|健康/.test(t)) return "fortune";
  return "chat";
}

// 是否追问型短句（指代开头 / 超短句）
function isFollowUp(text: string): boolean {
  const t = text.trim();
  if (t.length <= 10) return true; // 超短句，多半是指代追问
  if (FOLLOW_PREFIX.test(t)) return true;
  // 无明确的排盘技能关键词，且是口语化问句
  if (!(/八字|紫微|奇门|天机|排盘|运势|解梦|反推/.test(t)) && /[？?]$/.test(t)) return true;
  return false;
}

// 生成追问接续答复（基于已知用神/生日 + 追问的具体话题）
function buildFollowReply(
  text: string,
  dimension: string,
  profile: Partial<OracleSession["profile"]>,
  skill: string | null
): OracleReply | null {
  if (!profile.year || !profile.month || !profile.day) return null;
  const hour = profile.hour ?? 12;
  const b = buildBazi(profile.year, profile.month, profile.day, hour, profile.gender ?? 1);
  const ys = b.用神 || "取平衡";
  const js = b.忌神 || "";
  const strong = b.是否身强 ? "身强" : "身弱";
  const dimText: Record<string, string> = {
    财: `财运上，日主${strong}，以「${ys}」为用神。命中正财有源与否，要看用神得地之年限与行运走向。财非求急，${js ? `忌「${js}」之岁运扰动，` : ""}宜循序积攒、守正经营，中年用神得地之时，正财自稳中有升。`,
    婚: `姻缘上，日主${strong}。感情之事重日月支之合冲与桃花之现。缘起缘聚，讲求一个"适时"——用神当旺之岁，桃花引动之日，自然水到渠成。${js ? `忌「${js}」岁运感情多波折，` : ""}宜平心静气，莫强求，缘分自有定数。`,
    官: `事业仕途，日主${strong}，官星当令则贵，伤官见官则起波澜。升迁跳槽宜择用神得力之岁运行动，${js ? `避「${js}」之岁难免阻滞，` : ""}沉住气，厚积薄发，位自可进。`,
    健: `健康方面，日主${strong}。身${strong}者气血根基不弱，然五行失衡处便是暗疾之源。${js ? `「${js}」所主之脏腑${"火" === js ? "（心、小肠）" : "水" === js ? "（肾、膀胱）" : "木" === js ? "（肝、胆）" : "金" === js ? "（肺、大肠）" : "（脾、胃）"}最需调养，` : ""}作息有常、清淡饮食、戒怒少耗，得用神之气自可常葆康宁。`,
    感: `感情桃花，日主${strong}。桃花之兴衰，系于时支与岁运之引动。桃运来时莫错过，桃运去时莫强留。${js ? `「${js}」岁运桃花多虚，易遇非正缘，` : ""}缘来缘去皆由命数，心正自遇良人。`,
    子: `子嗣之缘，日主${strong}。子孙星以食伤与子女宫论之。${ys ? `用神「${ys}」得地之岁，气顺缘至。` : ""}养正持心，顺其自然，瓜熟蒂落，儿孙自有儿孙福。`,
    贵: `贵人运，日主${strong}。贵人看印星与年月之吉神。${ys ? `以「${ys}」为用，印星得力之年多得师辈提携、贵人相助。` : ""}多行善结缘，人脉自旺，关键处自有贵人拉一把。`,
  };
  const body = dimText[dimension] || `此事与命局用神「${ys}」呼应。日主${strong}，行事宜顺用神之性而为，自能趋吉避凶。`;
  const mood = detectMood(text);
  const flavor = moodFlavor(mood);
  return {
    message: `${flavor.opening}依先前所排之命，为你细论此事。${body}${flavor.closing}`,
    skill: skill || "玄学问答",
    mood,
    needBirthInfo: false,
    profile: { ...profile },
  };
}

// ============ 排盘调用 + 解读 ============

/**
 * 抽取排盘需要的字段，缺的补默认（时分默认午时，性别默认男）
 */
function toBaziParams(p: Partial<OracleSession["profile"]>) {
  return {
    year: p.year ?? new Date().getFullYear() - 25,
    month: p.month ?? 1,
    day: p.day ?? 1,
    hour: p.hour ?? 12,
    minute: 0,
    gender: p.gender ?? 1,
  };
}

function runBazi(p: Partial<OracleSession["profile"]>): { text: string; detail: any } {
  const params = toBaziParams(p);
  const bazi = buildBazi(params.year, params.month, params.day, params.hour, params.gender);
  const block = formatBazi(bazi);
  // 提炼一句人话解读
  const rizhu = bazi["日主"] as string;
  const wuxing = bazi["日主五行"] as string;
  const shen = bazi["日主力量"] as string;
  const yong = (bazi as any)["用神"] ?? "";
  const yongShen = Array.isArray(yong) ? yong.join("、") : (yong ?? "");
  const text =
    `【八字排盘】命主日主为「${rizhu}」（${wuxing}，${shen}）。\n` +
    (yongShen ? `用神取「${yongShen}」，五行喜用合于此。` : "") +
    `\n\n完整命盘如下，供缘主细参：\n\n\`\`\`\n${block}\n\`\`\``;
  return { text, detail: bazi };
}

function runFanTui(p: Partial<OracleSession["profile"]>): { text: string; detail: any } {
  const params = toBaziParams(p);
  const r = fanTuiDivination(params.year, params.month, params.day, params.hour, params.gender);
  const text = `【八字反推 · 过往经历】以命主四柱十神与一路大运，反推曾经经历过的波折与遭逢。\n\n\`\`\`\n${formatFanTui(r)}\n\`\`\``;
  return { text, detail: r };
}

function runZwei(p: Partial<OracleSession["profile"]>): { text: string; detail: any } {
  const params = toBaziParams(p);
  const chart = buildChart(params.year, params.month, params.day, params.hour, params.gender);
  const block = formatChart(chart);
  const text = `【紫微斗数命盘】已为缘主安星排盘，十四主星分布与格局尽在其中。\n\n\`\`\`\n${block}\n\`\`\``;
  return { text, detail: chart };
}

function runQimen(): { text: string; detail: any } {
  const pan = qimenMasterPan(new Date());
  const block = formatQimenOutput(pan);
  const text = `【奇门遁甲·当下时空局】以此刻起局推演，观天地人神盘交汇，预示当前时机的吉凶走向。\n\n\`\`\`\n${block}\n\`\`\``;
  return { text, detail: pan };
}

function runFortune(p: Partial<OracleSession["profile"]>, baseSkill: string): string {
  // 今日运势：结合日主五行 + 当前日期，给一个通俗解读
  const wuxingCycle = ["木", "火", "土", "金", "水"];
  const today = new Date();
  const dayIdx = today.getDate() % 5;
  const todayWx = wuxingCycle[dayIdx];

  let rizhuWx = "";
  try {
    const params = toBaziParams(p);
    const bazi = buildBazi(params.year, params.month, params.day, params.hour, params.gender);
    const rizhu = bazi["日主"] as string;
    const wx: Record<string, string> = { 甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水" };
    rizhuWx = wx[rizhu] ?? "";
  } catch { /* ignore */ }

  const sheng: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  const ke: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

  let advice = "";
  if (rizhuWx && todayWx === sheng[rizhuWx]) advice = "今日五行相生，气运顺遂，宜主动出击、洽谈要事。";
  else if (rizhuWx && todayWx === ke[rizhuWx]) advice = "今日气场有克制之势，宜守不宜攻，沉稳为上。";
  else advice = "今日五行平衡，平稳中藏机遇，顺势而为即可。";

  const parts: string[] = [];
  if (/财/.test("财运")) parts.push("财运宜稳，正财可期，偏财谨慎。");
  if (/事业/.test("事业")) parts.push("事业有进机，宜把握分寸，忌急切。");
  if (/感情|桃花/.test("感情")) parts.push("感情重真诚，顺其自然，莫强求。");
  if (parts.length === 0) parts.push("整体气运平顺，专注当下，自有回响。");

  return `【今日运势 · ${today.toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}】${advice}\n${parts.join("\n")}`;
}

function runDream(text: string): string {
  // 解梦：提取"梦见/梦到"后的关键词，给出通俗解读（本地规则库）
  const m = text.match(/梦见?([^，。,!！?？]{1,12})/) || text.match(/梦到?([^，。,!！?？]{1,12})/);
  const keyword = m ? m[1] : text;

  const DREAM_BOOK: Array<[RegExp, string]> = [
    [/蛇/, "蛇主变动，有缠绕之事将解，亦预示潜在贵人暗中相助。"],
    [/水/, "水主财与情感流动，梦水者近期心境起伏，财帛或有流转。"],
    [/火/, "火主旺盛与警示，梦中见火，或遇事将明，宜防急进。"],
    [/飞|飞翔|飞行/, "梦飞主心志高远，事业有望突破，但须防好高骛远。"],
    [/掉|坠落|摔/, "梦坠主心绪不安，近期压力积聚，宜放慢脚步休整。"],
    [/钱|金银/, "梦得钱财主财气渐起，但来得快也易散，宜守成。"],
    [/血/, "梦血主气血与消耗，近期劳碌，宜多休息养神。"],
    [/病/, "梦病非凶，多为身体发出的提醒，宜关注健康作息。"],
    [/结婚|婚礼/, "梦婚主人际和合，或有喜事临门，感情运势上扬。"],
    [/狗/, "梦狗主忠诚与守护，身边有可靠之人，亦防口舌。"],
    [/猫/, "梦猫主灵性与神秘，或有隐情待察，直觉可依。"],
    [/房子|房屋/, "梦屋主根基与安稳，内心渴望安定，家宅之事宜用心。"],
  ];

  for (const [re, ans] of DREAM_BOOK) {
    if (re.test(keyword)) return `【解梦】缘主梦境「${keyword}」——${ans}\n\n梦为心象，仅供参考，莫要过度忧思。`;
  }
  return `【解梦】缘主所梦「${keyword}」，意象朦胧，未有定数。凡梦皆由心生，近日宜平心静气，顺其自然，吉凶自有分晓。🙏`;
}

function runChat(text: string, profile: Partial<OracleSession["profile"]>): string {
  // 闲聊兜底：大师口吻回应，若已有生日信息可顺势提命理建议
  const hasBirth = birthComplete(profile);
  const name = profile.name ? `，${profile.name}` : "";
  const base =
    hasBirth
      ? `缘主${name}问「${text}」。老夫观你有命在身，凡事可从我八字中觅得端倪。何不让我为你说一说命途？`
      : `缘主${name}且听：命由天定，运由己造。若告知我你的生辰八字，老夫可为你细推命盘、指点迷津。`;
  return `【玄机问道】${base} 🙏\n\n(可发任意一句，我会自动判断是要排八字、看紫微、起奇门、解梦境，还是算今日运势。)`;
}

// ============ 天机合盘（双人契合） ============

interface PairBirth {
  complete: boolean;
  members: TianjiMemberInput[];
  missing?: string;
}

/**
 * 从一句话解析两位命主的出生信息。
 * 支持「我1998年8月8日午时出生，对方2000年5月20日辰时出生」「男1998…女2000…」等格式。
 */
function extractPairBirth(text: string): PairBirth {
  const t = text;

  // 分隔词：对方 / 她 / 他 / 另一个 / 另一个人 / 另一位 / 伴侣 / 对象
  const sep =
    t.match(/(对方|她|他|另一个|另一个人|另一位|伴侣|对象|那位)/);

  if (!sep || !sep.index) {
    // 没有第二人信息 → 不完整
    return { complete: false, members: [] };
  }

  const aText = t.slice(0, sep.index);
  const bText = t.slice(sep.index + sep[1].length);

  const a = extractBirthInfo(aText);
  const b = extractBirthInfo(bText);

  const aComplete = birthComplete(a);
  const bComplete = birthComplete(b);

  if (!aComplete || !bComplete) {
    return {
      complete: false,
      members: [],
      missing: !aComplete ? "第一位命主" : "第二位命主",
    };
  }

  return {
    complete: true,
    members: [
      {
        name: "甲",
        gender: a.gender === 1 ? "女" : "男",
        solar_date: `${a.year}-${String(a.month).padStart(2, "0")}-${String(a.day).padStart(2, "0")}`,
        birth_time: `${String(a.hour).padStart(2, "0")}:00`,
      },
      {
        name: "乙",
        gender: b.gender === 1 ? "女" : "男",
        solar_date: `${b.year}-${String(b.month).padStart(2, "0")}-${String(b.day).padStart(2, "0")}`,
        birth_time: `${String(b.hour).padStart(2, "0")}:00`,
      },
    ],
  };
}

const RATING_TEXT: Record<string, string> = {
  "★★★★★ 极佳组合": "天作之合，五行互补，气场相融，是难得的上佳良缘。",
  "★★★★☆ 良好组合": "有缘有分，彼此能补益，用心经营可成佳偶。",
  "★★★☆☆ 中等组合": "缘分尚可，性格需多磨合包容，方能长久。",
  "★★☆☆☆ 有待改善": "互补之处与相冲之处并存，需多理解与退让。",
};

function runTianjiPair(pair: PairBirth): {
  text: string;
  detail: any;
} {
  const result = calcTianji({ members: pair.members });
  const s = result.synastry;
  const score = s.total ?? 0;
  const pct = s.max_possible > 0 ? Math.round((score / s.max_possible) * 100) : 0;
  const ratingNote = RATING_TEXT[s.rating] ?? s.rating;

  // 各维度评分（去掉 null）
  const parts: string[] = [];
  for (const [k, v] of Object.entries(s.scores)) {
    if (v != null) parts.push(`  ${k}: ${v}分`);
  }

  const text =
    `【天机合盘 · ${s.rating}】\n` +
    `契合总评分 **${score}/${s.max_possible}**（约 ${pct}%）。\n\n` +
    `${ratingNote}\n\n` +
    `分项细查：\n\`\`\`\n${parts.join("\n") || "  （本命局维度数据暂缺）"}\n\`\`\`\n` +
    `\n两人八字与称骨详录：\n\`\`\`\n${result.members
      .map(
        (m) =>
          `${m.name}（${m.gender === "女" ? "女" : "男"}） 八字 ${m.bazi.join(" ")} | 生肖${m.shengxiao} | 称骨${m.chenggu?.总重 ?? "-"}`
      )
      .join("\n")}\n\`\`\``;

  return { text, detail: { synastry: s, members: result.members } };
}

// ============ 主入口 ============

// ---------- 追问接续检测 ----------
// 用户短问/指代问，且上文已有排盘技能 → 顺着上文的技能/用神续答，而非重新路由
const FOLLOW_TOPIC: { re: RegExp; dimension: string }[] = [
  { re: /买房|购房|置业|房子|房产|不动产/, dimension: "财" },
  { re: /结婚|姻缘|婚姻|对象|配偶|伴侣|另一半|脱单/, dimension: "婚" },
  { re: /考公|公务员|编制|上岸|升职|升迁|官职|职位|跳槽|换工作|事业/, dimension: "官" },
  { re: /财运|赚钱|收入|生意|投资|财源/, dimension: "财" },
  { re: /健康|疾病|身体|养生|病/, dimension: "健" },
  { re: /桃花|感情|恋爱|异性缘/, dimension: "感" },
  { re: /子嗣|子女|孩子|生儿育女|怀孕/, dimension: "子" },
  { re: /贵人|贵人运|人脉|合作|合伙/, dimension: "贵" },
];
const FOLLOW_PREFIX = /^(那|哪|那我的|然后|今年|最近|能|可以|会不会|好不好|是不是|我想问|想问|再看看|再聊聊|接着|继续|还有|顺便|麻烦问)/;

function extractFollowTopic(text: string): string | null {
  for (const f of FOLLOW_TOPIC) if (f.re.test(text)) return f.dimension;
  return null;
}

function lastSkillFromMessages(messages?: OracleMessage[]): string | null {
  if (!messages || messages.length < 2) return null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "master" && /【(.+?)】/.test(m.content)) {
      return RegExp.$1;
    }
  }
  return null;
}

export function runOracle(
  text: string,
  profile: Partial<OracleSession["profile"]> = {},
  messages?: OracleMessage[]
): OracleReply {
  // 0. 追问接续：短问/指代问 且 上文已有排盘技能 且 已有生日 → 顺上文续答
  const follow = isFollowUp(text) ? extractFollowTopic(text) : null;
  if (follow && lastSkillFromMessages(messages) && birthComplete(profile)) {
    const reply = buildFollowReply(text, follow, profile, lastSkillFromMessages(messages));
    if (reply) return reply;
  }
  // 1. 更新记忆里的出生信息
  const merged: Partial<OracleSession["profile"]> = { ...profile, ...extractBirthInfo(text) };

  // 2. 情绪
  const mood = detectMood(text);
  const flavor = moodFlavor(mood);

  // 3. 意图
  const intent = detectIntent(text);

  // 4. 按意图执行
  let reply: Omit<OracleReply, "needBirthInfo">;
  let needBirth = false;

  switch (intent) {
    case "bazi": {
      if (birthComplete(merged)) {
        const r = runBazi(merged);
        reply = { message: r.text, skill: "八字排盘", mood, detail: r.detail };
      } else {
        needBirth = true;
        reply = {
          message: `${flavor.opening}八字排盘需知命主的生辰八字——请告诉我你的出生年份、月份、日期和时辰（如「1998年8月8日午时」出生），男女一并告知，老夫即刻为你起盘。${flavor.closing}`,
          skill: "八字排盘", mood,
        };
      }
      break;
    }
    case "fantu": {
      if (birthComplete(merged)) {
        const r = runFanTui(merged);
        reply = { message: r.text, skill: "八字反推·过往经历", mood, detail: r.detail };
      } else {
        needBirth = true;
        reply = {
          message: `${flavor.opening}反推过往经历，同样需知命主的生辰八字——告诉我出生年、月、日、时（如「1990年3月15日巳时」出生）与性别，老夫便以四柱大运为你还原曾经历过的起伏遭逢。${flavor.closing}`,
          skill: "八字反推·过往经历", mood,
        };
      }
      break;
    }
    case "zwei": {
      if (birthComplete(merged)) {
        const r = runZwei(merged);
        reply = { message: r.text, skill: "紫微斗数", mood, detail: r.detail };
      } else {
        needBirth = true;
        reply = { message: `${flavor.opening}紫微斗数安星排盘，同样需要你的生辰——年月日时与性别。请补全后我为你起盘。${flavor.closing}`, skill: "紫微斗数", mood };
      }
      break;
    }
    case "qimen": {
      const r = runQimen();
      reply = { message: `${flavor.opening}${r.text}${flavor.closing}`, skill: "奇门遁甲", mood, detail: r.detail };
      break;
    }
    case "tianji": {
      const pair = extractPairBirth(text);
      if (pair.complete) {
        const r = runTianjiPair(pair);
        reply = { message: r.text, skill: "天机合盘", mood, detail: r.detail };
      } else {
        needBirth = true;
        reply = { message: `${flavor.opening}天机合盘需知两人生辰。请按「我1998年8月8日午时出生，对方2000年5月20日辰时出生」这样的格式告诉我（含两人性别，缺哪个告诉我哪个），老夫为你推演两人的契合度。${flavor.closing}`, skill: "天机合盘", mood };
      }
      break;
    }
    case "fortune": {
      const r = runFortune(merged, intent);
      reply = { message: `${flavor.opening}${r}${flavor.closing}`, skill: "今日运势", mood };
      break;
    }
    case "dream": {
      const r = runDream(text);
      reply = { message: `${flavor.opening}${r}${flavor.closing}`, skill: "解梦", mood };
      break;
    }
    default: {
      const r = runChat(text, merged);
      reply = { message: r, skill: "玄机问道", mood };
    }
  }

  return { ...reply, needBirthInfo: needBirth, profile: merged };
}