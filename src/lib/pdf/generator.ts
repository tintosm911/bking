// BKing PDF 生成器 — 黑金玄学风格（已迁移到 template.ts 基座）
// 各门类函数在此基于统一基座组织，报告结构/封面/摘要/页眉页脚由基座统一处理。
import { generateReport, genReportNo, type BKingReport } from "./template";

export { PDF_DIR } from "./template";

// ─── 生成批八字报告 PDF ───
export function generateBaziReport(params: {
  nickname: string;
  birthday: string;
  birthHour: string;
  gender: string;
  baziResult: {
    heavenlyStems: string[];
    earthlyBranches: string[];
    fiveElements: string;
    dayMaster: string;
    luckPillars: { age: number; stem: string; branch: string; element: string }[];
    summary: string;
    analysis: string;
    advice: string;
  };
}): Promise<string> {
  const luck = params.baziResult.luckPillars || [];
  const stems = params.baziResult.heavenlyStems || [];
  const branches = params.baziResult.earthlyBranches || [];
  const pillars: string[][] = [0, 1, 2, 3].map((i) => [
    ["年", "月", "日", "时"][i],
    stems[i] || "",
    branches[i] || "",
  ]);

  const report: BKingReport = {
    serviceType: "八字命理报告",
    serviceTypeEn: "BAZI · 八字命理",
    nickname: params.nickname || "未填写",
    reportNo: genReportNo(),
    meta: [
      { label: "出生", value: `${params.birthday} ${params.birthHour}` },
      { label: "性别", value: params.gender === "male" ? "男" : "女" },
    ],
    summary: [
      { label: "日主", text: `${params.baziResult.dayMaster || "-"} · 日主为命之根基，定五行喜忌` },
      { label: "五行", text: params.baziResult.fiveElements || "-" },
      { label: "命理总览", text: params.baziResult.summary || "-" },
      { label: "开运方向", text: params.baziResult.advice || "-" },
    ],
    sections: [
      {
        title: "八字排盘",
        blocks: [
          {
            kind: "table",
            content: {
              head: ["柱", "天干", "地支"],
              rows: pillars.map((p) => [`${p[0]}柱`, p[1], p[2]]),
            },
          },
          {
            kind: "text",
            content: `五行属性：${params.baziResult.fiveElements || "-"}；日主：${params.baziResult.dayMaster || "-"}。`,
          },
        ],
      },
      {
        title: "大运走势",
        blocks: [
          {
            kind: "table",
            content: {
              head: ["起运年龄", "天干", "地支", "五行"],
              rows: luck.map((p) => [`${p.age}岁`, p.stem, p.branch, p.element]),
            },
          },
        ],
      },
    ],
    endNote: "AI 玄学命理 · 智能预测 · 指点迷津",
  };

  if (params.baziResult.summary) {
    report.sections.push({ title: "命理总论", blocks: [{ kind: "text", content: params.baziResult.summary }] });
  }
  if (params.baziResult.advice) {
    report.sections.push({ title: "开运建议", blocks: [{ kind: "advice", content: params.baziResult.advice.split(/[。；\n]+/).filter(Boolean) }] });
  }
  if (params.baziResult.analysis) {
    report.sections.push({ title: "详析", blocks: [{ kind: "text", content: params.baziResult.analysis }] });
  }

  return generateReport(report);
}

// ─── 生成塔罗占卜报告 PDF ───
export function generateTarotReport(params: {
  nickname: string;
  spread: string;
  cards: { name: string; nameEn: string; reversed: boolean; meaning: string }[];
  interpretation: string;
}): Promise<string> {
  const report: BKingReport = {
    serviceType: "塔罗占卜报告",
    serviceTypeEn: "TAROT · 塔罗占卜",
    nickname: params.nickname || "未填写",
    reportNo: genReportNo(),
    meta: [{ label: "牌阵", value: params.spread }],
    summary: params.cards.map((c, i) => ({
      label: `牌${i + 1} · ${c.name}`, 
      text: `${c.reversed ? "逆位·警示" : "正位·指引"} — ${c.meaning}`,
    })),
    sections: [],
    endNote: "塔罗指引 · 倾听内心 · 把握当下",
  };

  // 牌面小节
  report.sections.push({
    title: "牌面解读",
    blocks: params.cards.map((c, i) => ({
      kind: "text",
      content: `【${i + 1}】${c.name}（${c.nameEn}）· ${c.reversed ? "逆位" : "正位"}\n${c.meaning}`,
    })),
  });

  if (params.interpretation) {
    report.sections.push({ title: "综合解读", blocks: [{ kind: "text", content: params.interpretation }] });
    report.sections.push({
      title: "行动指引",
      blocks: [{ kind: "advice", content: params.interpretation.split(/[。；\n]+/).filter(Boolean).slice(0, 3) }],
    });
  }

  return generateReport(report);
}