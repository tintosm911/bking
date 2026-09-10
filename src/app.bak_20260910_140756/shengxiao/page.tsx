"use client";

import { useState } from "react";
import {
  shengxiaoProfile, ShengxiaoProfile,
  shengxiaoLiunian, LiunianItem,
  shengxiaoPair, PairResult,
  shengxiaoBazi, ShengxiaoBazi,
} from "@/lib/shengxiao_engine";

const SX = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const SX_ICON: Record<string, string> = {
  鼠: "🐭", 牛: "🐮", 虎: "🐯", 兔: "🐰", 龙: "🐲", 蛇: "🐍",
  马: "🐴", 羊: "🐏", 猴: "🐵", 鸡: "🐔", 狗: "🐶", 猪: "🐷",
};
const YEARS = Array.from({ length: 90 }, (_, i) => new Date().getFullYear() - 20 - i);

const TABS = [
  { id: "liunian", name: "流年运势", icon: "📅", desc: "本命年 · 太岁 · 吉凶方位" },
  { id: "pair", name: "生肖配对", icon: "💑", desc: "六合 · 三合 · 相冲相害" },
  { id: "bazi", name: "命盘结合", icon: "☯️", desc: "属相五行 × 八字格局" },
];

const HOURS: [string, number][] = [
  ["子时 23-1点", 0], ["丑时 1-3点", 2], ["寅时 3-5点", 4], ["卯时 5-7点", 6],
  ["辰时 7-9点", 8], ["巳时 9-11点", 10], ["午时 11-13点", 12], ["未时 13-15点", 14],
  ["申时 15-17点", 16], ["酉时 17-19点", 18], ["戌时 19-21点", 20], ["亥时 21-23点", 22],
];

function BirthForm({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">出生年份</label>
        <select value={value.year} onChange={(e) => onChange({ ...value, year: Number(e.target.value) })}
          className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
          {YEARS.map((y) => <option key={y} value={y}>{y}年</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">月份</label>
        <select value={value.month} onChange={(e) => onChange({ ...value, month: Number(e.target.value) })}
          className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}月</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">日期</label>
        <select value={value.day} onChange={(e) => onChange({ ...value, day: Number(e.target.value) })}
          className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}日</option>)}
        </select>
      </div>
    </div>
  );
}

const PLANET_COLORS: Record<string, string> = {
  六合: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  三合: "bg-green-500/20 text-green-300 border-green-500/40",
  相合: "bg-teal-500/20 text-teal-300 border-teal-500/40",
  平: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  相刑: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  相害: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  相冲: "bg-red-500/20 text-red-300 border-red-500/40",
  本命年: "bg-red-600/20 text-red-300 border-red-600/40",
};

function relationBadge(fortune: string): string {
  if (fortune.includes("本命年")) return "本命年";
  if (fortune.includes("六合")) return "六合";
  if (fortune.includes("三合")) return "三合";
  if (fortune.includes("相冲")) return "相冲";
  if (fortune.includes("相害")) return "相害";
  return "平";
}

export default function ShengXiaoPage() {
  const [tab, setTab] = useState("liunian");
  const [birth1, setBirth1] = useState({ year: 1990, month: 3, day: 15, hour: 10, gender: 1 });
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [sxA, setSxA] = useState("鼠");
  const [sxB, setSxB] = useState("牛");
  const [profile, setProfile] = useState<ShengxiaoProfile | null>(null);
  const [liunian, setLiunian] = useState<LiunianItem | null>(null);
  const [pair, setPair] = useState<PairResult | null>(null);
  const [bazi, setBazi] = useState<ShengxiaoBazi | null>(null);

  const runLiunian = () => {
    const p = shengxiaoProfile(birth1.year, birth1.month, birth1.day);
    setProfile(p);
    setLiunian(shengxiaoLiunian(p.zodiac, targetYear));
  };
  const runPair = () => setPair(shengxiaoPair(sxA, sxB));
  const runBazi = () => setBazi(shengxiaoBazi(birth1.year, birth1.month, birth1.day, birth1.hour, birth1.gender));

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">十二生肖 · 命理玄机</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🐲</div>
          <h1 className="text-3xl font-serif font-bold text-gold">十二生肖</h1>
          <p className="text-gray-400 mt-2">流年运势 · 生肖配对 · 命盘结合，以生肖为钩，入八字玄机之门</p>
        </div>

        {/* 选项卡 */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                tab === t.id ? "bg-gold text-dark-900 border-gold" : "bg-dark-700 border-gold/20 text-gray-400 hover:border-gold/50"
              }`}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>

        {/* ===== 流年运势 ===== */}
        {tab === "liunian" && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-serif font-bold text-gold mb-4">📅 本命年 · 流年运势</h3>
              <BirthForm value={birth1} onChange={setBirth1} />
              <div className="mt-4">
                <label className="block text-xs text-gray-400 mb-1">查看年份</label>
                <select value={targetYear} onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
                  {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                    <option key={y} value={y}>{y}年</option>
                  ))}
                </select>
              </div>
              <button onClick={runLiunian} className="mt-4 w-full btn-gold py-3 rounded-xl font-semibold">📅 起流年运势</button>
            </div>

            {profile && (
              <div className="glass rounded-2xl p-5 border-gold/30">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{SX_ICON[profile.zodiac]}</span>
                  <div>
                    <div className="text-2xl font-serif font-bold text-gold">属{profile.zodiac}</div>
                    <div className="text-sm text-gray-400">五行 · {profile.wuxing}{profile.benmingnian ? " ｜ 适值本命年" : ""}</div>
                  </div>
                </div>
                <p className="mt-3 text-gray-300 text-sm leading-relaxed">{profile.personality}</p>
              </div>
            )}

            {liunian && (
              <div className="glass rounded-2xl p-6 border-gold/30">
                <span className={`inline-block px-3 py-1 rounded-full border text-sm font-bold mb-3 ${PLANET_COLORS[relationBadge(liunian.fortune)]}`}>
                  {liunian.fortune}
                </span>
                <p className="text-gray-300 leading-relaxed">{liunian.detail}</p>
                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="bg-dark-700/60 rounded-xl p-3">
                    <div className="text-gold font-semibold mb-1">✨ 贵人吉神</div>
                    <div className="text-gray-300">{liunian.lucky}</div>
                  </div>
                  <div className="bg-dark-700/60 rounded-xl p-3">
                    <div className="text-gold font-semibold mb-1">🧭 幸运方位</div>
                    <div className="text-gray-300">{liunian.direction}</div>
                  </div>
                  <div className="bg-dark-700/60 rounded-xl p-3">
                    <div className="text-emerald-300 font-semibold mb-1">✅ 宜</div>
                    <div className="text-gray-300">{liunian.good}</div>
                  </div>
                  <div className="bg-dark-700/60 rounded-xl p-3">
                    <div className="text-red-300 font-semibold mb-1">🚫 忌</div>
                    <div className="text-gray-300">{liunian.bad}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== 生肖配对 ===== */}
        {tab === "pair" && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-serif font-bold text-gold mb-4">💑 生肖配对 · 合婚参考</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">甲属相</label>
                  <select value={sxA} onChange={(e) => setSxA(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
                    {SX.map((s) => <option key={s} value={s}>{SX_ICON[s]} 属{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">乙属相</label>
                  <select value={sxB} onChange={(e) => setSxB(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
                    {SX.map((s) => <option key={s} value={s}>{SX_ICON[s]} 属{s}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={runPair} className="mt-4 w-full btn-gold py-3 rounded-xl font-semibold">💞 配对合婚</button>
            </div>

            {pair && (
              <div className="space-y-5">
                <div className="glass rounded-2xl p-6 border-gold/30 text-center">
                  <div className="flex items-center justify-center gap-6 mb-3">
                    <div className="text-center">
                      <div className="text-5xl">{SX_ICON[pair.zodiacA]}</div>
                      <div className="text-lg font-serif font-bold text-gold mt-1">属{pair.zodiacA}</div>
                    </div>
                    <div className="text-3xl text-gold/50">❤️</div>
                    <div className="text-center">
                      <div className="text-5xl">{SX_ICON[pair.zodiacB]}</div>
                      <div className="text-lg font-serif font-bold text-gold mt-1">属{pair.zodiacB}</div>
                    </div>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full border text-sm font-bold mb-2 ${PLANET_COLORS[pair.relation]}`}>关系 · {pair.relation}</span>
                  <div className="text-5xl font-serif font-bold text-gold mb-1">{pair.score}</div>
                  <div className="text-lg font-bold mb-1">{pair.gradeIcon} {pair.grade}</div>
                  <div className="w-full max-w-sm mx-auto h-2.5 bg-dark-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      pair.score >= 85 ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : pair.score >= 70 ? "bg-gradient-to-r from-amber-400 to-gold"
                      : pair.score >= 55 ? "bg-gradient-to-r from-orange-400 to-amber-500"
                      : "bg-gradient-to-r from-red-500 to-red-400"}`}
                      style={{ width: `${pair.score}%` }} />
                  </div>
                  <p className="mt-3 text-gray-300">{pair.detail}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {pair.match.length > 0 && (
                    <div className="glass rounded-2xl p-5 border-emerald-500/30">
                      <h4 className="text-emerald-300 font-serif font-bold mb-3">✓ 相合之处</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {pair.match.map((m, i) => <li key={i} className="flex gap-2"><span className="text-emerald-400">▸</span>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  {pair.mismatch.length > 0 && (
                    <div className="glass rounded-2xl p-5 border-red-500/30">
                      <h4 className="text-red-300 font-serif font-bold mb-3">⚠ 相冲相害</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {pair.mismatch.map((m, i) => <li key={i} className="flex gap-2"><span className="text-red-400">▸</span>{m}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center">※ 生肖配对为民俗参考，缘分终靠两人用心经营。</p>
              </div>
            )}
          </div>
        )}

        {/* ===== 命盘结合 ===== */}
        {tab === "bazi" && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-serif font-bold text-gold mb-4">☯️ 属相五行 × 八字格局</h3>
              <BirthForm value={birth1} onChange={setBirth1} />
              <div className="mt-4">
                <label className="block text-xs text-gray-400 mb-1">出生时辰</label>
                <select value={birth1.hour} onChange={(e) => setBirth1({ ...birth1, hour: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
                  {HOURS.map(([label, v]) => <option key={v} value={v}>{label}</option>)}
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-xs text-gray-400 mb-1">性别</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setBirth1({ ...birth1, gender: 1 })}
                    className={`px-3 py-2 rounded-lg text-center text-sm font-semibold border transition ${
                      birth1.gender === 1 ? "bg-gold text-dark-900 border-gold" : "bg-dark-700 border-gold/20 text-gray-400"
                    }`}>男</button>
                  <button type="button" onClick={() => setBirth1({ ...birth1, gender: 2 })}
                    className={`px-3 py-2 rounded-lg text-center text-sm font-semibold border transition ${
                      birth1.gender === 2 ? "bg-gold text-dark-900 border-gold" : "bg-dark-700 border-gold/20 text-gray-400"
                    }`}>女</button>
                </div>
              </div>
              <button onClick={runBazi} className="mt-4 w-full btn-gold py-3 rounded-xl font-semibold">☯️ 起命盘</button>
            </div>

            {bazi && (
              <div className="space-y-5">
                <div className="glass rounded-2xl p-5 border-gold/30 text-center">
                  <span className="text-5xl">{SX_ICON[bazi.zodiac]}</span>
                  <div className="text-2xl font-serif font-bold text-gold mt-1">属{bazi.zodiac}</div>
                  <div className="text-sm text-gray-400">五行 {bazi.wuxing} · 本命年 {bazi.benmingYear}</div>
                  <div className="text-3xl font-serif text-gold mt-2">{bazi.dayMaster}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    日主{bazi.dayMaster} · 身{bazi.strong ? "强" : "弱"} · 用神{bazi.yongshen} · 忌神{bazi.jishen}
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h4 className="text-gold font-serif font-bold mb-3">🔗 属相 × 命局 呼应</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {bazi.fit.map((f, i) => <li key={i} className="flex gap-2"><span className="text-gold">▸</span>{f}</li>)}
                  </ul>
                </div>

                <div className="glass rounded-2xl p-5 border-emerald-500/30">
                  <h4 className="text-emerald-300 font-serif font-bold mb-2">📌 命盘结论</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{bazi.notes}</p>
                </div>
                <p className="text-xs text-gray-500 text-center">※ 生肖与八字结合为传统文化视角解读，非科学预测，供参详娱乐。</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
