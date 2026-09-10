"use client";

import { useState } from "react";

const LIUQIN_COLOR: Record<string, string> = {
  父母: "text-amber-300",
  兄弟: "text-blue-300",
  子孙: "text-green-300",
  妻财: "text-orange-300",
  官鬼: "text-red-300",
};

export default function LiuYaoPage() {
  const [method, setMethod] = useState<"auto" | "manual">("auto");
  const [manual, setManual] = useState<(number | "")[]>(["", "", "", "", ""]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body =
        method === "manual" && manual.every((v) => v !== "" && v >= 0 && v <= 3)
          ? { counts: manual.map(Number), method }
          : { method: "auto" };
      const res = await fetch("/api/liuyao", {
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

  const yaoNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">六爻 · 文王金钱课</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🪙</div>
          <h1 className="text-3xl font-serif font-bold text-gold">六爻占卜</h1>
          <p className="text-gray-400 mt-2">三枚铜钱 · 六次摇卦 · 卦象断吉凶</p>
        </div>

        {/* 起卦方式 */}
        <div className="max-w-md mx-auto mb-6 grid grid-cols-2 gap-2">
          <button
            onClick={() => setMethod("auto")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition border ${
              method === "auto"
                ? "bg-gold text-dark-900 border-gold"
                : "bg-dark-700 border-gold/20 text-gray-400 hover:border-gold/50"
            }`}
          >
            🎲 自动摇卦
          </button>
          <button
            onClick={() => setMethod("manual")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition border ${
              method === "manual"
                ? "bg-gold text-dark-900 border-gold"
                : "bg-dark-700 border-gold/20 text-gray-400 hover:border-gold/50"
            }`}
          >
            🪙 手动摇卦
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
          {method === "auto" ? (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-300 mb-2">心中默念所问之事，三枚铜钱自动摇六次</p>
              <p className="text-xs text-gold/70">初爻 → 上爻 · 由系统随机起卦</p>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-gray-300 text-center mb-4">
                自行抛三枚铜钱（或用硬币），自下而上记录六次「正面几枚」（0-3）
              </p>
              <div className="grid grid-cols-6 gap-2">
                {manual.map((v, i) => (
                  <div key={i}>
                    <label className="block text-[10px] text-gray-500 text-center mb-1">{yaoNames[i]}</label>
                    <input
                      type="number"
                      min={0}
                      max={3}
                      value={v}
                      onChange={(e) => {
                        const nv = e.target.value === "" ? "" : Number(e.target.value);
                        setManual((prev) => prev.map((x, j) => (j === i ? nv : x)));
                      }}
                      placeholder="0-3"
                      className="w-full px-1 py-2.5 rounded-lg bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none text-center text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full btn-gold py-3 rounded-xl text-base font-semibold disabled:opacity-50">
            {loading ? "起卦中..." : method === "auto" ? "🎲 自动起卦" : "🪙 起卦"}
          </button>
          {error && <div className="text-red-400 text-sm text-center mt-2">{error}</div>}
        </form>

        {result && (
          <div className="mt-12 space-y-6">
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-1 bg-gold/10 rounded-full text-gold text-sm border border-gold/20">
                六爻起卦 · {result.benGua.name} · {result.gong}宫{result.stage}
              </div>
            </div>

            {/* 卦象主卡 */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-center gap-8 mb-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">本卦</div>
                  <div className="text-4xl font-serif font-bold text-gold">{result.benGua.name}</div>
                  <div className="text-3xl mt-2">{result.benGua.symbol}</div>
                  <div className="text-xs text-gray-400 mt-1">五行{result.benGua.element}</div>
                </div>
                {result.bianGua && (
                  <>
                    <div className="text-gold/40 text-2xl">➜</div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">变卦</div>
                      <div className="text-4xl font-serif font-bold text-gold">{result.bianGua.name}</div>
                      <div className="text-3xl mt-2">{result.bianGua.symbol}</div>
                      <div className="text-xs text-gray-400 mt-1">{result.movingCount} 爻动</div>
                    </div>
                  </>
                )}
              </div>
              {!result.bianGua && (
                <div className="text-center text-xs text-gray-500">
                  六爻安静 · 无动爻 · 以本卦卦辞断之
                </div>
              )}
            </div>

            {/* 六爻全览 */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-serif font-bold text-gold mb-3">【六爻装卦】</h3>
              <div className="space-y-1.5">
                {[...result.yaos].reverse().map((y: any) => (
                  <div
                    key={y.index}
                    className={`flex items-center justify-between px-4 py-2 rounded-lg border ${
                      y.isShi || y.isYing ? "border-gold bg-gold/10" : "border-gold/10 bg-dark-700/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500 w-10">{yaoNames[y.index - 1]}</span>
                      <span className={`font-mono text-lg ${y.moving ? "text-red-400" : "text-gray-200"}`}>
                        {y.line}
                      </span>
                      {y.isShi && <span className="px-1.5 py-0.5 rounded bg-gold/20 text-gold text-[10px]">世</span>}
                      {y.isYing && <span className="px-1.5 py-0.5 rounded bg-gold/10 text-gold/70 text-[10px]">应</span>}
                      {y.moving && <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px]">动</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-500">{y.type}</span>
                      <span className="text-gray-400">{y.element}行</span>
                      <span className={`font-semibold ${LIUQIN_COLOR[y.liuqin] || "text-gray-300"}`}>{y.liuqin}</span>
                      <span className="text-gray-500">{y.liushen}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center text-xs text-gold/60">
                起卦日{result.date?.y}年{result.date?.m}月{result.date?.d}日 · 日干「{result.dayGan}」起六神
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => setResult(null)} className="btn-gold-outline px-6 py-3 rounded-xl text-sm">
                重新起卦
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
