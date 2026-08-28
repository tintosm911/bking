"use client";

import { useState } from "react";

interface TianjiMember {
  name: string;
  gender: string;
  solar_date: string;
  birth_time: string;
  birth_city: string;
}

const WUXING_COLORS: Record<string, string> = {
  "金": "bg-yellow-400",
  "木": "bg-green-500",
  "水": "bg-blue-500",
  "火": "bg-red-500",
  "土": "bg-amber-600",
};

export default function TianjiPage() {
  const [members, setMembers] = useState<TianjiMember[]>([
    { name: "", gender: "男", solar_date: "", birth_time: "12:00", birth_city: "北京" },
  ]);
  const [scene, setScene] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeMember, setActiveMember] = useState(0);

  const addMember = () => {
    setMembers([...members, { name: "", gender: "男", solar_date: "", birth_time: "12:00", birth_city: "北京" }]);
  };

  const removeMember = (i: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, idx) => idx !== i));
      if (activeMember >= members.length - 1) setActiveMember(members.length - 2);
    }
  };

  const updateMember = (i: number, field: keyof TianjiMember, value: string) => {
    const updated = [...members];
    (updated[i] as any)[field] = value;
    setMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: any = { members };
    if (members.length > 1) {
      if (members.length === 2) {
        const ageDiff = Math.abs(
          new Date(members[0].solar_date).getFullYear() -
          new Date(members[1].solar_date).getFullYear()
        );
        if (ageDiff >= 15) payload.scene = "亲子";
        else if (members[0].gender !== members[1].gender) payload.scene = "情侣";
        else payload.scene = "搭档";
      } else {
        payload.scene = "工作团队";
      }
    }

    try {
      const res = await fetch("/api/tianji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.data);
      }
    } catch (err: any) {
      setError(err.message || "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">天机 · 综合命理测算</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">☯️</div>
          <h1 className="text-3xl font-serif font-bold text-gold">天机 · 综合命理测算</h1>
          <p className="text-gray-400 mt-2">八字五行 · 称骨算命 · 紫微斗数 · 西洋星座 · 三才五格 · 合盘分析</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
          {members.map((m, i) => (
            <div key={i} className="glass rounded-2xl p-5 border border-gold/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gold font-serif font-bold">
                  {members.length > 1 ? `第 ${i + 1} 位` : "个人信息"}
                </h3>
                {members.length > 1 && (
                  <button type="button" onClick={() => removeMember(i)}
                    className="text-red-400 hover:text-red-300 text-sm">
                    ✕ 移除
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">姓名</label>
                  <input type="text" value={m.name}
                    onChange={(e) => updateMember(i, "name", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none text-sm"
                    placeholder="张三" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">性别</label>
                  <select value={m.gender}
                    onChange={(e) => updateMember(i, "gender", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none text-sm">
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">出生日期</label>
                  <input type="date" value={m.solar_date}
                    onChange={(e) => updateMember(i, "solar_date", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">出生时间</label>
                  <input type="time" value={m.birth_time}
                    onChange={(e) => updateMember(i, "birth_time", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">出生城市</label>
                  <input type="text" value={m.birth_city}
                    onChange={(e) => updateMember(i, "birth_city", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-gold/20 text-white focus:border-gold/50 outline-none text-sm"
                    placeholder="北京" />
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <button type="button" onClick={addMember}
              className="btn-gold-outline px-4 py-2 rounded-xl text-sm">
              + 添加成员（合盘）
            </button>
          </div>

          <button type="submit" disabled={loading}
            className="w-full btn-gold py-3 rounded-xl text-base font-semibold disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">☯</span> 命盘解析中...
              </span>
            ) : "🔮 开始测算"}
          </button>

          {error && (
            <div className="text-red-400 text-sm text-center mt-2 bg-red-900/20 rounded-xl p-3 border border-red-500/20">
              {error}
            </div>
          )}
        </form>

        {/* Results */}
        {result && result.members && (
          <div className="mt-12 space-y-8">
            {/* Person tabs */}
            {result.members.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {result.members.map((_: any, idx: number) => (
                  <button key={idx} onClick={() => setActiveMember(idx)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      idx === activeMember
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "bg-dark-700 text-gray-400 border border-gold/10 hover:border-gold/30"
                    }`}>
                    {result.members[idx].name || `第${idx + 1}位`}
                  </button>
                ))}
              </div>
            )}

            {result.members.map((person: any, pi: number) => (
              <div key={pi} className={pi !== activeMember ? "hidden" : ""}>
                <div className="text-center mb-6">
                  <div className="inline-block px-4 py-1 bg-gold/10 rounded-full text-gold text-sm border border-gold/20 mb-3">
                    {person.name} · 命盘解析完成
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-gold">{person.name} 的完整命盘</h2>
                </div>

                {/* 八字四柱 */}
                <div className="glass rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-serif font-bold text-gold mb-4 text-center">【八字四柱】</h3>
                  <div className="grid grid-cols-4 gap-3 text-center mb-4">
                    {["年柱", "月柱", "日柱", "时柱"].map((col, ci) => (
                      <div key={col} className="bg-dark-700 rounded-xl p-3 border border-gold/10">
                        <div className="text-xs text-gray-500 mb-1">{col}</div>
                        <div className="text-2xl font-serif font-bold text-gold-light">
                          {person.bazi?.[ci] || "--"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{person.nayins?.[ci] || ""}</div>
                      </div>
                    ))}
                  </div>
                  {person.day_gan && (
                    <div className="text-center p-3 bg-dark-700 rounded-xl border border-gold/10">
                      <span className="text-gray-400 text-sm">日主：</span>
                      <span className="text-2xl font-serif font-bold text-gold-light mx-2">{person.day_gan}</span>
                      <span className="text-gray-400 text-sm">生肖：{person.shengxiao || "--"}</span>
                    </div>
                  )}
                </div>

                {/* 五行旺衰 */}
                {person.wx && (
                  <div className="glass rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-serif font-bold text-gold mb-4 text-center">【五行旺衰】</h3>
                    <div className="space-y-3">
                      {Object.entries(person.wx).map(([wx, count]: [string, any]) => {
                        const maxCount = Math.max(...Object.values(person.wx).map((v: any) => Number(v)));
                        const pct = maxCount > 0 ? ((count as number) / maxCount) * 100 : 0;
                        return (
                          <div key={wx} className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full ${WUXING_COLORS[wx] || "bg-gold"} flex items-center justify-center text-xs font-bold text-dark-900`}>{wx}</span>
                            <div className="flex-1 h-4 bg-dark-700 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${WUXING_COLORS[wx] || "bg-gold"} transition-all duration-700`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-8 text-right font-mono">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                    {person.missing_wx && person.missing_wx.length > 0 && (
                      <div className="mt-3 text-center text-sm text-yellow-400">
                        🔸 缺失五行：{person.missing_wx.join("、")}
                      </div>
                    )}
                  </div>
                )}

                {/* 称骨算命 */}
                {person.chenggu && (
                  <div className="glass rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-serif font-bold text-gold mb-4 text-center">【称骨算命】</h3>
                    <div className="grid grid-cols-5 gap-2 text-center mb-4">
                      {Object.entries(person.chenggu).filter(([k]) => k !== "等级" && k !== "歌诀").map(([key, val]) => (
                        <div key={key} className="bg-dark-700 rounded-xl p-2 border border-gold/10">
                          <div className="text-xs text-gray-500 mb-1">{key}</div>
                          <div className="text-sm font-bold text-gold-light">{val as string}</div>
                        </div>
                      ))}
                    </div>
                    {person.chenggu["总重"] && (
                      <div className="text-center">
                        <div className="inline-block bg-gold/10 rounded-xl px-6 py-2 border border-gold/20">
                          <span className="text-gray-400 text-sm">总重：</span>
                          <span className="text-xl font-bold text-gold">{person.chenggu["总重"]}</span>
                          {person.chenggu["等级"] && (
                            <span className="ml-3 text-sm text-yellow-400">({person.chenggu["等级"]})</span>
                          )}
                        </div>
                      </div>
                    )}
                    {person.chenggu["歌诀"] && (
                      <div className="mt-3 p-3 bg-dark-700 rounded-xl border border-gold/10">
                        <p className="text-sm text-gray-300 text-center leading-relaxed italic">「{person.chenggu["歌诀"]}」</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 紫微斗数 */}
                {person.ziwei && (
                  <div className="glass rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-serif font-bold text-gold mb-4 text-center">【紫微斗数】</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                      {[
                        ["命宫", person.ziwei.life_palace],
                        ["身宫", person.ziwei.body_palace],
                        ["五行局", person.ziwei.wuxing_ju],
                        ["命主", person.ziwei.life_master],
                        ["身主", person.ziwei.body_master],
                        ["大运方向", person.ziwei.dayun_direction],
                      ].map(([label, val]) => (
                        <div key={label as string} className="bg-dark-700 rounded-xl p-2 text-center border border-gold/10">
                          <div className="text-xs text-gray-500">{label as string}</div>
                          <div className="text-sm font-bold text-gold-light mt-1">{val as string || "--"}</div>
                        </div>
                      ))}
                    </div>
                    {person.ziwei.life_palace_stars && (
                      <div className="text-center mb-4">
                        <div className="inline-block bg-gold/10 rounded-xl px-6 py-2 border border-gold/20">
                          <span className="text-gray-400 text-sm">命宫主星：</span>
                          <span className="text-lg font-bold text-gold-light">{person.ziwei.life_palace_stars}</span>
                        </div>
                      </div>
                    )}
                    {person.ziwei.格局 && person.ziwei.格局.length > 0 && (
                      <div className="text-center">
                        <span className="text-xs text-gray-400">格局：</span>
                        {(person.ziwei.格局 as string[]).map((g: string, gi: number) => (
                          <span key={gi} className="inline-block px-2 py-0.5 bg-gold/10 rounded text-xs text-gold ml-1">{g}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 西洋星座 */}
                {person.zodiac && (
                  <div className="glass rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-serif font-bold text-gold mb-4 text-center">【西洋星座】</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "太阳星座", value: person.zodiac.sun_sign, emoji: "☀️", desc: "核心意志" },
                        { label: "月亮星座", value: person.zodiac.moon_sign, emoji: "🌙", desc: "情绪需求" },
                        { label: "上升星座", value: person.zodiac.rising_sign, emoji: "🌅", desc: "社交面具" },
                      ].map((item) => (
                        <div key={item.label} className="bg-dark-700 rounded-xl p-4 text-center border border-gold/10">
                          <div className="text-2xl mb-1">{item.emoji}</div>
                          <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                          <div className="text-lg font-bold text-gold-light">{item.value || "--"}</div>
                          <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 三才五格 */}
                {person.name_wuge && (
                  <div className="glass rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-serif font-bold text-gold mb-4 text-center">【三才五格】</h3>
                    <div className="grid grid-cols-5 gap-2 text-center mb-4">
                      {["天格", "人格", "地格", "外格", "总格"].map((ge) => {
                        const data = person.name_wuge[ge];
                        return (
                          <div key={ge} className="bg-dark-700 rounded-xl p-2 border border-gold/10">
                            <div className="text-xs text-gray-500">{ge}</div>
                            <div className="text-sm font-bold text-gold-light mt-1">{data?.数理 || "--"}</div>
                            <div className={`text-xs mt-0.5 ${
                              data?.吉凶?.includes("大吉") ? "text-green-400" :
                              data?.吉凶?.includes("吉") ? "text-green-300" :
                              data?.吉凶?.includes("凶") ? "text-red-400" : "text-gray-400"
                            }`}>{data?.吉凶 || ""}</div>
                          </div>
                        );
                      })}
                    </div>
                    {person.name_wuge["综合评分"] && (
                      <div className="text-center">
                        <span className="text-gray-400 text-sm">综合评分：</span>
                        <span className={`text-xl font-bold ${
                          (person.name_wuge["综合评分"] as number) >= 80 ? "text-green-400" :
                          (person.name_wuge["综合评分"] as number) >= 60 ? "text-yellow-400" : "text-red-400"
                        }`}>{person.name_wuge["综合评分"]}</span>
                        {person.name_wuge["综合评级"] && (
                          <span className="ml-2 text-sm text-gray-400">({person.name_wuge["综合评级"]})</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* 合盘分析 */}
            {result.synastry && result.members.length > 1 && (
              <div className="glass rounded-2xl p-6 border border-gold/20">
                <h3 className="text-xl font-serif font-bold text-gold mb-6 text-center">【合盘分析】</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "五行平衡", value: result.synastry.scores?.wuxing_balance, max: 20 },
                    { label: "生肖关系", value: result.synastry.scores?.shengxiao, max: 20 },
                    { label: "日主生克", value: result.synastry.scores?.rizhu, max: 20 },
                    { label: "星座相位", value: result.synastry.scores?.zodiac, max: 15 },
                  ].map((item) => (
                    <div key={item.label} className="bg-dark-700 rounded-xl p-4 text-center border border-gold/10">
                      <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                      <div className={`text-2xl font-bold ${
                        item.value && (item.value as number) / (item.max || 1) >= 0.7 ? "text-green-400" :
                        item.value && (item.value as number) / (item.max || 1) >= 0.4 ? "text-yellow-400" : "text-red-400"
                      }`}>{item.value ?? "--"}</div>
                      <div className="text-xs text-gray-500 mt-1">/ {item.max}</div>
                    </div>
                  ))}
                </div>
                {result.synastry.total !== undefined && (
                  <div className="text-center">
                    <div className="inline-block bg-gold/10 rounded-xl px-8 py-3 border border-gold/20">
                      <span className="text-gray-400 text-sm">综合匹配度：</span>
                      <span className="text-2xl font-bold text-gold">{result.synastry.total}</span>
                      <span className="text-gray-400 text-sm ml-1">/ {result.synastry.max_possible || 100}</span>
                      {result.synastry.rating && (
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            ((result.synastry.total / (result.synastry.max_possible || 100)) * 100) >= 85 ? "bg-green-900/50 text-green-400" :
                            ((result.synastry.total / (result.synastry.max_possible || 100)) * 100) >= 70 ? "bg-blue-900/50 text-blue-400" : "bg-yellow-900/50 text-yellow-400"
                          }`}>{result.synastry.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-center">
              <button onClick={() => { setResult(null); setActiveMember(0); }}
                className="btn-gold-outline px-6 py-3 rounded-xl text-sm">
                重新测算
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="text-center py-8 text-gray-600 text-xs border-t border-gold/5 mt-12">
        BKing · 天机引擎 v8.2 · 命理测算仅供娱乐参考
      </footer>
    </div>
  );
}
