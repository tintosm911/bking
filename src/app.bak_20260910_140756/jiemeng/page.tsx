"use client";

import { useState } from "react";

const EXAMPLES = [
  "梦见一条大蛇追着我跑，后来我爬上高山躲过",
  "梦见下雨了，水涨起来，河里有很多大鱼在跳",
  "梦见我掉进水里，被一条大龙救上来",
  "梦见自己掉牙齿，然后哭了",
  "梦见捡到很多钱，还有锦鲤在水里游",
  "梦见家里着火，我抱着孩子跑出来",
];

const GOOD_STYLE: Record<string, string> = {
  吉: "bg-green-500/20 text-green-300 border-green-500/40",
  凶: "bg-red-500/20 text-red-300 border-red-500/40",
  中: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

export default function JieMengPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError("请输入梦境内容"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jiemeng", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
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
          <span className="text-gold/60 text-sm">周公解梦</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">💤</div>
          <h1 className="text-3xl font-serif font-bold text-gold">周公解梦</h1>
          <p className="text-gray-400 mt-2">梦境意象 · 剖析吉凶 · 古法释梦</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="请输入你的梦境，如：我梦见一条大蛇追我，后来掉进了水里..."
            className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none placeholder-gray-500"
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setText(ex)}
                className="px-3 py-1.5 rounded-full bg-dark-700 border border-gold/15 text-gray-300 text-xs hover:border-gold/40 hover:text-gold transition"
              >
                {ex.slice(0, 14)}…
              </button>
            ))}
          </div>
          <button type="submit" disabled={loading}
            className="w-full btn-gold py-3 rounded-xl text-base font-semibold disabled:opacity-50">
            {loading ? "解梦中..." : "🌙 解梦"}
          </button>
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        </form>

        {result && (
          <div className="mt-10 space-y-6">
            {/* 总解读 */}
            <div className="glass rounded-2xl p-6 border-gold/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-serif font-bold text-gold">梦境总解</span>
                <span className={`px-3 py-1 rounded-full border text-sm font-bold ${GOOD_STYLE[result.good]}`}>
                  {result.good}
                </span>
              </div>
              <p className="text-gray-200 leading-relaxed">{result.summary}</p>
              <div className="text-xs text-gray-500 mt-3">命中意象 {result.hits.length} 项</div>
            </div>

            {/* 命中意象 */}
            {result.hits.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-center text-gold font-serif font-bold text-lg">逐项意象详解</h3>
                {result.hits.map((h: any, i: number) => (
                  <div key={i} className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-gold/15 text-gold text-xs">{h.cat}</span>
                      <span className="font-semibold text-gray-200">{h.keys}</span>
                      <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${GOOD_STYLE[h.good]}`}>
                        {h.good}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{h.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center">
              <button onClick={() => { setResult(null); setText(""); }} className="btn-gold-outline px-6 py-3 rounded-xl text-sm">
                重新解梦
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
