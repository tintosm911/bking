// BKing PDF 生成器 — 黑金玄学风格
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const PDF_DIR = path.join(process.cwd(), "data", "reports");

function ensureDir() {
  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
  }
}

// 颜色常量
const GOLD = "#d49a1a";
const GOLD_LIGHT = "#ecc454";
const GOLD_DARK = "#b07a14";
const BG_DARK = "#0d0d0d";
const TEXT_MAIN = "#f0f0f0";
const TEXT_MUTED = "#888888";
const ACCENT = "#88ddff";

// 黑金渐变色辅助
function goldGradient(doc: any, x: number, y: number, w: number, h: number) {
  const grad = doc.linearGradient(x, y, x + w, y);
  grad.stop(0, GOLD_DARK).stop(0.5, GOLD_LIGHT).stop(1, GOLD);
  return grad;
}

// ─── 通用 BKing 报告页眉 ───
function addHeader(doc: any, title: string) {
  // 顶部金线
  doc.rect(40, 30, doc.page.width - 80, 1).fill(GOLD);

  // 品牌
  doc.fontSize(16).font("Helvetica-Bold")
    .fillColor(GOLD)
    .text("BKing", 40, 40);

  doc.fontSize(8).font("Helvetica")
    .fillColor(TEXT_MUTED)
    .text("玄学命理 · 智能预测", 40, 60);

  // 标题 - 右侧
  doc.fontSize(14).font("Helvetica-Bold")
    .fillColor(GOLD_LIGHT)
    .text(title, doc.page.width - 40 - doc.widthOfString(title), 42, { align: "right" });

  // 分隔线
  doc.moveTo(40, 78).lineTo(doc.page.width - 40, 78)
    .strokeColor(goldGradient(doc, 40, 78, doc.page.width - 80, 0))
    .stroke();
}

// ─── 页脚 ───
function addFooter(doc: any, pageNum: number) {
  doc.fontSize(7).font("Helvetica")
    .fillColor(TEXT_MUTED)
    .text(`BKing.one · 第 ${pageNum} 页`, 40, doc.page.height - 40, { align: "center" });
}

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
  ensureDir();
  const filename = `bazi_${params.nickname || "unknown"}_${Date.now()}.pdf`;
  const filepath = path.join(PDF_DIR, filename);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 100, bottom: 60, left: 40, right: 40 },
        info: {
          Title: "BKing 八字命理报告",
          Author: "BKing.one",
          Subject: `八字分析 - ${params.nickname}`,
        },
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // ─── 封面页 ───
      // 深色背景
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_DARK);

      // 金色装饰线
      doc.rect(60, doc.page.height / 2 - 80, doc.page.width - 120, 1).fill(GOLD);
      doc.rect(80, doc.page.height / 2 - 60, doc.page.width - 160, 0.5).fill(GOLD_DARK);

      // 品牌
      doc.fontSize(36).font("Helvetica-Bold")
        .fillColor(GOLD)
        .text("BKing", 0, doc.page.height / 2 - 120, { align: "center", width: doc.page.width });

      doc.fontSize(12).font("Helvetica")
        .fillColor(TEXT_MUTED)
        .text("八 字 命 理 报 告", 0, doc.page.height / 2 - 70, { align: "center", width: doc.page.width });

      // 用户信息
      doc.fontSize(11).font("Helvetica")
        .fillColor(TEXT_MAIN)
        .text(`姓名: ${params.nickname || "未填写"}`, 0, doc.page.height / 2 + 30, { align: "center", width: doc.page.width });

      doc.fontSize(9).fillColor(TEXT_MUTED)
        .text(`出生: ${params.birthday} ${params.birthHour}`, 0, doc.page.height / 2 + 50, { align: "center", width: doc.page.width })
        .text(`性别: ${params.gender === "male" ? "男" : "女"}`, 0, doc.page.height / 2 + 65, { align: "center", width: doc.page.width });

      // 底部金线
      doc.rect(80, doc.page.height - 80, doc.page.width - 160, 0.5).fill(GOLD_DARK);
      doc.rect(60, doc.page.height - 60, doc.page.width - 120, 1).fill(GOLD);

      doc.fontSize(7).fillColor(TEXT_MUTED)
        .text("BKing.one · AI 玄学命理平台", 0, doc.page.height - 40, { align: "center", width: doc.page.width });

      // ─── 第二页：八字排盘 ───
      doc.addPage();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_DARK);
      addHeader(doc, "八字排盘");

      let y = 95;

      // 天干地支
      doc.fontSize(10).font("Helvetica-Bold").fillColor(GOLD)
        .text("四柱八字", 40, y);
      y += 20;

      const labels = ["年柱", "月柱", "日柱", "时柱"];
      doc.fontSize(11).font("Helvetica").fillColor(TEXT_MAIN);
      labels.forEach((label, i) => {
        const x = 40 + i * 90;
        doc.text(label, x, y, { width: 80, align: "center" });
        if (params.baziResult.heavenlyStems && params.baziResult.heavenlyStems[i]) {
          doc.fontSize(14).font("Helvetica-Bold")
            .fillColor(GOLD_LIGHT)
            .text(params.baziResult.heavenlyStems[i], x, y + 16, { width: 80, align: "center" });
          doc.fontSize(14).font("Helvetica")
            .fillColor(GOLD)
            .text(params.baziResult.earthlyBranches[i], x, y + 34, { width: 80, align: "center" });
        }
      });

      y += 60;

      // 五行
      doc.fontSize(10).font("Helvetica-Bold").fillColor(GOLD)
        .text("五行分析", 40, y);
      y += 18;
      doc.fontSize(10).font("Helvetica").fillColor(TEXT_MAIN)
        .text(`五行属性: ${params.baziResult.fiveElements}`, 40, y);
      y += 16;
      doc.fontSize(10).fillColor(TEXT_MUTED)
        .text(`日主: ${params.baziResult.dayMaster}`, 40, y);

      y += 30;

      // 运势
      doc.fontSize(10).font("Helvetica-Bold").fillColor(GOLD)
        .text("大运走势", 40, y);
      y += 18;

      const luck = params.baziResult.luckPillars || [];
      luck.forEach((pillar, i) => {
        const x = 40 + (i % 4) * 110;
        const rowY = y + Math.floor(i / 4) * 28;
        doc.fontSize(9).font("Helvetica").fillColor(TEXT_MAIN)
          .text(`${pillar.age}岁: ${pillar.stem}${pillar.branch}`, x, rowY, { width: 100 });
        doc.fontSize(7).fillColor(TEXT_MUTED)
          .text(pillar.element, x, rowY + 12, { width: 100 });
      });
      y += Math.ceil(luck.length / 4) * 28 + 20;

      // 总结与建议
      if (params.baziResult.summary) {
        doc.fontSize(10).font("Helvetica-Bold").fillColor(GOLD)
          .text("命理总论", 40, y);
        y += 18;
        doc.fontSize(9).font("Helvetica").fillColor(TEXT_MAIN)
          .text(params.baziResult.summary, 40, y, { width: doc.page.width - 80 });
        y += doc.heightOfString(params.baziResult.summary, { width: doc.page.width - 80 }) + 20;
      }

      if (params.baziResult.advice) {
        doc.fontSize(10).font("Helvetica-Bold").fillColor(GOLD)
          .text("开运建议", 40, y);
        y += 18;
        doc.fontSize(9).font("Helvetica").fillColor(ACCENT)
          .text(params.baziResult.advice, 40, y, { width: doc.page.width - 80 });
        y += doc.heightOfString(params.baziResult.advice, { width: doc.page.width - 80 }) + 20;
      }

      // 页脚
      addFooter(doc, 2);

      // ─── 第三页：详细分析（如需要） ───
      if (params.baziResult.analysis) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_DARK);
        addHeader(doc, "详细分析");

        doc.fontSize(9).font("Helvetica").fillColor(TEXT_MAIN)
          .text(params.baziResult.analysis, 40, 95, { width: doc.page.width - 80 });
        addFooter(doc, 3);
      }

      // 尾页金线
      doc.addPage();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_DARK);
      const cy = doc.page.height / 2 - 30;
      doc.rect(60, cy, doc.page.width - 120, 1).fill(GOLD);
      doc.fontSize(14).font("Helvetica-Bold").fillColor(GOLD)
        .text("BKing", 0, cy + 15, { align: "center", width: doc.page.width });
      doc.fontSize(9).font("Helvetica").fillColor(TEXT_MUTED)
        .text("AI 玄学命理 · 智能预测 · 指点迷津", 0, cy + 35, { align: "center", width: doc.page.width });
      doc.rect(60, cy + 60, doc.page.width - 120, 1).fill(GOLD);

      doc.end();

      stream.on("finish", () => resolve(filepath));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}

// ─── 生成塔罗占卜报告 PDF ───
export function generateTarotReport(params: {
  nickname: string;
  spread: string;
  cards: { name: string; nameEn: string; reversed: boolean; meaning: string }[];
  interpretation: string;
}): Promise<string> {
  ensureDir();
  const filename = `tarot_${params.nickname || "unknown"}_${Date.now()}.pdf`;
  const filepath = path.join(PDF_DIR, filename);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 100, bottom: 60, left: 40, right: 40 },
        info: { Title: "BKing 塔罗占卜报告", Author: "BKing.one", Subject: `塔罗解读 - ${params.nickname}` },
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // 封面
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_DARK);
      doc.rect(60, doc.page.height / 2 - 80, doc.page.width - 120, 1).fill(GOLD);
      doc.rect(80, doc.page.height / 2 - 60, doc.page.width - 160, 0.5).fill(GOLD_DARK);

      doc.fontSize(36).font("Helvetica-Bold")
        .fillColor(GOLD)
        .text("BKing", 0, doc.page.height / 2 - 120, { align: "center", width: doc.page.width });
      doc.fontSize(12).font("Helvetica")
        .fillColor(TEXT_MUTED)
        .text("塔 罗 占 卜 报 告", 0, doc.page.height / 2 - 70, { align: "center", width: doc.page.width });
      doc.fontSize(11).font("Helvetica").fillColor(TEXT_MAIN)
        .text(`姓名: ${params.nickname || "未填写"}`, 0, doc.page.height / 2 + 30, { align: "center", width: doc.page.width })
        .text(`牌阵: ${params.spread}`, 0, doc.page.height / 2 + 50, { align: "center", width: doc.page.width });
      doc.rect(80, doc.page.height - 80, doc.page.width - 160, 0.5).fill(GOLD_DARK);
      doc.rect(60, doc.page.height - 60, doc.page.width - 120, 1).fill(GOLD);
      doc.fontSize(7).fillColor(TEXT_MUTED)
        .text("BKing.one · AI 玄学命理平台", 0, doc.page.height - 40, { align: "center", width: doc.page.width });

      // 第二页：牌面
      doc.addPage();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_DARK);
      addHeader(doc, "牌面解读");

      let y = 95;
      params.cards.forEach((card, i) => {
        const status = card.reversed ? "逆位" : "正位";
        doc.fontSize(10).font("Helvetica-Bold").fillColor(GOLD)
          .text(`牌 ${i + 1}: ${card.name} (${card.nameEn})`, 40, y);
        doc.fontSize(8).font("Helvetica").fillColor(status === "逆位" ? "#f87171" : TEXT_MUTED)
          .text(status, 40, y + 14);
        doc.fontSize(9).font("Helvetica").fillColor(TEXT_MAIN)
          .text(card.meaning, 40, y + 28, { width: doc.page.width - 80 });
        y += doc.heightOfString(card.meaning, { width: doc.page.width - 80 }) + 50;

        // 分隔
        if (i < params.cards.length - 1) {
          doc.moveTo(40, y - 10).lineTo(doc.page.width - 40, y - 10)
            .strokeColor(GOLD_DARK).opacity(0.3).stroke().opacity(1);
        }
      });

      addFooter(doc, 2);

      // 第三页：解读
      if (params.interpretation) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_DARK);
        addHeader(doc, "综合解读");
        doc.fontSize(9).font("Helvetica").fillColor(TEXT_MAIN)
          .text(params.interpretation, 40, 95, { width: doc.page.width - 80 });
        addFooter(doc, 3);
      }

      doc.end();
      stream.on("finish", () => resolve(filepath));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}

export { PDF_DIR };