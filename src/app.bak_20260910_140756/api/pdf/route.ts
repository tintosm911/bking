import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { buildReport } from "@/lib/pdf/report_mapper";
import { generateReport } from "@/lib/pdf/template";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, nickname, result, meta } = body || {};

    if (!service || !result) {
      return NextResponse.json(
        { error: "缺少必填字段: service, result" },
        { status: 400 }
      );
    }

    const report = buildReport({
      service,
      nickname: nickname || "缘主",
      result,
      meta: meta || {},
    });

    // 生成 PDF 到 data/reports/
    const filepath = await generateReport(report);
    const buf = fs.readFileSync(filepath);

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(report.serviceType + "_" + report.nickname)}.pdf"`,
        "Content-Length": String(buf.length),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `PDF 生成失败: ${err.message || "未知错误"}` },
      { status: 500 }
    );
  }
}