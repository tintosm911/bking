"use client";

import { useState } from "react";

export default function TuifaPage() {
  const now = new Date();
  const [form, setForm] = useState({ year: now.getFullYear() - 30, month: 5, day: 20 });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tuifa", {
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

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">八字反推 · 校正时辰</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🔁</div>
          <h1 className="text-3xl font-serif font-bold text-gold">八字反推</h1>
          <p className="text-gray-400 mt-2">不知时辰也能排 · 十二时辰对照校正命盘</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {([["year", "出生年份"], ["month", "出生月份"], ["day", "出生日"]] as const).map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input type="number" value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none" />
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading}
            className="w-full btn-gold py-3 rounded-xl text-base font-semibold disabled:opacity-50">
            {loading ? "排盘中..." : "🔁 反推时辰"}
          </button>
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        </form>

        {result && (
          <div className="mt-12 space-y-6">
            <div className="glass rounded-2xl p-6 border-gold/40 text-center">
              <div className="text-sm text-gray-400 mb-1">已知三柱 · 时辰待定</div>
              <div className="flex justify-center gap-4 text-xl font-serif text-gold">
                <span>{result.yearPillar}</span>
                <span>{result.monthPillar}</span>
                <span>{result.dayPillar}</span>
                <span className="text-gray-500">??</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">日主 {result.dayMaster}</div>
            </div>

            <h3 className="text-center text-gold font-serif font-bold text-lg">十二时辰对照</h3>
            <div className="space-y-3">
              {result.hours.map((h: any) => (
                <div key={h.key} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gold">{h.label}</span>
                      <span className="text-xs text-gray-500">{h.range}</span>
                    </div>
                    <span className="font-serif text-gold text-lg">{h.hourPillar}</span>
                    <span className="px-1.5 py-0.5 rounded border border-gold/30 text-gold text-[10px]">{h.hourShishen}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
                    <div className="bg-dark-700 rounded-lg py-1.5">
                      <div className="text-gray-500 mb-0.5">身强弱</div>
                      <div className={`font-bold ${h.isStrong ? "text-orange-300" : "text-blue-300"}`}>{h.strength}</div>
                    </div>
                    <div className="bg-dark-700 rounded-lg py-1.5">
                      <div className="text-gray-500 mb-0.5">用神</div>
                      <div className="font-bold text-green-300">{h.yongshen}</div>
                    </div>
                    <div className="bg-dark-700 rounded-lg py-1.5">
                      <div className="text-gray-500 mb-0.5">忌神</div>
                      <div className="font-bold text-red-300">{h.jishen}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{h.summary}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-5 border-gold/30">
              <h4 className="text-gold font-serif font-bold text-center mb-2">大师点拨</h4>
              <p className="text-sm text-gray-300 text-center leading-relaxed">{result.tip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
