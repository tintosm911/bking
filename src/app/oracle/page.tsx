"use client";

import { useState, useRef, useEffect } from "react";

interface ChatItem {
  role: "user" | "master";
  content: string;
  skill?: string;
  mood?: string;
}

const SKILL_ICON: Record<string, string> = {
  八字排盘: "🌙",
  紫微斗数: "⭐",
  奇门遁甲: "🌀",
  天机合盘: "💞",
  今日运势: "☀️",
  解梦: "🌌",
  玄机问道: "🔮",
};

const MOOD_HINT: Record<string, string> = {
  cheerful: "心念通达",
  depressed: "宽心静气",
  angry: "平心静气",
  friendly: "有缘人",
  default: "中正平和",
};

export default function OraclePage() {
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [profile, setProfile] = useState<any>({});
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setMessages((m) => [...m, { role: "user", content: text }]);

    try {
      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, sessionId }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((m) => [...m, { role: "master", content: `⚠️ ${data.error}` }]);
        return;
      }
      setSessionId(data.sessionId);
      setProfile(data.profile || {});
      setMessages((m) => [
        ...m,
        { role: "master", content: data.reply, skill: data.skill, mood: data.mood },
      ]);
    } catch (err: any) {
      setMessages((m) => [...m, { role: "master", content: `⚠️ 连接出错：${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Nav */}
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-gold text-xl font-serif font-bold">BKing</a>
          <span className="text-gold/60 text-sm">玄机大师 · AI 命理对话</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔮</div>
          <h1 className="text-3xl font-serif font-bold text-gold">玄机大师</h1>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto leading-relaxed">
            直接对话，一句人话。我自动判断你是要 <span className="text-gold">排八字</span>、
            <span className="text-gold">看紫微</span>、<span className="text-gold">起奇门</span>、
            <span className="text-gold">算运势</span> 还是 <span className="text-gold">解梦</span>——
            全用本机玄学引擎，免费无墙，即刻回音。
          </p>
          {/* 提示气泡 */}
          <div className="flex flex-wrap justify-center gap-2 mt-5 text-xs">
            {["帮我排一下八字，我1998年8月8日午时生", "看看我们俩的合盘合不合", "我今天运势如何", "我梦到一条蛇", "起一局奇门看看当下时机"].map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="px-3 py-1.5 rounded-full border border-gold/30 text-gold/70 hover:border-gold hover:text-gold transition"
              >
                {s}
              </button>
            ))}
          </div>
          {/* 已记住的信息 */}
          {profile && (profile.name || profile.year) && (
            <div className="mt-4 inline-block text-xs text-gold/50 border border-gold/20 rounded-lg px-4 py-1.5 bg-gold/5">
              玄机大师已记住：{profile.name ? `姓名 ${profile.name}` : ""} 
              {profile.year ? ` · ${profile.year}年${profile.month ?? "?"}月${profile.day ?? "?"}日` : ""}
              {profile.gender !== undefined ? ` · ${profile.gender === 0 ? "男" : "女"}` : ""}
            </div>
          )}
        </div>

        {/* 对话区 */}
        <div className="space-y-4 mb-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-10 leading-relaxed">
              <div className="text-2xl mb-3">🕯️</div>
              玄机大师在此恭候。<br />说句话，我便为你起盘。
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed text-sm ${
                  m.role === "user"
                    ? "bg-gold text-dark-900 rounded-br-sm"
                    : "bg-dark-800 border border-gold/15 rounded-bl-sm text-gray-100"
                }`}
              >
                {m.role === "master" && m.skill && (
                  <div className="flex items-center gap-1.5 mb-1 text-xs">
                    <span>{SKILL_ICON[m.skill] ?? "🔮"}</span>
                    <span className="text-gold font-semibold">{m.skill}</span>
                    {m.mood && <span className="text-gold/50">· {MOOD_HINT[m.mood] ?? m.mood}</span>}
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-dark-800 border border-gold/15 px-4 py-3 rounded-2xl text-gold/70 text-sm">
                玄机大师沉吟中<span className="animate-pulse">…</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* 输入区 */}
        <form onSubmit={send} className="sticky bottom-4">
          <div className="flex gap-2 bg-dark-800 border border-gold/20 rounded-2xl p-2 focus-within:border-gold/50 transition">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="问我句话，例如：帮我排八字 / 今天运势 / 我梦到水了…"
              className="flex-1 bg-transparent text-white px-3 py-2 outline-none placeholder:text-gray-500 text-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d49a1a] via-[#ecc454] to-[#d49a1a] text-dark-900 font-semibold text-sm disabled:opacity-40 transition hover:brightness-110"
            >
              求卦
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}