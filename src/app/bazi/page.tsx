"use client";

import { useState } from "react";

export default function BaZiPage() {
  const [form, setForm] = useState({
    year: 2000,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    gender: 1,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 120 }, (_, i) => 2026 - i);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Nav */}
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">八字排盘</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🌙</div>
          <h1 className="text-3xl font-serif font-bold text-gold">八字排盘</h1>
          <p className="text-gray-400 mt-2">输入出生信息，AI 自动排盘 + 五行解读</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">出生年</label>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">出生月</label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">出生日</label>
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}日</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">出生时辰</label>
              <select
                value={form.hour}
                onChange={(e) => setForm({ ...form, hour: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none"
              >
                {hours.map((h) => (
                  <option key={h} value={h}>{h.toString().padStart(2, "0")}:00</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">性别</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none"
              >
                <option value={1}>男</option>
                <option value={0}>女</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold py-3 rounded-xl text-base font-semibold disabled:opacity-50"
          >
            {loading ? "命盘解析中..." : "🔮 开始排盘"}
          </button>

          {error && (
            <div className="text-red-400 text-sm text-center mt-2">{error}</div>
          )}
        </form>

        {/* Result */}
        {result && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1 bg-gold/10 rounded-full text-gold text-sm border border-gold/20">
                命盘解析完成
              </div>
            </div>

            {/* Four Pillars */}
            <div className="glass rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【八字四柱】</h2>
              <div className="grid grid-cols-4 gap-3 text-center">
                {Object.entries(result.四柱).map(([key, val]: [string, any]) => (
                  <div key={key} className="bg-dark-700 rounded-xl p-3 border border-gold/10">
                    <div className="text-xs text-gray-500 mb-1">{key}</div>
                    <div className="text-2xl font-serif font-bold text-gold-light">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Day Master */}
            <div className="glass rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【日主】</h2>
              <div className="text-center">
                <div className="text-4xl font-serif font-bold text-gold-light mb-2">{result.日主}</div>
                <div className="text-gray-400">
                  {result.日主五行} · {result.日主阴阳} · 身{result.日主力量}
                </div>
              </div>
            </div>

            {/* Five Elements */}
            <div className="glass rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【五行旺衰】</h2>
              <div className="space-y-3">
                {Object.entries(result.五行旺衰).map(([wx, count]: [string, any]) => {
                  const barW = Math.min(Math.round((count as number) * 20), 20);
                  const colors: Record<string, string> = {
                    "木": "bg-green-500", "火": "bg-red-500", "土": "bg-yellow-600",
                    "金": "bg-amber-300", "水": "bg-blue-500",
                  };
                  return (
                    <div key={wx} className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-sm text-gold">{wx}</span>
                      <div className="flex-1 h-3 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[wx] || "bg-gold"} transition-all`}
                          style={{ width: `${(count as number) / 6 * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{(count as number).toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 用神喜忌 */}
            <div className="glass rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【用神喜忌】</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-dark-700 rounded-xl p-4 border border-green-500/20">
                  <div className="text-xs text-gray-500 mb-1">用神</div>
                  <div className="text-2xl font-bold text-green-400">{result.用神}</div>
                </div>
                <div className="bg-dark-700 rounded-xl p-4 border border-blue-500/20">
                  <div className="text-xs text-gray-500 mb-1">喜神</div>
                  <div className="text-2xl font-bold text-blue-400">{result.喜神}</div>
                </div>
                <div className="bg-dark-700 rounded-xl p-4 border border-red-500/20">
                  <div className="text-xs text-gray-500 mb-1">忌神</div>
                  <div className="text-2xl font-bold text-red-400">{result.忌神}</div>
                </div>
              </div>
            </div>

            {/* 大运 */}
            <div className="glass rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【大运走势】</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(result.大运 as any[]).slice(0, 4).map((dy: any, i: number) => (
                  <div key={i} className="bg-dark-700 rounded-xl p-3 text-center border border-gold/10">
                    <div className="text-xl font-serif font-bold text-gold-light">{dy.大运}</div>
                    <div className="text-xs text-gray-500 mt-1">{dy.年龄}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 流年 */}
            <div className="glass rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【当前流年】</h2>
              <div className="text-center">
                <div className="text-3xl font-serif font-bold text-gold-light">{result.流年}</div>
                <div className="text-gray-400 text-sm mt-2">丙午年 · 天干丙火，地支午火</div>
              </div>
            </div>

            {/* 交易解读 */}
            <div className="glass rounded-2xl p-6 mb-6 border-gold/20">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【命格解读】</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(result.交易解读).map(([key, val]: [string, any]) => (
                  <div key={key} className="bg-dark-700 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">{key}</div>
                    <div className="text-sm text-gold-light">{val as string}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw text */}
            <div className="glass rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【排盘明细】</h2>
              <pre className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap font-mono">
                {result.formatted}
              </pre>
            </div>

            <div className="text-center">
              <button
                onClick={() => setResult(null)}
                className="btn-gold-outline px-6 py-3 rounded-xl text-sm"
              >
                重新排盘
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}