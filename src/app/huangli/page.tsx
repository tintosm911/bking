"use client";

import { useState } from "react";

export default function HuangliPage() {
  const [view, setView] = useState<"today" | "wanli">("today");
  const [date, setDate] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() });
  const [result, setResult] = useState<any>(null);
  const [wanli, setWanli] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (view === "today") {
        const res = await fetch("/api/huangli", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(date),
        });
        const data = await res.json();
        if (data.error) setError(data.error);
        else setResult(data);
        setWanli(null);
      } else {
        const res = await fetch("/api/huangli", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...date, days: 15 }),
        });
        const data = await res.json();
        if (data.error) setError(data.error);
        else setWanli(data);
        setResult(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

  const goodColor = (good: string) =>
    good === "吉" ? "text-green-400" : good === "凶" ? "text-red-400" : "text-amber-400";

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">黄历 · 万年历</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">📅</div>
          <h1 className="text-3xl font-serif font-bold text-gold">每日黄历</h1>
          <p className="text-gray-400 mt-2">当日干支 · 宜忌 · 冲煞 · 彭祖百忌</p>
        </div>

        {/* 模式切换 */}
        <div className="max-w-md mx-auto mb-6 grid grid-cols-2 gap-2">
          <button
            onClick={() => setView("today")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition border ${
              view === "today"
                ? "bg-gold text-dark-900 border-gold"
                : "bg-dark-700 border-gold/20 text-gray-400 hover:border-gold/50"
            }`}
          >
            📅 今日黄历
          </button>
          <button
            onClick={() => setView("wanli")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition border ${
              view === "wanli"
                ? "bg-gold text-dark-900 border-gold"
                : "bg-dark-700 border-gold/20 text-gray-400 hover:border-gold/50"
            }`}
          >
            🗓 万年历
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">年</label>
              <select value={date.year} onChange={(e) => setDate({ ...date, year: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
                {years.map((y) => <option key={y} value={y}>{y}年</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">月</label>
              <select value={date.month} onChange={(e) => setDate({ ...date, month: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}月</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">日</label>
              <select value={date.day} onChange={(e) => setDate({ ...date, day: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}日</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full btn-gold py-3 rounded-xl text-base font-semibold disabled:opacity-50">
            {loading ? "排盘中..." : view === "today" ? "📅 查黄历" : "🗓 查万年历"}
          </button>
          {error && <div className="text-red-400 text-sm text-center mt-2">{error}</div>}
        </form>

        {/* 今日黄历结果 */}
        {result && (
          <div className="mt-12 space-y-6">
            <div className="glass rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-1 bg-gold/10 rounded-full text-gold text-sm border border-gold/20">
                  黄历 · {result.solar.year}年{result.solar.month}月{result.solar.day}日 {result.solar.weekday}
                </div>
              </div>

              {/* 农历 + 干支 */}
              <div className="text-center">
                <div className="text-4xl font-serif font-bold text-gold mb-2">
                  {result.lunar.leap ? "闰" : ""}{result.lunar.month}月{result.lunar.dayName}
                </div>
                <div className="text-sm text-gray-400">
                  {result.lunar.year}年 · 生肖{result.lunar.zodiac} · 农历{result.lunar.month}月
                </div>
                <div className="mt-3 flex justify-center gap-2 flex-wrap text-sm">
                  <span className="px-3 py-1 rounded-full bg-dark-700 border border-gold/20">年柱 {result.ganzhi.year}</span>
                  <span className="px-3 py-1 rounded-full bg-dark-700 border border-gold/20">月柱 {result.ganzhi.month}</span>
                  <span className="px-3 py-1 rounded-full bg-dark-700 border border-gold/20">日柱 {result.ganzhi.day}</span>
                </div>
              </div>

              {/* 建除 + 冲煞 */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-center text-sm">
                <div className="rounded-xl bg-dark-700/50 border border-gold/15 p-4">
                  <div className="text-gray-400 mb-1">建除十二神</div>
                  <div className={`text-xl font-bold ${goodColor(result.jianchu.goodBad)}`}>
                    {result.jianchu.name} · {result.jianchu.goodBad}
                  </div>
                </div>
                <div className="rounded-xl bg-dark-700/50 border border-gold/15 p-4">
                  <div className="text-gray-400 mb-1">冲煞</div>
                  <div className="text-xl font-bold text-gray-200">{result.wuxing.clashSX}</div>
                  <div className="text-xs text-gray-500">{result.wuxing.clashZhi} · 五行{result.wuxing.day}</div>
                </div>
              </div>

              {/* 宜忌 */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
                  <div className="text-green-400 font-semibold mb-2 text-sm">宜</div>
                  <div className="flex flex-wrap gap-2">
                    {result.jianchu.yi.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded bg-green-500/10 text-green-300 text-xs">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                  <div className="text-red-400 font-semibold mb-2 text-sm">忌</div>
                  <div className="flex flex-wrap gap-2">
                    {result.jianchu.ji.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded bg-red-500/10 text-red-300 text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 神煞 + 彭祖 */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gold/70 shrink-0">吉神：</span>
                  <span className="text-green-300">{result.jiShen.join(" · ") || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gold/70 shrink-0">凶神：</span>
                  <span className="text-red-400">{result.xiongShen.join(" · ") || "—"}</span>
                </div>
                {result.pengzu && (
                  <div className="rounded-xl bg-dark-700/50 border border-gold/15 p-3 text-center text-amber-300">
                    ⚠️ {result.pengzu}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => setResult(null)} className="btn-gold-outline px-6 py-3 rounded-xl text-sm">重新查询</button>
            </div>
          </div>
        )}

        {/* 万年历结果 */}
        {wanli && (
          <div className="mt-12">
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-1 bg-gold/10 rounded-full text-gold text-sm border border-gold/20">
                万年历 · 起自 {wanli.list[0].solar.year}年{wanli.list[0].solar.month}月{wanli.list[0].solar.day}日 共{wanli.days}天
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {wanli.list.map((d: any, i: number) => (
                <div key={i} className={`glass rounded-2xl p-5 ${i === 0 ? "ring-1 ring-gold" : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-300">
                      {d.solar.month}/{d.solar.day} {d.solar.weekday.replace("星期", "周")}
                    </span>
                    <span className={`text-xs font-bold ${goodColor(d.jianchu.goodBad)}`}>
                      {d.jianchu.goodBad === "吉" ? "吉" : d.jianchu.goodBad === "凶" ? "凶" : "平"}
                    </span>
                  </div>
                  <div className="text-xl font-serif font-bold text-gold mb-1">
                    {d.lunar.dayName}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {d.lunar.leap ? "闰" : ""}{d.lunar.month}月 · 日柱 {d.ganzhi.day}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {d.jianchu.yi.slice(0, 3).map((t: string, j: number) => (
                      <span key={j} className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-300 text-[10px]">宜{t}</span>
                    ))}
                    {d.jianchu.ji.slice(0, 2).map((t: string, j: number) => (
                      <span key={j} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 text-[10px]">忌{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <button onClick={() => setWanli(null)} className="btn-gold-outline px-6 py-3 rounded-xl text-sm">重新查询</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
