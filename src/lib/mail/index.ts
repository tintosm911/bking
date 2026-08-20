// BKing 邮件发送模块
// 配置通过环境变量注入，避免硬编码

import nodemailer from "nodemailer";
import fs from "fs";

interface MailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName: string;
}

function getConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port: port || 465,
    user,
    pass,
    from: process.env.SMTP_FROM || user,
    fromName: process.env.SMTP_FROM_NAME || "BKing 玄学命理",
  };
}

let transportInstance: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter | null {
  const config = getConfig();
  if (!config) return null;
  if (transportInstance) return transportInstance;

  transportInstance = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });

  return transportInstance;
}

const subjectMap: Record<string, string> = {
  bazi: "BKing 八字命理报告",
  tarot: "BKing 塔罗占卜报告",
  qimen: "BKing 奇门遁甲分析报告",
  zwei: "BKing 紫微斗数报告",
};

// ─── 发送报告/PDF ───
export async function sendReport(params: {
  to: string;
  subject?: string;
  reportType: string;
  pdfPath: string;
  nickname?: string;
}): Promise<boolean> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[Mail] SMTP not configured, skipping email");
    return false;
  }

  const pdfBuffer = fs.readFileSync(params.pdfPath);

  try {
    await transport.sendMail({
      from: `"${getConfig()?.fromName || "BKing"}" <${getConfig()?.from || "noreply@bking.one"}>`,
      to: params.to,
      subject: params.subject || subjectMap[params.reportType] || "BKing 玄学命理报告",
      html: `
        <div style="background:#0d0d0d;color:#f0f0f0;font-family:sans-serif;padding:40px 20px;">
          <div style="max-width:600px;margin:0 auto;border:1px solid rgba(212,154,26,0.2);border-radius:12px;padding:30px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:28px;font-weight:bold;color:#d49a1a;">BKing</div>
              <div style="font-size:12px;color:#888;margin-top:4px;">玄学命理 · 智能预测</div>
            </div>
            <hr style="border:none;border-top:1px solid rgba(212,154,26,0.15);margin:20px 0;" />
            <p style="font-size:14px;line-height:1.6;">
              ${params.nickname ? `${params.nickname}，您好！` : "您好！"}
            </p>
            <p style="font-size:14px;line-height:1.6;">
              您请求的${subjectMap[params.reportType] || "命理报告"}已生成完毕，请查收附件。
            </p>
            <p style="font-size:12px;color:#888;margin-top:20px;">
              感谢您使用 BKing 玄学命理服务。
            </p>
            <hr style="border:none;border-top:1px solid rgba(212,154,26,0.15);margin:20px 0;" />
            <div style="text-align:center;font-size:11px;color:#555;">
              BKing.one · AI 玄学命理平台<br />
              本报告由 AI 生成，仅供参考
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `${params.reportType}_report.pdf`,
          path: params.pdfPath,
          contentType: "application/pdf",
        },
      ],
    });
    return true;
  } catch (err) {
    console.error("[Mail] Send failed:", err);
    return false;
  }
}

// ─── 发送生日祝福 ───
export async function sendBirthdayGreeting(params: {
  to: string;
  nickname?: string;
  giftInfo?: string;
}): Promise<boolean> {
  const transport = getTransport();
  if (!transport) return false;

  try {
    await transport.sendMail({
      from: `"BKing" <${getConfig()?.from || "noreply@bking.one"}>`,
      to: params.to,
      subject: `🎂 ${params.nickname || "朋友"}，BKing 祝您生日快乐！`,
      html: `
        <div style="background:#0d0d0d;color:#f0f0f0;font-family:sans-serif;padding:40px 20px;">
          <div style="max-width:600px;margin:0 auto;border:1px solid rgba(212,154,26,0.2);border-radius:12px;padding:30px;text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">🎉</div>
            <div style="font-size:22px;font-weight:bold;color:#d49a1a;margin-bottom:8px;">
              生日快乐！
            </div>
            <div style="font-size:14px;color:#f0f0f0;margin-bottom:20px;">
              ${params.nickname || "朋友"}，BKing 愿您福运亨通、万事顺遂。
            </div>
            <hr style="border:none;border-top:1px solid rgba(212,154,26,0.15);margin:20px 0;" />
            ${params.giftInfo ? `
            <div style="font-size:13px;color:#ecc454;">
              🎁 生日礼物：${params.giftInfo}
            </div>
            ` : ""}
            <div style="font-size:11px;color:#555;margin-top:20px;">
              BKing.one · AI 玄学命理平台
            </div>
          </div>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("[Mail] Birthday greeting failed:", err);
    return false;
  }
}