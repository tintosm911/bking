// BKing PDF 模板基座 — 黑金玄学「圣旨」风格（五大门类通用）
// 设计：深色封面(星空) · 鎏金边框 · 专属编号 · 摘要卡片 · 小节编号(壹贰叁) · 开运建议 · 免责声明
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const PDF_DIR = path.join(process.cwd(), "data", "reports");

// ─── 字体加载 ───
const FONT_DIR = path.join(process.cwd(), "src", "lib", "pdf", "fonts");
const F = {
  serif: path.join(FONT_DIR, "NotoSerifSC-Regular.otf"),   // 宋体 正文（古籍感）
  serifBold: path.join(FONT_DIR, "NotoSerifSC-Bold.otf"),
  sans: path.join(FONT_DIR, "NotoSansSC-Regular.otf"),     // 黑体 封面/标题（硬朗权威）
  sansBold: path.join(FONT_DIR, "NotoSansSC-Bold.otf"),
};

// ─── 调色板 ───
const C = {
  gold: "#d49a1a",       // 鎏金
  goldLight: "#ecc454",  // 亮金
  goldDark: "#b07a14",   // 暗金
  bg: "#0d0d0d",         // 星空深黑
  bgCard: "#141414",     // 卡片底
  text: "#f0f0f0",       // 主文字
  muted: "#9a9a9a",      // 次级文字
  faint: "#666666",      // 弱文字
  accent: "#88ddff",     // 玄学灵光青
  danger: "#f87171",     // 逆位/警示红
  line: "#3a3a3a",       // 分隔线
};

function ensureDir() {
  if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });
}

// 鎏金渐变
function goldGrad(doc: any, x: number, y: number, w: number, h: number) {
  const g = doc.linearGradient(x, y, x + w, y);
  g.stop(0, C.goldDark).stop(0.5, C.goldLight).stop(1, C.gold);
  return g;
}

// 专属编号生成：BK-YYYYMMDD-XXXX
export function genReportNo() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `BK-${ymd}-${rand}`;
}

// 干支序号（中式小节编号）
const CN_NUMS = ["壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖", "拾"];

// ─── 内容契约：五大门类共用 ───
export interface BKingReport {
  serviceType: string;      // 服务类型（封面大字）
  serviceTypeEn: string;
  nickname: string;
  reportNo: string;         // 专属编号
  meta: { label: string; value: string }[];   // 封面元信息（出生/性别/牌阵等）
  summary: { label: string; text: string }[]; // 摘要页金框卡片
  sections: {              // 主体分析小节
    title: string;
    blocks: { kind: "text" | "table" | "list" | "advice"; content: any }[];
  }[];
  disclaimer?: string;      // 免责声明（默认给一句）
  endNote?: string;         // 尾页副语
}

// ─── 构建文档骨架 ───
function buildDoc(report: BKingReport) {
  return new PDFDocument({
    size: "A4",
    margins: { top: 100, bottom: 60, left: 46, right: 46 },
    info: {
      Title: `BKing ${report.serviceType}报告`,
      Author: "BKing.one",
      Subject: `${report.serviceType} - ${report.nickname}`,
      Keywords: `BKing,${report.serviceType},${report.reportNo}`,
      CreationDate: new Date(),
    },
  });
}

// ─── 全页深色底 ───
function darkPage(doc: any) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg);
}

// ─── 页眉（主体页） ───
function header(doc: any, title: string) {
  doc.rect(46, 30, doc.page.width - 92, 1).fill(C.gold);
  doc.font(F.sansBold).fontSize(16).fillColor(C.gold).text("BKing", 46, 40);
  doc.font(F.sans).fontSize(8).fillColor(C.faint).text("玄学命理 · 智能预测", 46, 60);
  doc.font(F.sansBold).fontSize(14).fillColor(C.goldLight)
    .text(title, doc.page.width - 46 - doc.widthOfString(title), 42, { align: "right" });
  doc.moveTo(46, 78).lineTo(doc.page.width - 46, 78)
    .strokeColor(goldGrad(doc, 46, 78, doc.page.width - 92, 0)).stroke();
}

// ─── 页脚 ───
function footer(doc: any, pageNum: number, reportNo: string) {
  doc.font(F.sans).fontSize(7).fillColor(C.faint)
    .text(`BKing.one · ${reportNo} · 第 ${pageNum} 页 / 末页`, 46, doc.page.height - 40, { align: "center" });
}

function pageNumOf(doc: any) {
  return doc.pageNumber;
}

// ─── 封面页 ───
function coverPage(doc: any, r: BKingReport) {
  darkPage(doc);
  const W = doc.page.width, H = doc.page.height, cx = W / 2;

  // 顶部金线组
  doc.rect(cx - 140, 60, 280, 1).fill(C.gold);
  doc.rect(cx - 170, 84, 340, 0.5).fill(C.goldDark);

  // 品牌
  doc.font(F.serifBold).fontSize(64).fillColor(C.gold).text("BKing", cx, 120, { align: "center", width: 0 });
  doc.font(F.sans).fontSize(10).fillColor(C.muted).text("玄 学 命 理 · 智 能 预 测", cx, 196, { align: "center", width: 0 });

  // 中心区（服务类型大字 + 编号）
  const midY = H / 2 - 90;
  doc.rect(cx - 130, midY, 260, 1).fill(goldGrad(doc, cx - 130, midY, 260, 0));
  doc.font(F.sansBold).fontSize(30).fillColor(C.goldLight)
    .text(r.serviceType, cx, midY + 18, { align: "center", width: 0 });
  doc.font(F.sans).fontSize(12).fillColor(C.muted)
    .text(r.serviceTypeEn, cx, midY + 58, { align: "center", width: 0 });
  doc.font(F.sans).fontSize(9).fillColor(C.faint)
    .text(`报告编号 ${r.reportNo}`, cx, midY + 86, { align: "center", width: 0 });
  doc.rect(cx - 130, midY + 112, 260, 1).fill(goldGrad(doc, cx - 130, midY + 112, 260, 0));

  // 用户信息
  let y = midY + 148;
  doc.font(F.sansBold).fontSize(13).fillColor(C.text)
    .text(`致 · ${r.nickname || "缘主"}`, cx, y, { align: "center", width: 0 });
  y += 26;
  r.meta.forEach((m) => {
    doc.font(F.sans).fontSize(9).fillColor(C.muted)
      .text(`${m.label}: ${m.value}`, cx, y, { align: "center", width: 0 });
    y += 15;
  });

  // 底部金线组
  doc.rect(cx - 170, H - 90, 340, 0.5).fill(C.goldDark);
  doc.rect(cx - 140, H - 66, 280, 1).fill(C.gold);
  doc.font(F.sans).fontSize(7).fillColor(C.faint)
    .text("BKing.one · AI 玄学命理平台", cx, H - 52, { align: "center", width: 0 });
}

// ─── 摘要页（金框卡片） ───
function summaryPage(doc: any, r: BKingReport) {
  doc.addPage();
  darkPage(doc);
  header(doc, "一 览 概 要");

  let y = 100;
  r.summary.forEach((s, i) => {
    // 金边卡片
    const cardH = 64;
    doc.roundedRect(46, y, doc.page.width - 92, cardH, 6)
      .lineWidth(0.8).strokeColor(C.goldDark).stroke();
    doc.rect(46, y, 3, cardH).fill(C.gold); // 左侧金条

    doc.font(F.sansBold).fontSize(11).fillColor(C.goldLight)
      .text(s.label, 60, y + 12);
    doc.font(F.serif).fontSize(9).fillColor(C.text)
      .text(s.text, 60, y + 32, { width: doc.page.width - 120 });
    y += cardH + 14;
  });

  footer(doc, pageNumOf(doc), r.reportNo);
}

// ─── 主体小节页 ───
function sectionPages(doc: any, r: BKingReport, startFooterPage: number) {
  r.sections.forEach((sec, si) => {
    doc.addPage();
    darkPage(doc);
    header(doc, `${CN_NUMS[si] || si + 1} · ${sec.title}`);

    let y = 100;
    sec.blocks.forEach((b) => {
      if (b.kind === "text") {
        doc.font(F.serif).fontSize(10).fillColor(C.text)
          .text(b.content, 46, y, { width: doc.page.width - 92, lineGap: 6 });
        y += doc.heightOfString(b.content, { width: doc.page.width - 92 }) + 20;
      }
      else if (b.kind === "list") {
        (b.content as string[]).forEach((item, i) => {
          doc.font(F.serif).fontSize(9).fillColor(C.text)
            .text(`· ${item}`, 46, y, { width: doc.page.width - 92 });
          y += 18;
        });
        y += 8;
      }
      else if (b.kind === "advice") {
        // 开运建议：青字强调 + 金字前缀
        const lines = (b.content as string[]);
        lines.forEach((line) => {
          doc.font(F.sansBold).fontSize(9).fillColor(C.gold).text("开运", 46, y);
          const w = doc.widthOfString("开运", { font: F.sansBold, size: 9 }) + 8;
          doc.font(F.serif).fontSize(9).fillColor(C.accent)
            .text(line, 46 + w, y, { width: doc.page.width - 92 - w });
          y += 18;
        });
        y += 8;
      }
      else if (b.kind === "table") {
        const tbl = b.content as { head?: string[]; rows: string[][] };
        const startX = 46, colW = (doc.page.width - 92) / (tbl.head?.length || tbl.rows[0]?.length || 4);
        // 表头
        if (tbl.head) {
          doc.font(F.sansBold).fontSize(8).fillColor(C.goldLight);
          tbl.head.forEach((h, ci) => doc.text(h, startX + ci * colW, y, { width: colW - 6 }));
          y += 16;
        }
        // 行
        tbl.rows.forEach((row, ri) => {
          doc.font(F.serif).fontSize(8).fillColor(C.text);
          row.forEach((cell, ci) => doc.text(cell, startX + ci * colW, y, { width: colW - 6 }));
          y += 18;
          if (ri < tbl.rows.length - 1) {
            doc.moveTo(startX, y - 9).lineTo(doc.page.width - 46, y - 9)
              .strokeColor(C.line).opacity(0.4).stroke().opacity(1);
          }
        });
        y += 14;
      }
    });

    footer(doc, pageNumOf(doc), r.reportNo);
  });
}

// ─── 尾页（免责声明 + 收尾） ───
function endPage(doc: any, r: BKingReport) {
  doc.addPage();
  darkPage(doc);
  const cx = doc.page.width / 2;
  const cy = doc.page.height / 2 - 60;

  doc.rect(cx - 120, cy, 240, 1).fill(C.gold);
  doc.font(F.serifBold).fontSize(16).fillColor(C.gold)
    .text("天机已示 · 缘法随行", cx, cy + 12, { align: "center", width: 0 });
  doc.font(F.sans).fontSize(9).fillColor(C.muted)
    .text(r.endNote || "AI 玄学命理 · 智能预测 · 指点迷津", cx, cy + 40, { align: "center", width: 0 });
  doc.rect(cx - 120, cy + 62, 240, 1).fill(C.gold);

  // 免责声明
  const discY = cy + 110;
  doc.font(F.sans).fontSize(7).fillColor(C.faint)
    .text("免责声明", cx, discY, { align: "center", width: 0 });
  doc.font(F.sans).fontSize(6.5).fillColor(C.faint)
    .text(
      r.disclaimer || "本报告由 AI 依据传统命理模型自动生成，仅供文化娱乐与自我参考，不构成任何医疗、法律、投资及重大决策建议。玄学之趣在于明心见性，命运终究掌握在自己手中。",
      cx - 170, discY + 14,
      { width: 340, align: "center", lineGap: 4 }
    );
}

// ─── 主入口 ───
export function generateReport(report: BKingReport): Promise<string> {
  ensureDir();
  const filename = `${report.serviceType.replace(/\s/g, "")}_${report.nickname || "unknown"}_${Date.now()}.pdf`;
  const filepath = path.join(PDF_DIR, filename);

  return new Promise((resolve, reject) => {
    try {
      const doc = buildDoc(report);
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      coverPage(doc, report);
      if (report.summary.length) summaryPage(doc, report);
      sectionPages(doc, report, 2);
      endPage(doc, report);

      doc.end();
      stream.on("finish", () => resolve(filepath));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}

export { PDF_DIR, C, F, CN_NUMS };