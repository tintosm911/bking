"use client";

import { useState } from "react";
import {
  xuanKongDivination, XuanKongResult, NINE_STARS,
} from "@/lib/xuankong_engine";

const STAR_BG: Record<string, string> = {
  吉: "text-emerald-300",
  凶: "text-red-300",
  平: "text-gray-100",
};

export default function XuanKongPage() {
  const [input, setInput] = useState<{ y: string; m: string }>({ y: "", m: "" });
  const [result, setResult] = useState<XuanKongResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const y = Number(input.y) || new Date().getFullYear();
    const m = Number(input.m) || new Date().getMonth() + 1;
    setResult(xuanKongDivination({ year: y, month: m }));
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
          <div className="text-5xl mb-4">🧭</div>
          <h1 className="text-3xl font-serif font-bold text-gold">玄空飞星</h1>
          <p className="text-gray-200 mt-2">九宫飞泊 · 紫白飞星 · 察流年流月方位吉凶</p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-200 mb-1">年份</label>
            <input
              type="number"
              value={input.y}
              onChange={(e) => setInput((s) => ({ ...s, y: e.target.value }))}
              placeholder={`${new Date().getFullYear()}`}
              className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-gold/20 text-white text-sm focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-200 mb-1">月份</label>
            <input
              type="number"
              min={1} max={12}
              value={input.m}
              onChange={(e) => setInput((s) => ({ ...s, m: e.target.value }))}
              placeholder={`${new Date().getMonth() + 1}`}
              className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-gold/20 text-white text-sm focus:outline-none focus:border-gold/50"
            />
          </div>
          <button
            type="submit"
            className="col-span-2 mt-2 px-6 py-3.5 rounded-xl bg-gold text-dark-900 font-semibold text-base shadow-lg shadow-gold/15 hover:bg-gold-light transition"
          >
            🧭 飞星排盘
          </button>
        </form>

        {/* 结果 */}
        {result && (
          <div className="mt-12 space-y-8">
            {/* 当月飞星盘 */}
            <div>
              <div className="text-xs text-gold/70 uppercase tracking-wider mb-3">
                流月飞星盘 · {input.m || new Date().getMonth() + 1}月（入中 {result.monthStar}）
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                {result.monthGong.map((g) => (
                  <div
                    key={g.num}
                    className="glass rounded-xl p-3 border aspect-square flex flex-col items-center justify-center relative"
                    style={{ borderColor: g.num === 5 ? "rgba(212,154,26,0.5)" : "rgba(255,255,255,0.1)" }}
                  >
                    <span className={`text-2xl font-serif font-bold ${STAR_BG[g.star.goodBad]}`}>
                      {g.star.name}
                    </span>
                    <span className="text-[10px] text-white/50 mt-0.5">{g.star.star}</span>
                    <span className={`text-[10px] mt-1 ${g.num === 5 ? "text-gold" : "text-white/40"}`}>
                      {g.dir}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 吉凶方位 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5 border border-emerald-500/30">
                <div className="text-sm text-emerald-300 mb-3">✨ 吉利方位（当月）</div>
                <div className="space-y-2">
                  {result.luckGongs.map((l) => (
                    <div key={l} className="text-sm text-gray-200">· {l}</div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-2xl p-5 border border-red-500/30">
                <div className="text-sm text-red-300 mb-3">⚠️ 凶煞方位（当月）</div>
                <div className="space-y-2">
                  {result.avoidGongs.map((a) => (
                    <div key={a} className="text-sm text-gray-200">· {a}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* 总断 */}
            <div className="glass rounded-2xl p-5 border border-gold/20">
              <div className="text-xs text-gold/70 uppercase tracking-wider mb-2">总断</div>
              <p className="text-gray-200 leading-relaxed">{result.summary}</p>
            </div>

            {/* 九星全览 */}
            <div className="pt-2">
              <div className="text-xs text-gold/70 uppercase tracking-wider mb-3">九星 · 全览</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {NINE_STARS.map((s) => (
                  <div key={s.num} className="glass rounded-xl p-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-gold">{s.name}{s.star}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STAR_BG[s.goodBad]}`}>{s.goodBad}</span>
                    </div>
                    <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed">{s.luck}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 text-center text-xs text-gray-500 leading-relaxed">
          玄空飞星 · 源自唐末杨筠松玄空学，九宫飞泊察方位吉凶。仅供传统文化研究与休闲参考。
        </div>
      </div>
    </div>
  );
}
