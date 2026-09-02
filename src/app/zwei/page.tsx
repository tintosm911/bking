"use client";

import { useState } from "react";
import { downloadReport } from "@/lib/downloadPdf";

export default function ZWeiPage() {
  const [form, setForm] = useState({ year: 2000, month: 1, day: 1, hour: 12, gender: 1 });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!result) return;
    setDownloading(true);
    setError("");
    try {
      await downloadReport("zwei", "缘主", result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/zwei", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 120 }, (_, i) => 2026 - i);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">紫微斗数</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">⭐</div>
          <h1 className="text-3xl font-serif font-bold text-gold">紫微斗数排盘</h1>
          <p className="text-gray-400 mt-2">十二宫星曜分布 · 十四主星 · 四化飞星 · 格局判定</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">出生年</label>
              <select value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
                {years.map((y) => <option key={y} value={y}>{y}年</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">月</label>
              <select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}月</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">日</label>
              <select value={form.day} onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}日</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">时辰</label>
              <select value={form.hour} onChange={(e) => setForm({ ...form, hour: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
                {Array.from({ length: 24 }, (_, i) => i).map((h) => <option key={h} value={h}>{h.toString().padStart(2, "0")}:00</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">性别</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
                <option value={1}>男</option>
                <option value={0}>女</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full btn-gold py-3 rounded-xl text-base font-semibold disabled:opacity-50">
            {loading ? "命盘解析中..." : "⭐ 安星排盘"}
          </button>
          {error && <div className="text-red-400 text-sm text-center mt-2">{error}</div>}
        </form>

        {result && (
          <div className="mt-12 space-y-6">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1 bg-gold/10 rounded-full text-gold text-sm border border-gold/20">
                紫微命盘解析完成
              </div>
            </div>

            {/* 基本信息 */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【基本信息】</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-dark-700 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">命宫</div>
                  <div className="text-lg font-bold text-gold-light">{result.命宫}</div>
                </div>
                <div className="bg-dark-700 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">五行局</div>
                  <div className="text-lg font-bold text-gold-light">{result.五行局}</div>
                </div>
                <div className="bg-dark-700 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">紫微星</div>
                  <div className="text-lg font-bold text-gold-light">{result.紫微星}</div>
                </div>
                <div className="bg-dark-700 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">农历</div>
                  <div className="text-xs font-bold text-gold-light">{result.农历}</div>
                </div>
              </div>
            </div>

            {/* 十二宫星曜 */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【十二宫星曜】</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(result.星曜 || {}).map(([gong, stars]: [string, any]) => (
                  <div key={gong} className="bg-dark-700 rounded-xl p-3 border border-gold/10">
                    <div className="text-xs text-gold font-bold mb-1">{gong}</div>
                    <div className="text-sm text-gray-300">
                      {Array.isArray(stars) && stars.length > 0
                        ? stars.join(" · ")
                        : <span className="text-gray-500 italic">空宫</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 格局 */}
            {result.格局 && result.格局.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-gold/30">
                <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【格局显现】</h2>
                <div className="space-y-2">
                  {result.格局.map((p: string, i: number) => (
                    <div key={i} className="bg-dark-700 rounded-xl p-3 text-sm text-gray-300 border border-gold/10">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 交易风格 */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【交易风格评分】</h2>
              <div className="space-y-3">
                {Object.entries(result.交易风格 || {}).map(([k, v]: [string, any]) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="w-16 text-sm font-bold text-gold">{k}</span>
                    <div className="flex-1 h-3 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${(v as number)}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 大限 */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【大限运势】</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(result.大限 || []).slice(0, 4).map((d: any, i: number) => (
                  <div key={i} className="bg-dark-700 rounded-xl p-3 text-center border border-gold/10">
                    <div className="text-sm font-bold text-gold-light">{d.宫}</div>
                    <div className="text-xs text-gray-500">{d.起始年龄}-{d.结束年龄}岁</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 原始排盘 */}
            <details className="glass rounded-2xl p-6">
              <summary className="text-sm text-gold cursor-pointer font-bold">查看完整排盘明细</summary>
              <pre className="mt-4 text-xs text-gray-400 leading-relaxed whitespace-pre-wrap font-mono">{result.formatted}</pre>
            </details>

            <div className="text-center">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {downloading ? "生成 PDF 中..." : "📄 下载 PDF 报告"}
              </button>
              <button onClick={() => setResult(null)} className="btn-gold-outline px-6 py-3 rounded-xl text-sm ml-3">重新排盘</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}