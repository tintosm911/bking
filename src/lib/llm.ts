// DeepSeek 增强解读封装
// 有 DEEPSEEK_API_KEY 时启用 LLM 深化解读；无 key 时自动降级，不影响独立上线。
// DeepSeek 兼容 OpenAI Chat Completions 协议。

// SiliconFlow(硅基流动) 兼容 OpenAI Chat 协议，国内直连无墙。
// 模型 deepseek-ai/DeepSeek-V4-Flash 经实测可用此 key 鉴权（非 DeepSeek 官方 key）。
const DEEPSEEK_BASE = "https://api.siliconflow.cn/v1";
const DEEPSEEK_MODEL = "deepseek-ai/DeepSeek-V4-Flash";

/** 当前是否配置了 DeepSeek key */
export function hasDeepSeek(): boolean {
  return !!(process.env.DEEPSEEK_API_KEY);
}

/**
 * 调 DeepSeek 深化/润色玄学解读。
 * @param message 现有大师回复（规则引擎生成）
 * @param skill   触发的技能标签
 * @param profile 已知出生信息（可选，供上下文）
 * @returns 深化后的回复文本；key 缺失或调用失败时返回 null（调用方应降级原样返回）
 */
export async function deepenOracleReply(
  message: string,
  skill: string,
  profile?: { name?: string; year?: number; month?: number; day?: number; hour?: number },
  history?: { role: string; content: string }[]
): Promise<string | null> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;

  const birthInfo =
    profile?.year && profile?.month && profile?.day
      ? `${profile.year}年${profile.month}月${profile.day}日${profile.hour !== undefined ? profile.hour + "时" : ""}`
      : "未知";

  // 深聊上下文：最近几轮对话（供承接话锋，非排盘硬数据）
  const historyBlock =
    history && history.length
      ? "\n\n—— 前文对话（你与缘主的连续聊天，供承接话锋，勿改动其中的硬数据）——\n" +
        history
          .map((h) => `${h.role === "user" ? "缘主" : "玄机大师"}：${h.content}`)
          .join("\n")
      : "";

  const baseSystem =
    "你是「玄机大师」，BKing 玄学命理站的口吻亲切、文雅、略带古人范儿的 AI 命理师。\n" +
    "下面是规则引擎已算出的命理结果（骨架准确，勿改动其中的排盘硬数据）。\n";
  const system = history && history.length
    ? baseSystem +
      "这是一段与缘主的真实闲聊，你要像一个有血有肉、坐在对面喝茶的老先生那样回话，而不是写报告。要求：\n" +
      "1. 保留四柱、五行、用神等硬数据不造假；\n" +
      "2. 顺着缘主刚才的话头接，接住他的情绪——他若喊累就宽慰，他若有喜就替他高兴；\n" +
      "3. 口语化、有来有回，像聊天不像解答，可偶尔带点温和的自嘲或烟火气；\n" +
      "4. 主动关心人，不冷冰冰转话题；\n" +
      "5. 结尾留个话头（如『你若愿听，老夫再说说…』），让缘主能接下去；\n" +
      "6. 长度控制在自然聊天的 2-3 段，别长篇大论。"
    : baseSystem +
      "请把这段回复深化润色为更通顺、更生动、更有大师韵味的解读，适当补充命理角度的点拨，但：\n" +
      "1. 不得虚构/篡改年份、四柱、五行、评分等硬数据；\n" +
      "2. 保留原有的【技能名】标题和代码块结构；\n" +
      "3. 控制在原文 1.3 倍长度以内，去掉机械感；\n" +
      "4. 语气温润、劝善、务实，不搞迷信恐吓。";

  const user =
    `触发技能：${skill}\n` +
    `命主出生：${birthInfo}\n` +
    `${historyBlock}\n\n` +
    (history && history.length
      ? `前文已有对话，请顺着前文话锋自然承接（缘主在上文刚说过什么、大师应过什么，都要记得），不要突兀重起、不要当成孤立问答。只深化润色当前这条规则引擎回复，再自然过渡到对缘主这番话的回应。\n\n`
      : "") +
    `当前规则引擎回复原文：\n"""\n${message}\n"""`;

  try {
    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!res.ok) return null;

    const data: any = await res.json();
    const out = data?.choices?.[0]?.message?.content?.trim();
    return typeof out === "string" && out.length > 0 ? out : null;
  } catch {
    return null;
  }
}