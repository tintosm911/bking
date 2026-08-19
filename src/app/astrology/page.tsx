"use client";

import { useState } from "react";
import Link from "next/link";

const ZODIAC_SIGNS = [
  {
    name: "白羊座", nameEn: "Aries", icon: "♈️",
    date: "3/21 - 4/19", element: "火", ruler: "火星",
    positive: "勇敢、果断、热情", negative: "冲动、急躁、自我",
    likes: "挑战、竞争、自由", dislikes: "等待、服从、限制",
  },
  {
    name: "金牛座", nameEn: "Taurus", icon: "♉️",
    date: "4/20 - 5/20", element: "土", ruler: "金星",
    positive: "稳重、耐心、务实", negative: "固执、保守、占有欲",
    likes: "舒适、美食、稳定", dislikes: "变化、风险、勉强",
  },
  {
    name: "双子座", nameEn: "Gemini", icon: "♊️",
    date: "5/21 - 6/20", element: "风", ruler: "水星",
    positive: "聪明、好奇、善变", negative: "肤浅、两面、不安",
    likes: "交流、旅行、新鲜", dislikes: "单调、束缚、无聊",
  },
  {
    name: "巨蟹座", nameEn: "Cancer", icon: "♋️",
    date: "6/21 - 7/22", element: "水", ruler: "月亮",
    positive: "温柔、敏感、保护", negative: "情绪化、依赖、多疑",
    likes: "家庭、回忆、安全感", dislikes: "冲突、批评、陌生",
  },
  {
    name: "狮子座", nameEn: "Leo", icon: "♌️",
    date: "7/23 - 8/22", element: "火", ruler: "太阳",
    positive: "自信、慷慨、领导力", negative: "自负、控制、炫耀",
    likes: "舞台、赞美、奢华", dislikes: "被忽视、平凡、失败",
  },
  {
    name: "处女座", nameEn: "Virgo", icon: "♍️",
    date: "8/23 - 9/22", element: "土", ruler: "水星",
    positive: "细致、理性、完美", negative: "挑剔、焦虑、苛刻",
    likes: "秩序、分析、整洁", dislikes: "混乱、粗心、浪费",
  },
  {
    name: "天秤座", nameEn: "Libra", icon: "♎️",
    date: "9/23 - 10/22", element: "风", ruler: "金星",
    positive: "优雅、平衡、公正", negative: "犹豫、依赖、表面",
    likes: "和谐、美学、社交", dislikes: "冲突、不公平、粗俗",
  },
  {
    name: "天蝎座", nameEn: "Scorpio", icon: "♏️",
    date: "10/23 - 11/21", element: "水", ruler: "冥王星",
    positive: "深度、坚定、洞察", negative: "嫉妒、执念、隐秘",
    likes: "神秘、真相、掌控", dislikes: "浅薄、背叛、虚伪",
  },
  {
    name: "射手座", nameEn: "Sagittarius", icon: "♐️",
    date: "11/22 - 12/21", element: "火", ruler: "木星",
    positive: "乐观、自由、探索", negative: "放纵、鲁莽、承诺",
    likes: "冒险、哲学、旅行", dislikes: "束缚、拖延、啰嗦",
  },
  {
    name: "摩羯座", nameEn: "Capricorn", icon: "♑️",
    date: "12/22 - 1/19", element: "土", ruler: "土星",
    positive: "坚韧、务实、责任感", negative: "冷漠、功利、压抑",
    likes: "成就、规划、权威", dislikes: "懒散、无目的、浪费",
  },
  {
    name: "水瓶座", nameEn: "Aquarius", icon: "♒️",
    date: "1/20 - 2/18", element: "风", ruler: "天王星",
    positive: "创新、独立、人道", negative: "叛逆、冷漠、不可预测",
    likes: "自由、创新、社群", dislikes: "束缚、从众、传统",
  },
  {
    name: "双鱼座", nameEn: "Pisces", icon: "♓️",
    date: "2/19 - 3/20", element: "水", ruler: "海王星",
    positive: "梦幻、善良、直觉", negative: "逃避、混乱、沉迷",
    likes: "想象、浪漫、艺术", dislikes: "现实、粗鲁、孤独",
  },
];

const PLANETS = [
  { name: "太阳", nameEn: "Sun", icon: "☀️", symbol: "☉", sign: "狮子座" },
  { name: "月亮", nameEn: "Moon", icon: "🌙", symbol: "☽", sign: "巨蟹座" },
  { name: "水星", nameEn: "Mercury", icon: "☿", symbol: "☿", sign: "双子座/处女座" },
  { name: "金星", nameEn: "Venus", icon: "♀", symbol: "♀", sign: "金牛座/天秤座" },
  { name: "火星", nameEn: "Mars", icon: "♂", symbol: "♂", sign: "白羊座" },
  { name: "木星", nameEn: "Jupiter", icon: "♃", symbol: "♃", sign: "射手座" },
  { name: "土星", nameEn: "Saturn", icon: "♄", symbol: "♄", sign: "摩羯座" },
  { name: "天王星", nameEn: "Uranus", icon: "♅", symbol: "♅", sign: "水瓶座" },
  { name: "海王星", nameEn: "Neptune", icon: "♆", symbol: "♆", sign: "双鱼座" },
  { name: "冥王星", nameEn: "Pluto", icon: "♇", symbol: "♇", sign: "天蝎座" },
];

function generateHoroscope(signIdx: number) {
  const horoscopes: Record<string, string[]> = {
    "白羊座": ["今天精力充沛，适合推进重要项目。", "注意控制冲动，三思而后行。", "爱情方面主动出击会有好结果。"],
    "金牛座": ["财运不错，适合做长期规划。", "适当放松一下，别给自己太大压力。", "人际关系和谐的一天。"],
    "双子座": ["灵感爆棚，适合创意工作。", "注意不要分心，专注完成一件事。", "社交场合表现出色，认识有趣的人。"],
    "巨蟹座": ["家庭事务需要你关注。", "情感上会有感动时刻。", "工作中注意细节，避免小失误。"],
    "狮子座": ["自信满满的一天，适合展示自己。", "注意不要过于强势，听听他人意见。", "财运上升，可能有意外收入。"],
    "处女座": ["工作效率高，适合处理积压任务。", "对他人宽容一些，别太追求完美。", "健康和养生方面值得关注。"],
    "天秤座": ["社交运旺，适合聚会和洽谈。", "做决定需要果断，别太犹豫。", "艺术和美学方面有特别的感悟。"],
    "天蝎座": ["洞察力强，能看清事物的本质。", "感情方面可能会有深度对话。", "注意控制强烈的情绪。"],
    "射手座": ["适合出门旅行或探索新事物。", "乐观的态度会感染身边的人。", "学习新技能的好时机。"],
    "摩羯座": ["事业运上升，努力会有回报。", "注意平衡工作和休息。", "长远规划比短期利益更重要。"],
    "水瓶座": ["创意十足，适合打破常规。", "社交圈会扩大，认识志同道合的人。", "关注科技和社会议题。"],
    "双鱼座": ["直觉很准，相信第一感觉。", "艺术创作灵感丰富。", "注意不要沉溺于幻想，脚踏实地。"],
  };
  const h = horoscopes[ZODIAC_SIGNS[signIdx].name] || ["今天运势平稳。"];
  return [...h].sort(() => Math.random() - 0.5);
}

export default function AstrologyPage() {
  const [selectedSign, setSelectedSign] = useState<number | null>(null);
  const [horoscope, setHoroscope] = useState<string[] | null>(null);
  const [showPlanets, setShowPlanets] = useState(false);

  const handleSelect = (idx: number) => {
    setSelectedSign(idx);
    setHoroscope(generateHoroscope(idx));
  };

  const sign = selectedSign !== null ? ZODIAC_SIGNS[selectedSign] : null;

  const luckyNumber = Math.floor(Math.random() * 9) + 1;
  const luckyColor = ["金色", "红色", "蓝色", "绿色", "紫色"][Math.floor(Math.random() * 5)];
  const starRating = ["⭐⭐⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"][Math.floor(Math.random() * 5)];

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-gold text-xl font-serif font-bold">BKing</Link>
          <span className="text-gold/60 text-sm">星座运势</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🌍</div>
          <h1 className="text-3xl font-serif font-bold text-gold">星座运势</h1>
          <p className="text-gray-400 mt-2">西方占星 · 十二星座 · 行星相位 · 每日运势</p>
          <p className="text-xs text-white/15 mt-1">Western Astrology · 12 Signs · Planets · Daily Horoscope</p>
        </div>

        {selectedSign === null ? (
          <>
            {/* Signs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {ZODIAC_SIGNS.map((s, i) => (
                <button key={i} onClick={() => handleSelect(i)}
                  className="group rounded-2xl p-4 bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] hover:border-gold/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/10 text-center"
                >
                  <div className="text-4xl mb-2 transition-transform duration-300 group-hover:scale-110">{s.icon}</div>
                  <div className="text-lg font-serif font-bold text-white/90">{s.name}</div>
                  <div className="text-xs text-white/30">{s.nameEn}</div>
                  <div className="text-[10px] text-white/20 mt-1">{s.date}</div>
                  <div className="mt-2 text-xs text-gold/60">{s.element} · {s.ruler}</div>
                </button>
              ))}
            </div>

            {/* Planets Section */}
            <div className="mt-16">
              <button onClick={() => setShowPlanets(!showPlanets)}
                className="w-full text-center py-3 text-sm text-white/40 hover:text-gold transition-colors border-t border-white/5"
              >
                {showPlanets ? "收起行星信息 ▲" : "太阳系十大行星 ▼"}
              </button>
              {showPlanets && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {PLANETS.map((p, i) => (
                    <div key={i} className="bg-dark-800 border border-white/5 rounded-xl p-3 text-center hover:border-gold/15 transition-colors">
                      <div className="text-2xl mb-1">{p.icon}</div>
                      <div className="text-sm font-bold text-gold-light">{p.name}</div>
                      <div className="text-[10px] text-white/30">{p.nameEn} ({p.symbol})</div>
                      <div className="text-[10px] text-white/40 mt-1">守护: {p.sign}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : sign ? (
          /* Sign Detail */
          <div>
            <button onClick={() => { setSelectedSign(null); setHoroscope(null); }}
              className="mb-6 text-sm text-white/40 hover:text-gold transition-colors inline-flex items-center gap-1"
            >
              ← 返回星座列表
            </button>

            <div className="text-center mb-8">
              <div className="text-6xl mb-3">{sign.icon}</div>
              <h2 className="text-3xl font-serif font-bold text-gold">{sign.name}</h2>
              <p className="text-sm text-white/30">{sign.nameEn}</p>
              <p className="text-xs text-white/20 mt-1">{sign.date}</p>
            </div>

            {/* Basic Info */}
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-dark-800 rounded-xl p-4 text-center border border-white/5">
                  <div className="text-xs text-white/40 mb-1">元素</div>
                  <div className="text-2xl">
                    {sign.element === "火" && "🔥"}
                    {sign.element === "土" && "🌍"}
                    {sign.element === "风" && "💨"}
                    {sign.element === "水" && "💧"}
                  </div>
                  <div className="text-sm font-bold text-gold-light">{sign.element}</div>
                </div>
                <div className="bg-dark-800 rounded-xl p-4 text-center border border-white/5">
                  <div className="text-xs text-white/40 mb-1">守护星</div>
                  <div className="text-2xl">⭐</div>
                  <div className="text-sm font-bold text-gold-light">{sign.ruler}</div>
                </div>
                <div className="bg-dark-800 rounded-xl p-4 text-center border border-white/5">
                  <div className="text-xs text-white/40 mb-1">对应塔罗</div>
                  <div className="text-2xl">🃏</div>
                  <div className="text-sm font-bold text-gold-light">
                    {["皇帝", "女皇", "恋人", "战车", "力量", "隐士", "正义", "死神", "节制", "恶魔", "星星", "月亮"][selectedSign]}
                  </div>
                </div>
              </div>

              {/* Traits */}
              <div className="glass rounded-2xl p-6 mb-6 border border-gold/15">
                <h3 className="text-lg font-serif font-bold text-gold mb-4 text-center">【性格特质】</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-green-400 mb-2">✓ 优点</div>
                    <p className="text-sm text-gray-300">{sign.positive}</p>
                  </div>
                  <div>
                    <div className="text-sm text-red-400 mb-2">✗ 缺点</div>
                    <p className="text-sm text-gray-300">{sign.negative}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-white/40 mb-1">喜欢</div>
                      <p className="text-sm text-gray-300">{sign.likes}</p>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 mb-1">不喜欢</div>
                      <p className="text-sm text-gray-300">{sign.dislikes}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Horoscope */}
              <div className="glass rounded-2xl p-6 mb-6 border border-gold/20">
                <h3 className="text-lg font-serif font-bold text-gold mb-4 text-center">【今日运势】</h3>
                {horoscope && (
                  <div className="space-y-3">
                    {horoscope.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 bg-dark-700/50 rounded-xl p-3">
                        <span className="text-gold text-sm mt-0.5">
                          {i === 0 ? "💫" : i === 1 ? "📌" : "💡"}
                        </span>
                        <p className="text-sm text-gray-300">{h}</p>
                      </div>
                    ))}
                    <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-white/5">
                      <div className="text-center">
                        <div className="text-xs text-white/40">幸运数字</div>
                        <div className="text-lg font-bold text-gold-light">{luckyNumber}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/40">幸运颜色</div>
                        <div className="text-lg font-bold text-gold-light">{luckyColor}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/40">整体运势</div>
                        <div className="text-lg">{starRating}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <button onClick={() => selectedSign !== null && setHoroscope(generateHoroscope(selectedSign))}
                  className="px-6 py-2.5 rounded-xl text-sm border border-white/10 text-white/60 hover:border-gold/30 hover:text-gold transition-all inline-flex items-center gap-2"
                >
                  🔄 刷新运势
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
