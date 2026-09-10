"use client";

import { useState } from "react";
import {
  zhangJingDivination, ZHANG_JING_PALACES, ZhangJingResult,
} from "@/lib/zhangjing_engine";

const BADGE: Record<string, string> = {
  吉: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  凶: "bg-red-500/20 text-red-300 border-red-500/40",
  平: "bg-gray-500/20 text-gray-100 border-gray-500/40",
  吉中带凶: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

export default function ZhangJingPage() {
  const [input, setInput] = useState<{ y: string; m: string; d: string; h: string }>({
    y: "", m: "", d: "", h: "",
  });
  const [result, setResult] = useState<ZhangJingResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const y = Number(input.y) || new Date().getFullYear();
    const m = Number(input.m) || new Date().getMonth() + 1;
    const d = Number(input.d) || new Date().getDate();
    const h = Number(input.h) || new Date().getHours();
    setResult(zhangJingDivination({ year: y, month: m, day: d, hour: h }));
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <a href="/baodian" className="text-gold/60 text-sm hover:text-gold">术数宝典</a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🪷</div>
          <h1 className="text-3xl font-serif font-bold text-gold">达摩一掌经</h1>
          <p className="text-gray-200 mt-2">
            年·月·日·时 四柱起课 · 十二宫（六道 + 六星）· 观前世今生之性
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto grid grid-cols-2 gap-4">
          {([
            ["y", "出生年"], ["m", "出生月"], ["d", "出生日"], ["h", "时辰(0-23)"],
          ] as const).map(([k, label]) => (
            <div key={k}>
              <label className="block text-sm text-gray-200 mb-1">{label}</label>
              <input
                type="number"
                value={input[k]}
                onChange={(e) => setInput((s) => ({ ...s, [k]: e.target.value }))}
                placeholder={k === "h" ? "例如 15" : ""}
                className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-gold/20 text-white text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
          ))}
          <button
            type="submit"
            className="col-span-2 mt-2 px-6 py-3.5 rounded-xl bg-gold text-dark-900 font-semibold text-base shadow-lg shadow-gold/15 hover:bg-gold-light transition"
          >
            🪷 起课
          </button>
        </form>

        {/* 结果 */}
        {result && (
          <div className="mt-12 space-y-6">
            {/* 命宫 */}
            <div className="glass rounded-2xl p-6 border border-gold/20 text-center">
              <div className="text-xs text-gold/70 uppercase tracking-wider mb-2">命宫</div>
              <div className="text-4xl font-serif text-gold">{result.fate.name}</div>
              <div className="mt-2 inline-block px-3 py-1 rounded-full border text-sm font-semibold bg-white/5 border-white/10 text-gray-100">
                {result.fate.nature}
              </div>
              <p className="text-gray-400 mt-3 leading-relaxed max-w-lg mx-auto">{result.fate.desc}</p>
            </div>

            {/* 四柱宫位 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {result.palaces.map((p) => (
                <div key={p.label} className="glass rounded-2xl p-4 border border-white/10 text-center">
                  <div className="text-xs text-gold/70 mb-1">{p.label}宫</div>
                  <div className="text-lg font-serif text-gold">{p.palace.name}</div>
                  <span className={`mt-2 inline-block px-2 py-0.5 rounded-full border text-xs ${BADGE[p.palace.goodBad] || BADGE.平}`}>
                    {p.palace.goodBad}
                  </span>
                </div>
              ))}
            </div>

            {/* 总断 */}
            <div className="glass rounded-2xl p-6 border border-gold/20">
              <div className="text-xs text-gold/70 uppercase tracking-wider mb-2">总断</div>
              <p className="text-gray-200 leading-relaxed">{result.summary}</p>
              <div className="mt-4 flex gap-3 text-sm">
                <span className="text-emerald-300">吉宫 {result.goodCount} 重</span>
                <span className="text-red-300">凶宫 {result.badCount} 重</span>
              </div>
            </div>

            {/* 十二宫总览 */}
            <div className="pt-4">
              <div className="text-xs text-gold/70 uppercase tracking-wider mb-3">十二宫 · 全览</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {ZHANG_JING_PALACES.map((p) => (
                  <div key={p.index} className="glass rounded-xl p-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-serif text-gold">{p.name}</span>
                      <span className="text-[10px] text-white/40">{p.emoji}</span>
                    </div>
                    <div className="text-[10px] text-gold/60 mt-1">{p.nature}</div>
                    <span className={`mt-1.5 inline-block px-2 py-0.5 rounded-full border text-[10px] ${BADGE[p.goodBad] || BADGE.平}`}>
                      {p.goodBad}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 text-center text-xs text-gray-500 leading-relaxed">
          一掌经 · 源于唐代，以四柱轮转十二宫观性情命途。仅供传统文化研究与休闲参考。
        </div>
      </div>
    </div>
  );
}
