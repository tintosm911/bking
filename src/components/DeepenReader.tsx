"use client";

import { useMemo, useState } from "react";

/**
 * 免费精华版 + 付费完整报告 分层阅读组件
 * - 免费：只展示前 2 个模块（命局总论 + 遇事），后续截断 → 挂解锁
 * - 解锁后：展开全文（完整报告）
 * - 支持 TTS 全文朗读（完整版）
 * - 「下载 PDF 报告」复用 /api/pdf route（打印/留存/送礼）
 */

const LOCK_AFTER_MODULES = 2; // 免费可见模块数

// 分割详批文本为模块段（按 【标题】 切分；标题前的导语并入第一个模块）
function splitModules(text: string): { title: string; body: string }[] {
  if (!text) return [];
  // 分离所有模块标题
  const titles: { title: string; start: number }[] = [];
  const regex = /【([^】]+)】/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    titles.push({ title: m[1], start: m.index });
  }
  if (titles.length === 0) return [{ title: "", body: text }];

  const parts: { title: string; body: string }[] = [];
  titles.forEach((t, i) => {
    const bodyStart = t.start + t.title.length + 2; // 跳过 【 标题 】
    const bodyEnd = i + 1 < titles.length ? titles[i + 1].start : text.length;
    parts.push({ title: t.title, body: text.slice(bodyStart, bodyEnd) });
  });
  // 标题前的导语（如【先摆盘】前若有文字）合并进第一个模块
  if (titles[0].start > 0) {
    parts[0] = { title: parts[0].title, body: text.slice(0, titles[0].start) + parts[0].body };
  }
  return parts;
}

interface DeepenReaderProps {
  text: string;              // 完整详批文本
  service: string;           // 术数名（用于 PDF）
  nickname?: string;
  meta?: Record<string, unknown>;
}

export default function DeepenReader({ text, service, nickname, meta }: DeepenReaderProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // 切分为模块
  const modules = useMemo(() => splitModules(text), [text]);
  const freeModules = modules.slice(0, LOCK_AFTER_MODULES);
  const lockedModules = modules.slice(LOCK_AFTER_MODULES);
  const hasLocked = lockedModules.length > 0;

  // 完整报告
  const fullText = text;

  // 下载 PDF 完整报告
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          nickname: nickname || "缘主",
          result: { _deepen: fullText },
          meta: meta || {},
        }),
      });
      if (!res.ok) throw new Error((await res.text()) || "下载失败");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${service}_${nickname || "缘主"}_详批报告.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`PDF 生成失败：${e.message || "未知错误"}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
      {/* 免费精华版 */}
      {!unlocked ? (
        <div>
          <div className="text-xs text-gold/70 mb-2 tracking-wider">玄机大师 · 面对面详批（精华版）</div>
          {freeModules.map((m, i) => (
            <div key={i} className="mb-3">
              {m.title && <div className="text-gold font-serif font-semibold mb-1">【{m.title}】</div>}
              <div className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">{m.body}</div>
            </div>
          ))}

          {/* 截断提示 */}
          {hasLocked && (
            <div className="mt-4">
              <div className="rounded-lg border border-gold/30 bg-dark-700/60 p-3 text-center">
                <div className="text-sm text-gold mb-1">🔒 后续内容已锁定</div>
                <div className="text-xs text-gray-300 mb-3">
                  「遇人 / 饮食 / 事业 / 投资 / 情感 / 今日叮嘱」完整解读
                  <br />＋ 可打印·留存·送礼的完整报告
                </div>
                <button
                  onClick={() => setPayOpen(true)}
                  className="btn-gold px-5 py-2 rounded-xl text-sm font-semibold"
                >
                  解锁完整报告
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 已解锁：完整报告 */
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gold/70 tracking-wider">玄机大师 · 完整详批报告</div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="text-xs px-3 py-1.5 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 disabled:opacity-50"
            >
              {downloading ? "生成中…" : "📄 下载 PDF 报告"}
            </button>
          </div>
          <div className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">{fullText}</div>
        </div>
      )}

      {/* 支付弹窗 */}
      {payOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPayOpen(false)}>
          <div className="glass rounded-2xl p-6 max-w-sm w-full border-gold/30" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-serif font-bold text-gold text-center mb-2">解锁完整报告</h3>
            <p className="text-sm text-gray-300 text-center mb-4">
              解锁后完整展开全部解读，并可下载打印·留存·送礼
            </p>

            {/* 套餐选择 */}
            <div className="space-y-2 mb-4">
              {[
                { id: "pro", name: "专业全测", price: "$9.9", badge: "主力" },
                { id: "basic", name: "单测解锁", price: "$1", badge: "引流" },
              ].map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-gold/20 bg-dark-700/60 p-3">
                  <div>
                    <div className="text-sm text-gray-100 font-medium">{p.name}</div>
                    {p.badge && <div className="text-[10px] text-gold/70">{p.badge}</div>}
                  </div>
                  <div className="text-gold font-semibold">{p.price}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-white/60 text-center mb-3">支持：USDT / USDC / USDG（OKX 钱包）</p>
            <button
              onClick={() => {
                setPayOpen(false);
                setUnlocked(true);
              }}
              className="w-full btn-gold py-3 rounded-xl text-sm font-semibold"
            >
              连接 OKX 钱包支付
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-2">💡 支付链路明日打通 · 当前为流程演示</p>
          </div>
        </div>
      )}
    </div>
  );
}
