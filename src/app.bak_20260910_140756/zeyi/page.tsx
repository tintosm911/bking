"use client";

import { useState } from "react";

interface ShiWu { key: string; name: string; icon: string; zhun: string[]; jin: string[]; desc: string; }

const defaultShiwu: ShiWu[] = [
  { key: "jiaqu", name: "嫁娶", icon: "💍", zhun: ["嫁娶"], jin: [], desc: "" },
  { key: "kaiye", name: "开业", icon: "🏪", zhun: ["开市"], jin: [], desc: "" },
  { key: "banjia", name: "搬迁", icon: "🚚", zhun: ["移徙"], jin: [], desc: "" },
  { key: "chuxing", name: "出行", icon: "✈️", zhun: ["出行"], jin: [], desc: "" },
  { key: "dongtu", name: "动土", icon: "🏗", zhun: ["动土"], jin: [], desc: "" },
  { key: "anzang", name: "安葬", icon: "🕯", zhun: ["安葬"], jin: [], desc: "" },
  { key: "qifu", name: "祈福", icon: "🙏", zhun: ["祈福"], jin: [], desc: "" },
  { key: "jiaoyi", name: "交易", icon: "🤝", zhun: ["交易"], jin: [], desc: "" },
];

export default function ZeYiPage() {
  const [sel, setSel] = useState<string>("jiaqu");
  const [from, setFrom] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [to, setTo] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const [fy, fm, fd] = from.split("-").map(Number);
      const [ty, tm, td] = to.split("-").map(Number);
      const res = await fetch("/api/zeyi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiwu: sel, fromYear: fy, fromMonth: fm, fromDay: fd, toYear: ty, toMonth: tm, toDay: td }),
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

  const sw = result?.shiwu;

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">择日 · 择吉 · 良辰吉日</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">📆</div>
          <h1 className="text-3xl font-serif font-bold text-gold">择日择吉</h1>
          <p className="text-gray-400 mt-2">为诸事挑选黄道吉日 · 嫁娶开业搬迁动土</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          {/* 事务选择 */}
          <div>
            <label className="block text-sm text-gray-400 mb-3 text-center">选择事务</label>
            <div className="grid grid-cols-4 gap-3">
              {defaultShiwu.map((s) => (
                <button
                  type="button"
                  key={s.key}
                  onClick={() => setSel(s.key)}
                  className={`px-3 py-3 rounded-xl text-center border transition ${
                    sel === s.key
                      ? "bg-gold text-dark-900 border-gold"
                      : "bg-dark-700 border-gold/20 text-gray-300 hover:border-gold/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-sm font-semibold">{s.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 日期区间 */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div>
              <label className="block text-xs text-gray-400 mb-1">起（公历）</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">止（公历）</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full max-w-md mx-auto block btn-gold py-3 rounded-xl text-base font-semibold disabled:opacity-50">
            {loading ? "择日中..." : "📆 择吉日"}
          </button>
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        </form>

        {result && sw && (
          <div className="mt-12 space-y-8">
            {/* 优选吉日 */}
            <div>
              <div className="text-center mb-4">
                <div className="inline-block px-4 py-1 bg-gold/10 rounded-full text-gold text-sm border border-gold/20">
                  {sw.icon} {sw.name} · {result.range.days} 天中优选吉日
                </div>
                <p className="text-xs text-gray-500 mt-2">{result.summary}</p>
              </div>
              {result.best.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {result.best.map((d: any, i: number) => (
                    <div key={i} className="glass rounded-2xl p-5 border-gold/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">第{i + 1}吉日</span>
                        <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-300 text-xs font-bold">吉 · {d.score}分</span>
                      </div>
                      <div className="text-2xl font-serif font-bold text-gold">
                        {d.date.month}月{d.date.day}日 · {d.date.weekday.replace("星期", "周")}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        农历{d.lunar.month}月{d.lunar.dayName} · {d.ganzhi.day} · 建除{d.jianchu.name}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {d.hitYi.map((t: string, j: number) => (
                          <span key={j} className="px-2 py-0.5 rounded bg-green-500/10 text-green-300 text-xs">宜{t}</span>
                        ))}
                        {d.clash && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 text-xs">{d.clash}</span>}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-2">{d.notes.join(" · ")}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-2xl p-6 text-center text-gray-400 text-sm">
                  此区间未寻到特别吉日，建议放宽范围
                </div>
              )}
            </div>

            {/* 区间每日一览 */}
            <div>
              <h3 className="text-center text-gold font-serif font-bold text-lg mb-4">区间每日一览</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {result.days.map((d: any, i: number) => (
                  <div key={i} className={`rounded-xl p-3 border ${
                    d.score >= 50
                      ? "border-green-500/40 bg-green-500/5"
                      : d.jianchu.goodBad === "凶"
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-gold/10 bg-dark-700/40"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-200">{d.date.month}/{d.date.day}</span>
                      <span className={`text-xs font-bold ${
                        d.score >= 50 ? "text-green-400" : d.jianchu.goodBad === "凶" ? "text-red-400" : "text-amber-400"
                      }`}>
                        {d.score >= 50 ? "吉" : d.jianchu.goodBad}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {d.ganzhi.day} · {d.jianchu.name}{d.clash ? ` · ${d.clash}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => setResult(null)} className="btn-gold-outline px-6 py-3 rounded-xl text-sm">重新择日</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
