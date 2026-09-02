// BKing 报告映射器 — 将各门类引擎结果转为统一 BKingReport，供 PDF 生成
// 服务：bazi / zwei / qimen / tianji / tarot(前端本地) / astrology
import type { BKingReport } from "./template";
import { genReportNo } from "./template";

export type ReportService = "bazi" | "zwei" | "qimen" | "tianji" | "tarot" | "astrology";

interface ReportInput {
  service: ReportService;
  nickname: string;
  result: any;
  // 辅助信息（合盘人姓名等）
  meta?: Record<string, string>;
}

interface PersonView {
  name: string;
  gender: string;
  solarDate: string;
}

function guessGender(result: any): string {
  return result?.gender === 0 || result?.gender === "女" ? "女" : "男";
}

/** 五行柱（bazi 四柱顺序：年/月/日/时） */
function baziPillars(result: any): string[][] {
  const s = result?.四柱 || {};
  const order = ["年柱", "月柱", "日柱", "时柱"];
  return order.map((k) => {
    const v = s[k] || "";
    // 天干地支可能为 "甲子" 或分开字段
    const [stem, branch] = typeof v === "string" && v.length >= 2
      ? [v[0], v[1]]
      : [v?.天干 || "", v?.地支 || ""];
    return [k.replace("柱", ""), stem, branch];
  });
}

function baziReport(r: ReportInput, input: PersonView): BKingReport {
  const result = r.result || {};
  const pillars = baziPillars(result);

  // 大运
  const dayun = Array.isArray(result.大运)
    ? result.大运.map((d: any) => [d.年龄 || "", d.大运 || ""])
    : [];

  return {
    serviceType: "八字命理报告",
    serviceTypeEn: "BAZI · 八字命理",
    nickname: input.name || r.nickname || "未填写",
    reportNo: genReportNo(),
    meta: [
      { label: "出生", value: input.solarDate },
      { label: "性别", value: input.gender },
      { label: "日主", value: `${result.日主 || "-"} · ${result.日主五行 || ""}` },
    ],
    summary: [
      { label: "日主", text: `${result.日主 || "-"} · ${result.日主五行 || ""}${result.日主阴阳 || ""} · 身${result.日主力量 || ""}` },
      { label: "五行", text: Object.entries(result.五行旺衰 || {}).map(([wx, n]: any) => `${wx}${n}`).join(" · ") || "-" },
      { label: "用神", text: `${result.用神 || "-"}（喜神：${result.喜神 || "-"}，忌神：${result.忌神 || "-"}）` },
    ],
    sections: [
      {
        title: "四柱排盘",
        blocks: [
          {
            kind: "table" as const,
            content: { head: ["柱", "天干", "地支"], rows: pillars.map((p) => [`${p[0]}柱`, p[1], p[2]]) },
          },
          {
            kind: "text" as const,
            content: `日主 ${result.日主 || "-"}（${result.日主五行 || ""}${result.日主阴阳 || ""}），身${result.日主力量 || ""}，${result.是否身强 ? "身强" : "身弱"}。`,
          },
        ],
      },
      ...(dayun.length
        ? [{
            title: "大运走势",
            blocks: [{ kind: "table", content: { head: ["年龄", "大运"], rows: dayun } } as any],
          }]
        : []),
      {
        title: "流年",
        blocks: [{ kind: "text", content: result.流年 || "-" }],
      },
      ...(result.交易解读 && Object.keys(result.交易解读).length
        ? [{
            title: "交易解读",
            blocks: Object.entries(result.交易解读).map(([k, v]: any) => ({
              kind: "advice" as const,
              content: [`${k}：${v}`],
            })),
          }]
        : []),
    ],
    endNote: "AI 八字命理 · 五行喜忌 · 运程指引",
  };
}

function zweiReport(r: ReportInput, input: PersonView): BKingReport {
  const result = r.result || {};
  const stars = result.星曜 || {};
  return {
    serviceType: "紫微斗数报告",
    serviceTypeEn: "ZI WEI · 紫微斗数",
    nickname: input.name || "-",
    reportNo: genReportNo(),
    meta: [
      { label: "出生", value: input.solarDate },
      { label: "农历", value: result.农历 || "" },
      { label: "命宫", value: result.命宫 || "" },
    ],
    summary: [
      { label: "命宫", text: `${result.命宫 || "-"} · 紫微星 ${result.紫微星 || "-"}` },
      { label: "五行局", text: result.五行局 || "-" },
    ],
    sections: [
      {
        title: "十二宫星曜",
        blocks: [
          {
            kind: "table" as const,
            content: {
              head: ["宫位", "主星"],
              rows: Object.entries(stars).map(([gong, s]: any) => [
                gong,
                Array.isArray(s) && s.length ? s.join(" · ") : "空宫",
              ]),
            },
          },
        ],
      },
      ...(result.格局 && result.格局.length
        ? [{
            title: "格局显现",
            blocks: (result.格局 as string[]).map((p: string) => ({ kind: "list" as const, content: [p] })),
          }]
        : []),
      ...(result.大运方向
        ? [{ title: "大运方向", blocks: [{ kind: "text", content: result.大运方向 } as any] }]
        : []),
    ],
    endNote: "AI 紫微斗数 · 十二宫 · 紫微星曜",
  };
}

function qimenReport(r: ReportInput, input: PersonView): BKingReport {
  const result = r.result || {};
  const text = result.formatted || "";
  const lines = typeof text === "string" ? text.split("\n").filter(Boolean) : [];
  return {
    serviceType: "奇门遁甲报告",
    serviceTypeEn: "QI MEN · 奇门遁甲",
    nickname: input.name || "-",
    reportNo: genReportNo(),
    meta: [
      { label: "起局时间", value: `${input.solarDate} ${input.gender}` },
    ],
    summary: [
      { label: "起局", text: lines.slice(0, 4).join(" · ") || "-" },
    ],
    sections: [
      {
        title: "奇门全盘",
        blocks: [
          { kind: "text", content: text || "（盘局文字较长，建议查看完整盘）" },
        ],
      },
    ],
    endNote: "AI 奇门遁甲 · 九宫八门 · 择时决策",
  };
}

function tianjiReport(r: ReportInput, input: PersonView): BKingReport {
  const result = r.result || {};
  const members: PersonView[] = Array.isArray(result.members) && result.members.length
    ? result.members.map((m: any) => ({
        name: m.name || "",
        gender: m.gender || "",
        solarDate: `${m.solar_date || ""} ${m.birth_time || ""}`,
      }))
    : [input];

  // 每个成员的表头
  const memberRows = members.map((m, i) => {
    const p = (result.members?.[i]) || {};
    return [`第${i + 1}人`, m.name, m.gender, m.solarDate];
  });

  const syn = result.synastry || {};

  return {
    serviceType: "天机合盘报告",
    serviceTypeEn: "TIAN JI · 天地人合",
    nickname: members.length > 1 ? members.map((m) => m.name).join(" + ") : input.name || "-",
    reportNo: genReportNo(),
    meta: [
      { label: "合盘人数", value: `${members.length} 人` },
    ],
    summary: [
      { label: "合盘模式", text: members.length > 1 ? "双人合盘 · 五行/生肖/日主/星座全维度" : "单人命盘 · 全维度解析" },
      ...(syn.total ? [{ label: "合盘评分", text: `${syn.total} / ${syn.max_possible || 100} · ${syn.rating || ""}` }] : []),
    ],
    sections: [
      {
        title: "成员信息",
        blocks: [
          {
            kind: "table" as const,
            content: { head: ["序", "姓名", "性别", "出生"], rows: memberRows },
          },
        ],
      },
      ...(syn.scores && Object.keys(syn.scores).length
        ? [{
            title: "合盘维度评分",
            blocks: [
              {
                kind: "table" as const,
                content: {
                  head: ["维度", "得分"],
                  rows: Object.entries(syn.scores).map(([k, v]: any) => [
                    ({ wuxing_balance: "五行平衡", wuxing_complete: "五行补全", shengxiao: "生肖", rizhu: "日柱", zodiac: "星座", chenggu: "称骨", wuge: "姓名五格" } as any)[k] || k,
                    String(v ?? "-"),
                  ]),
                },
              },
            ],
          }]
        : []),
      ...(result.members?.length ? [
        {
          title: "详盘输出",
          blocks: (result.members as any[]).map((m, i) => ({
            kind: "text" as const,
            content: `【${members[i]?.name || "第" + (i + 1) + "人"}】八字 ${(Array.isArray(m.bazi) ? m.bazi : []).join(" ")} · 日主 ${m.day_gan || "-"} · 生肖 ${m.shengxiao || "-"}`,
          })),
        },
      ] : []),
    ],
    endNote: "AI 天机 · 三界合一 · 缘分指引",
  };
}

/** 统一入口：service → BKingReport */
export function buildReport(r: ReportInput): BKingReport {
  const input: PersonView = {
    name: r.nickname || "缘主",
    gender: guessGender(r.result?.members?.[0] || r.result),
    solarDate: `${r.result?.members?.[0]?.solar_date || r.result?.solar_date || ""} ${r.result?.members?.[0]?.birth_time || ""}`.trim() || "—",
  };

  switch (r.service) {
    case "bazi": return baziReport(r, input);
    case "zwei": return zweiReport(r, input);
    case "qimen": return qimenReport(r, input);
    case "tianji": return tianjiReport(r, input);
    default:
      // tarot / astrology 走前端本地生成器
      throw new Error(`service "${r.service}" 暂不支持服务端 PDF`);
  }
}