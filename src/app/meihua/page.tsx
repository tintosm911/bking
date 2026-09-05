"use client";

import { useState } from "react";

const GOOD_STYLE: Record<string, string> = {
  吉: "bg-green-500/20 text-green-300 border-green-500/40",
  凶: "bg-red-500/20 text-red-300 border-red-500/40",
  平: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

function GuaCard({ label, name, nature, highlight }: {
  label: string; name: string; nature?: string; highlight?: boolean;
}) {
  return (
    <div className={`glass rounded-2xl p-4 text-center ${highlight ? "border-gold/50 bg-gold/5" : ""}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-serif font-bold text-gold">{name}</div>
      {nature && <div className="text-[10px] text-gray-500 mt-1">{nature}</div>}
    </div>
  );
}

export default function MeiHuaPage() {
  const now = new Date();
  const [mode, setMode] = useState<"time" | "num">("time");
  const [t, setT] = useState({
    year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), hour: now.getHours(),
  });
  const [n, setN] = useState({ n1: 3, n2: 4, n3: 5 });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = mode === "time"
        ? { method: "time", year: t.year, month: t.month, day: t.day, hour: t.hour }
        : { number1: n.n1, number2: n.n2, number3: n.n3 };
      const res = await fetch("/api/meihua", {
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

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">梅花易数 · 体用断卦</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🌸</div>
          <h1 className="text-3xl font-serif font-bold text-gold">梅花易数</h1>
          <p className="text-gray-400 mt-2">以数起卦 · 观体用生克 · 断事之吉凶</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-5">
          {/* 起卦方式切换 */}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMode("time")}
              className={`px-3 py-2.5 rounded-xl text-center text-sm font-semibold border transition ${
                mode === "time" ? "bg-gold text-dark-900 border-gold" : "bg-dark-700 border-gold/20 text-gray-400"
              }`}>⏰ 时间起卦</button>
            <button type="button" onClick={() => setMode("num")}
              className={`px-3 py-2.5 rounded-xl text-center text-sm font-semibold border transition ${
                mode === "num" ? "bg-gold text-dark-900 border-gold" : "bg-dark-700 border-gold/20 text-gray-400"
              }`}>🔢 报数起卦</button>
          </div>

          {mode === "time" ? (
            <div className="grid grid-cols-4 gap-3">
              {(["year", "month", "day", "hour"] as const).map((k) => (
                <div key={k}>
                  <label className="block text-xs text-gray-400 mb-1">
                    {k === "year" ? "年" : k === "month" ? "月" : k === "day" ? "日" : "时"}
                  </label>
                  <input type="number" value={t[k]}
                    onChange={(e) => setT({ ...t, [k]: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {([["n1", "第一数"], ["n2", "第二数"], ["n3", "动爻数"]] as const).map(([k, label]) => (
                <div key={k}>
                  <label className="block text-xs text-gray-400 mb-1">{label}</label>
                  <input type="number" value={n[k]}
                    onChange={(e) => setN({ ...n, [k]: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none" />
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full btn-gold py-3 rounded-xl text-base font-semibold disabled:opacity-50">
            {loading ? "起卦中..." : "🌸 起卦"}
          </button>
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        </form>

        {result && (
          <div className="mt-12 space-y-6">
            {/* 三卦 */}
            <div>
              <div className="text-xs text-gray-500 text-center mb-3">{result.method} · 动爻第{result.moving}爻</div>
              <div className="grid grid-cols-3 gap-3">
                <GuaCard label="本卦" name={result.benName} nature={`${result.upperNature} · ${result.lowerNature}`} highlight />
                <GuaCard label="互卦" name={result.huName} />
                <GuaCard label="变卦" name={result.bianName} />
              </div>
            </div>

            {/* 体用 */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-around mb-3">
                <div className="text-center">
                  <div className="text-xs text-gray-500">体卦（己方）</div>
                  <div className="text-2xl font-serif font-bold text-gold">{result.tiName}</div>
                  <div className="text-xs text-gray-400">{result.tiWx}五行</div>
                </div>
                <div className="text-amber-400 text-3xl">{result.relation === "比和" ? "≋" : "→"}</div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">用卦（所问）</div>
                  <div className="text-2xl font-serif font-bold text-gold">{result.yongName}</div>
                  <div className="text-xs text-gray-400">{result.yongWx}五行</div>
                </div>
              </div>
              <div className="text-center">
                <span className={`inline-block px-4 py-1.5 rounded-full border text-sm font-bold ${GOOD_STYLE[result.good]}`}>
                  {result.relation} · {result.good}（{result.score}分）
                </span>
              </div>
            </div>

            {/* 大师断语 */}
            <div className="glass rounded-2xl p-6 border-gold/40">
              <h3 className="text-gold font-serif font-bold text-center mb-3">梅花断语</h3>
              <p className="text-gray-200 leading-relaxed text-center">{result.verdict}</p>
            </div>

            <div className="text-center">
              <button onClick={() => setResult(null)} className="btn-gold-outline px-6 py-3 rounded-xl text-sm">重新起卦</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
