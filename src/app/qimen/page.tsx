"use client";

import { useState } from "react";

export default function QiMenPage() {
  const [form, setForm] = useState({ year: 2026, month: 8, day: 19, hour: 15 });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/qimen", {
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
          <span className="text-gold/60 text-sm">奇门遁甲</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🏯</div>
          <h1 className="text-3xl font-serif font-bold text-gold">奇门遁甲起局</h1>
          <p className="text-gray-400 mt-2">时空盘局 · 三奇八门 · 择时决策</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">年</label>
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
          <div>
            <label className="block text-sm text-gray-400 mb-1">时辰</label>
            <select value={form.hour} onChange={(e) => setForm({ ...form, hour: Number(e.target.value) })}
              className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
              {Array.from({ length: 24 }, (_, i) => i).map((h) => <option key={h} value={h}>{h.toString().padStart(2, "0")}:00</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full btn-gold py-3 rounded-xl text-base font-semibold disabled:opacity-50">
            {loading ? "起局中..." : "🏯 起局分析"}
          </button>
          {error && <div className="text-red-400 text-sm text-center mt-2">{error}</div>}
        </form>

        {result && (
          <div className="mt-12 space-y-6">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1 bg-gold/10 rounded-full text-gold text-sm border border-gold/20">
                奇门遁甲起局完成
              </div>
            </div>

            {/* 基本信息 */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【基本信息】</h2>
              <div className="text-center text-gray-300 text-sm">{result.formatted?.split("\n")?.slice(1, 5)?.join("\n") || "无数据"}</div>
            </div>

            {/* 完整排盘 */}
            <details className="glass rounded-2xl p-6" open>
              <summary className="text-sm text-gold cursor-pointer font-bold">查看完整奇门盘</summary>
              <pre className="mt-4 text-xs text-gray-400 leading-relaxed whitespace-pre-wrap font-mono">{result.formatted}</pre>
            </details>

            <div className="text-center">
              <button onClick={() => setResult(null)} className="btn-gold-outline px-6 py-3 rounded-xl text-sm">重新起局</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}