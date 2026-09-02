// 客户端下载 PDF 报告
export async function downloadReport(
  service: "bazi" | "zwei" | "qimen" | "tianji",
  nickname: string,
  result: any
): Promise<void> {
  const data = await fetch("/api/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service, nickname, result }),
  });

  if (!data.ok) {
    const err = await data.json().catch(() => null);
    throw new Error(err?.error || `PDF 生成失败 (${data.status})`);
  }

  const blob = await data.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${service}_${nickname || "缘主"}_报告.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}