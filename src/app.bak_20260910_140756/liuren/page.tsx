"use client";

import { useState } from "react";

export default function LiuRenPage() {
  const [mode, setMode] = useState<"now" | "numbers">("now");
  const [nums, setNums] = useState({ a: "", b: "", c: "" });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body =
        mode === "numbers"
          ? { mode, a: nums.a, b: nums.b, c: nums.c }
          : { mode: "now" };
      const res = await fetch("/api/liuren", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  const badClass = (goodBad: string) =>
    goodBad === "吉"
      ? "bg-green-500/20 text-green-400 border-green-500/40"
      : goodBad === "凶"
        ? "bg-red-500/20 text-red-400 border-red-500/40"
        : goodBad === "半吉半凶"
          ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
          : "bg-orange-500/20 text-orange-400 border-orange-500/40";

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">小六壬 · 六宫掌诀</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🔮</div>
          <h1 className="text-3xl font-serif font-bold text-gold">小六壬占卜</h1>
          <p className="text-gray-400 mt-2">六宫掌诀 · 便捷快占 · 心中默念所问之事</p>
        </div>

        {/* 玩法切换 */}
        <div className="max-w-md mx-auto mb-6 grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("now")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition border ${
              mode === "now"
                ? "bg-gold text-dark-900 border-gold"
                : "bg-dark-700 border-gold/20 text-gray-400 hover:border-gold/50"
            }`}
          >
            🕐 当前时刻
          </button>
          <button
            onClick={() => setMode("numbers")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition border ${
              mode === "numbers"
                ? "bg-gold text-dark-900 border-gold"
                : "bg-dark-700 border-gold/20 text-gray-400 hover:border-gold/50"
            }`}
          >
            🔢 随心取数
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
          {mode === "now" ? (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-300 mb-2">闭目 · 静心 · 心中默念所问之事，然后起课</p>
              <p className="text-xs text-gold/70">按你此刻的农历月、日、时辰自动起课</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {(["a", "b", "c"] as const).map((k, idx) => (
                <div key={k}>
                  <label className="block text-sm text-gray-400 mb-1">第{idx + 1}数</label>
                  <input
                    type="number"
                    min={1}
                    value={nums[k]}
                    onChange={(e) => setNums({ ...nums, [k]: e.target.value })}
                    placeholder="数"
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none text-center"
                  />
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full btn-gold py-3 rounded-xl text-base font-semibold disabled:opacity-50">
            {loading ? "起课中..." : mode === "now" ? "🔮 现在起课" : "🔮 取数起课"}
          </button>
          {error && <div className="text-red-400 text-sm text-center mt-2">{error}</div>}
        </form>

        {result && (
          <div className="mt-12 space-y-6">
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-1 bg-gold/10 rounded-full text-gold text-sm border border-gold/20">
                小六壬 · {result.modeLabel}
              </div>
            </div>

            {/* 落宫结果 */}
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-5xl mb-3">{result.final.emoji}</div>
              <h2 className="text-3xl font-serif font-bold" style={{ color: result.final.color }}>
                {result.final.name}
              </h2>
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${badClass(result.final.goodBad)}`}>
                {result.final.goodBad}
              </span>
              <p className="mt-4 text-gray-400 text-sm">
                {result.final.position} · {result.final.element}属性 ·「{result.final.body}」
              </p>
              {result.shichenName && (
                <p className="mt-2 text-xs text-gold/60">
                  起课：{result.month}月{result.day}日  {result.shichenName}（{result.shichenRange}）
                </p>
              )}
            </div>

            {/* 掌诀断语 */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-serif font-bold text-gold mb-3">【掌诀断语】</h3>
              <p className="text-gray-300 leading-relaxed">{result.final.general}</p>
            </div>

            {/* 起课步骤 */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-serif font-bold text-gold mb-3">【起课过程】</h3>
              <div className="space-y-2">
                {result.steps.map((s: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-gold/60 shrink-0 mt-0.5">▸</span>
                    <div>
                      <span className="text-gold/80 font-semibold">{s.label}:</span>{" "}
                      <span className="text-gray-400">{s.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 六宫全览 */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-serif font-bold text-gold mb-3">【六宫掌诀全览】</h3>
              <div className="grid grid-cols-3 gap-3">
                {result.allPalaces.map((p: any) => (
                  <div
                    key={p.index}
                    className={`rounded-xl p-3 border text-center ${
                      p.name === result.final.name
                        ? "border-gold bg-gold/10"
                        : "border-gold/15 bg-dark-700/50"
                    }`}
                  >
                    <div className="text-2xl">{p.emoji}</div>
                    <div className="text-sm font-semibold mt-1" style={{ color: p.color }}>{p.name}</div>
                    <div className="text-[10px] text-gray-500">{p.goodBad}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => { setResult(null); if (mode === "numbers") setNums({ a: "", b: "", c: "" }); }}
                className="btn-gold-outline px-6 py-3 rounded-xl text-sm">
                重新起课
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
