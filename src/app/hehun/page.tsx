"use client";

import { useState } from "react";

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function BirthForm({ title, icon, value, onChange, accent }: {
  title: string; icon: string; value: any;
  onChange: (v: any) => void; accent: string;
}) {
  const now = new Date();
  return (
    <div className="glass rounded-2xl p-5">
      <div className={`flex items-center gap-2 mb-4 ${accent}`}>
        <span className="text-2xl">{icon}</span>
        <span className="font-serif font-bold text-lg">{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">出生年份</label>
          <select value={value.year} onChange={(e) => onChange({ ...value, year: Number(e.target.value) })}
            className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
            {Array.from({ length: 80 }, (_, i) => now.getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">出生月份</label>
          <select value={value.month} onChange={(e) => onChange({ ...value, month: Number(e.target.value) })}
            className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">出生日</label>
          <select value={value.day} onChange={(e) => onChange({ ...value, day: Number(e.target.value) })}
            className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
            {DAYS.map((d) => <option key={d} value={d}>{d}日</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">出生时辰</label>
          <select value={value.hour} onChange={(e) => onChange({ ...value, hour: Number(e.target.value) })}
            className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none">
            <option value={0}>子时 23-1点</option>
            <option value={2}>丑时 1-3点</option>
            <option value={4}>寅时 3-5点</option>
            <option value={6}>卯时 5-7点</option>
            <option value={8}>辰时 7-9点</option>
            <option value={10}>巳时 9-11点</option>
            <option value={12}>午时 11-13点</option>
            <option value={14}>未时 13-15点</option>
            <option value={16}>申时 15-17点</option>
            <option value={18}>酉时 17-19点</option>
            <option value={20}>戌时 19-21点</option>
            <option value={22}>亥时 21-23点</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-400 mb-1">性别</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button"
              onClick={() => onChange({ ...value, gender: 1 })}
              className={`px-3 py-2 rounded-lg text-center text-sm font-semibold border transition ${
                value.gender === 1 ? "bg-gold text-dark-900 border-gold" : "bg-dark-700 border-gold/20 text-gray-400"
              }`}>男</button>
            <button type="button"
              onClick={() => onChange({ ...value, gender: 2 })}
              className={`px-3 py-2 rounded-lg text-center text-sm font-semibold border transition ${
                value.gender === 2 ? "bg-gold text-dark-900 border-gold" : "bg-dark-700 border-gold/20 text-gray-400"
              }`}>女</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const GOOD_STYLE: Record<string, string> = {
  吉: "bg-green-500/20 text-green-300 border-green-500/40",
  中: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  忌: "bg-red-500/20 text-red-300 border-red-500/40",
};

export default function HeHunPage() {
  const [man, setMan] = useState({ year: 1995, month: 5, day: 20, hour: 10, gender: 1 });
  const [woman, setWoman] = useState({ year: 1997, month: 8, day: 15, hour: 14, gender: 2 });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hehun", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ man, woman }),
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
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">八字合婚 · 良缘匹配</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">💑</div>
          <h1 className="text-3xl font-serif font-bold text-gold">八字合婚</h1>
          <p className="text-gray-400 mt-2">双方八字 · 剖析缘分 · 契合度评估</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <BirthForm title="男方生辰" icon="👨" value={man} onChange={setMan} accent="text-blue-300" />
            <BirthForm title="女方生辰" icon="👩" value={woman} onChange={setWoman} accent="text-pink-300" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full max-w-md mx-auto block btn-gold py-3 rounded-xl text-base font-semibold disabled:opacity-50">
            {loading ? "合婚中..." : "💞 合婚"}
          </button>
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        </form>

        {result && (
          <div className="mt-12 space-y-6">
            {/* 总分 + 等级 */}
            <div className="glass rounded-2xl p-6 border-gold/30 text-center">
              <div className="text-sm text-gray-400 mb-2">
                {result.manName} ⚓ {result.womanName} · 合婚契合度
              </div>
              <div className="text-6xl font-serif font-bold text-gold mb-2">{result.totalScore}</div>
              <div className="text-lg font-bold mb-3">{result.gradeIcon} {result.grade}</div>
              <div className="w-full max-w-sm mx-auto h-2.5 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-gold rounded-full"
                  style={{ width: `${result.totalScore}%` }} />
              </div>
            </div>

            {/* 双方八字 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5">
                <div className="text-blue-300 font-serif font-bold mb-2">👨 {result.manName} 命盘</div>
                <div className="text-3xl font-serif text-gold mb-1">{result.man["日主"]}</div>
                <div className="text-xs text-gray-500">日主{result.man["日主五行"]} · 身{result.man["日主力量"]} · 用神{result.man["用神"]}</div>
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="text-pink-300 font-serif font-bold mb-2">👩 {result.womanName} 命盘</div>
                <div className="text-3xl font-serif text-gold mb-1">{result.woman["日主"]}</div>
                <div className="text-xs text-gray-500">日主{result.woman["日主五行"]} · 身{result.woman["日主力量"]} · 用神{result.woman["用神"]}</div>
              </div>
            </div>

            {/* 逐维度评分 */}
            <div>
              <h3 className="text-center text-gold font-serif font-bold text-lg mb-4">五项契合分析</h3>
              <div className="space-y-3">
                {result.items.map((it: any, i: number) => (
                  <div key={i} className="glass rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-200 w-20">{it.dim}</span>
                      <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-gold rounded-full" style={{ width: `${it.score}%` }} />
                      </div>
                      <span className="text-sm font-bold text-gold w-10 text-right">{it.score}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${GOOD_STYLE[it.good]}`}>{it.good}</span>
                    </div>
                    <p className="text-sm text-gray-400">{it.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 相合 vs 相冲 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5 border-green-500/30">
                <h4 className="text-green-300 font-serif font-bold mb-3">✓ 相合之处</h4>
                {result.chiHe.length > 0 ? (
                  <ul className="space-y-1.5 text-sm text-gray-300">
                    {result.chiHe.map((c: string, i: number) => (
                      <li key={i} className="flex gap-2"><span className="text-green-400">▸</span>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">暂无显著相合之处</p>
                )}
              </div>
              <div className="glass rounded-2xl p-5 border-red-500/20">
                <h4 className="text-red-300 font-serif font-bold mb-3">⚠ 相冲相害</h4>
                {result.chongHai.length > 0 ? (
                  <ul className="space-y-1.5 text-sm text-gray-300">
                    {result.chongHai.map((c: string, i: number) => (
                      <li key={i} className="flex gap-2"><span className="text-red-400">▸</span>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">无显著相冲，大吉</p>
                )}
              </div>
            </div>

            {/* 大师总评 */}
            <div className="glass rounded-2xl p-6 border-gold/40">
              <h3 className="text-gold font-serif font-bold text-center mb-3">大师总评</h3>
              <p className="text-gray-200 leading-relaxed text-center">{result.summary}</p>
            </div>

            <div className="text-center">
              <button onClick={() => setResult(null)} className="btn-gold-outline px-6 py-3 rounded-xl text-sm">重新合婚</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
