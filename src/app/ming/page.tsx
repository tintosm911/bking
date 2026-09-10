"use client";

import { useState } from "react";
import {
  mingDivination, MingResult,
  scoreNameEx, NameScore, Element,
} from "@/lib/ming_engine";

const EL_COLOR: Record<string, string> = {
  金: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  木: "bg-green-500/20 text-green-300 border-green-500/40",
  水: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  火: "bg-red-500/20 text-red-300 border-red-500/40",
  土: "bg-amber-600/20 text-amber-300 border-amber-600/40",
};
const GRADE_COLOR: Record<string, string> = {
  大吉: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  吉: "bg-teal-500/20 text-teal-300 border-teal-500/40",
  半吉: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  平: "bg-gray-500/20 text-gray-100 border-gray-500/40",
  凶: "bg-red-500/20 text-red-300 border-red-500/40",
};

const HOURS: [string, number][] = [
  ["子时 23-1点", 0], ["丑时 1-3点", 2], ["寅时 3-5点", 4], ["卯时 5-7点", 6],
  ["辰时 7-9点", 8], ["巳时 9-11点", 10], ["午时 11-13点", 12], ["未时 13-15点", 14],
  ["申时 15-17点", 16], ["酉时 17-19点", 18], ["戌时 19-21点", 20], ["亥时 21-23点", 22],
];
const YEARS = Array.from({ length: 90 }, (_, i) => new Date().getFullYear() - 10 - i);

const TABS = [
  { id: "ming", name: "八字起名", icon: "🖋️", desc: "用神补五行 · 五格数理" },
  { id: "score", name: "测名字", icon: "📊", desc: "输入名字看分数·五行·数理" },
];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? "from-emerald-400 to-emerald-500"
    : score >= 70 ? "from-amber-400 to-gold"
    : score >= 55 ? "from-orange-400 to-amber-500"
    : "from-red-500 to-red-400";
  return (
    <div className="w-full max-w-sm mx-auto h-2.5 bg-dark-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

function WuGeRow({ label, n, grade }: { label: string; n: number; grade: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-dark-700/60 rounded-lg text-sm">
      <span className="text-gray-200">{label}</span>
      <span className="text-gold font-bold">{n}</span>
      <span className={`px-2 py-0.5 rounded-full border text-xs ${GRADE_COLOR[grade] || GRADE_COLOR["平"]}`}>{grade}</span>
    </div>
  );
}

export default function MingPage() {
  const [tab, setTab] = useState("ming");
  const [surname, setSurname] = useState("李");
  const [given, setGiven] = useState("嘉瑞");
  const [birth, setBirth] = useState({ year: 1990, month: 3, day: 15, hour: 10, gender: 1 });
  const [result, setResult] = useState<MingResult | null>(null);
  const [score, setScore] = useState<NameScore | null>(null);

  const runMing = () => setResult(mingDivination(surname, birth.year, birth.month, birth.day, birth.hour, birth.gender));
  const runScore = () => setScore(scoreNameEx(surname + given));

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">起名 · 姓名学</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🖋️</div>
          <h1 className="text-3xl font-serif font-bold text-gold">起名 · 姓名学</h1>
          <p className="text-gray-200 mt-2">八字用神起名 · 五格数理 · 五行补益，一名字定乾坤</p>
        </div>

        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                tab === t.id ? "bg-gold text-dark-900 border-gold" : "bg-dark-700 border-gold/20 text-gray-200 hover:border-gold/50"
              }`}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>

        {/* ===== 八字起名 ===== */}
        {tab === "ming" && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-serif font-bold text-gold mb-4">🖋️ 八字起名 · 用神补五行</h3>
              <div>
                <label className="block text-xs text-gray-200 mb-1">姓氏</label>
                <input value={surname} onChange={(e) => setSurname(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none" placeholder="输入姓氏" maxLength={1} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div>
                  <label className="block text-xs text-gray-200 mb-1">出生年份</label>
                  <select value={birth.year} onChange={(e) => setBirth({ ...birth, year: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 outline-none">
                    {YEARS.map((y) => <option key={y} value={y}>{y}年</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-200 mb-1">月份</label>
                  <select value={birth.month} onChange={(e) => setBirth({ ...birth, month: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 outline-none">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}月</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-200 mb-1">日期</label>
                  <select value={birth.day} onChange={(e) => setBirth({ ...birth, day: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 outline-none">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}日</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs text-gray-200 mb-1">出生时辰</label>
                <select value={birth.hour} onChange={(e) => setBirth({ ...birth, hour: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 outline-none">
                  {HOURS.map(([label, v]) => <option key={v} value={v}>{label}</option>)}
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-xs text-gray-200 mb-1">性别</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setBirth({ ...birth, gender: 1 })}
                    className={`px-3 py-2 rounded-lg text-center text-sm font-semibold border transition ${
                      birth.gender === 1 ? "bg-gold text-dark-900 border-gold" : "bg-dark-700 border-gold/20 text-gray-200"
                    }`}>男</button>
                  <button type="button" onClick={() => setBirth({ ...birth, gender: 2 })}
                    className={`px-3 py-2 rounded-lg text-center text-sm font-semibold border transition ${
                      birth.gender === 2 ? "bg-gold text-dark-900 border-gold" : "bg-dark-700 border-gold/20 text-gray-200"
                    }`}>女</button>
                </div>
              </div>
              <button onClick={runMing} className="mt-4 w-full btn-gold py-3 rounded-xl font-semibold">🖋️ 起名</button>
            </div>

            {result && (
              <div className="space-y-5">
                <div className="glass rounded-2xl p-5 border-gold/30">
                  <h4 className="text-gold font-serif font-bold mb-2">☯️ 命盘用神</h4>
                  <p className="text-sm text-gray-100 leading-relaxed">{result.yongshenNote}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {result.target.yongshen && (
                      <span className={`px-3 py-1 rounded-full border text-sm font-bold ${EL_COLOR[result.target.yongshen]}`}>用神 · 补「{result.target.yongshen}」</span>
                    )}
                    {result.target.jishen && (
                      <span className={`px-3 py-1 rounded-full border text-sm font-bold ${EL_COLOR[result.target.jishen]}`}>忌「{result.target.jishen}」</span>
                    )}
                  </div>
                </div>

                {[
                  ["✨ 单字推荐", result.single],
                  ["✨ 双字推荐", result.double],
                ].map(([title, list]) => (
                  <div key={title as string} className="glass rounded-2xl p-5">
                    <h4 className="text-gold font-serif font-bold mb-4">{title as string}</h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(list as MingResult["single"]).slice(0, 9).map((s, i) => (
                        <div key={i} className="bg-dark-700/60 rounded-xl p-4 border border-gold/10">
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-serif font-bold text-gold">{s.full}</span>
                            <span className={`px-2 py-0.5 rounded-full border text-xs ${EL_COLOR[s.element]}`}>{s.element}</span>
                          </div>
                          <div className="text-2xl font-serif font-bold text-white my-1">{s.score}<span className="text-sm text-gray-300">分</span></div>
                          <ScoreBar score={s.score} />
                          <p className="text-xs text-gray-200 mt-2 leading-relaxed">{s.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-300 text-center">※ 起名参考传统文化姓名学，非科学依据；好名字更要重善、重愿、重德。</p>
              </div>
            )}
          </div>
        )}

        {/* ===== 测名字 ===== */}
        {tab === "score" && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-serif font-bold text-gold mb-4">📊 测名字 · 五行数理</h3>
              <label className="block text-xs text-gray-200 mb-1">姓名</label>
              <input value={surname + given} onChange={(e) => {
                const v = e.target.value;
                setSurname(v.charAt(0) || "");
                setGiven(v.slice(1));
              }}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none" placeholder="输入全名（如：李嘉瑞）" maxLength={4} />
              <button onClick={runScore} className="mt-4 w-full btn-gold py-3 rounded-xl font-semibold">📊 测名</button>
            </div>

            {score && (
              <div className="space-y-5">
                <div className="glass rounded-2xl p-6 border-gold/30 text-center">
                  <div className="text-6xl font-serif font-bold text-gold my-2">{score.score}</div>
                  <div className="text-amber-200 font-semibold">{score.verdict}</div>
                  <div className="w-full max-w-sm mx-auto mt-3"><ScoreBar score={score.score} /></div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h4 className="text-gold font-serif font-bold mb-3">🔤 汉字五行</h4>
                  <div className="flex gap-2 flex-wrap">
                    {score.chars.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-dark-700/60 border border-gold/10 text-sm">
                        <b className="text-white">{c.char}</b>
                        {c.element ? <span className={`ml-2 px-1.5 rounded border text-xs ${EL_COLOR[c.element]}`}>{c.element}</span> : <span className="ml-2 text-gray-300 text-xs">中性</span>}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-gray-200">
                    {score.chars.map((c, i) => (
                      <p key={i} className="mb-1">「{c.char}」{c.meaning}</p>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h4 className="text-gold font-serif font-bold mb-3">🔢 五格数理</h4>
                  <div className="space-y-2">
                    <WuGeRow label="天格（先天运）" n={score.wuge.tian} grade={score.wuge.tianJ} />
                    <WuGeRow label="人格（主运）" n={score.wuge.ren} grade={score.wuge.renJ} />
                    <WuGeRow label="地格（前运）" n={score.wuge.di} grade={score.wuge.diJ} />
                    <WuGeRow label="外格（副运）" n={score.wuge.wai} grade={score.wuge.waiJ} />
                    <WuGeRow label="总格（完运）" n={score.wuge.zong} grade={score.wuge.zongJ} />
                  </div>
                </div>
                <p className="text-xs text-gray-300 text-center">※ 数理吉凶为姓名学传统流派解读，供参详娱乐，非科学预测。</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
