import Link from "next/link";

const TOPICS = [
  {
    href: "/baodian/jichu",
    icon: "☯️",
    name: "阴阳五行基础",
    desc: "阴阳、五行、天干地支、纳音、十二长生 · 术数入门术语速查",
    descEn: "Yin-Yang · Five Elements · Celestial Stems",
    color: "from-gold-900/50 to-amber-900/30",
    tag: "基础",
  },
  {
    href: "/baodian/shishen",
    icon: "🌲",
    name: "十神详解",
    desc: "比肩劫财、食神伤官、正偏财、正偏官、正偏印 · 十神含义与论命",
    descEn: "Ten Gods · Relations & Meanings",
    color: "from-amber-900/40 to-yellow-900/20",
    tag: "八字",
  },
  {
    href: "/baodian/shensha",
    icon: "✨",
    name: "神煞详解",
    desc: "桃花、驿马、华盖、将星、天乙贵人、文昌 · 常见神煞吉凶",
    descEn: "Shensha · Auspicious & Inauspicious Stars",
    color: "from-gold-900/40 to-amber-900/20",
    tag: "八字",
  },
  {
    href: "/baodian/tarot",
    icon: "🃏",
    name: "塔罗牌典",
    desc: "78 张塔罗牌全解 · 大阿卡纳 22 张 + 小阿卡纳 56 张正逆位含义",
    descEn: "Tarot Card Encyclopaedia · 78 Cards",
    color: "from-purple-900/40 to-indigo-900/20",
    tag: "塔罗",
  },
];

export default function BaodianPage() {
  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white/80 relative overflow-hidden">
      {/* 背景光晕 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* 标题 */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 text-xs text-gold bg-gold/8 rounded-full border border-gold/15 tracking-wider mb-4">
            📚 术数宝典 · 知识库
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold-400 mb-4">
            术数宝典
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            阴阳五行 · 十神神煞 · 塔罗牌典 —— 术数入门与深造的理论基础，
            帮你读懂排盘结果的每一个概念。
          </p>
        </div>

        {/* 内容卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TOPICS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group glass rounded-2xl p-6 border border-white/10 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/10 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-2xl mb-4`}>
                {t.icon}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-gold/20 text-gold mb-2 inline-block">
                {t.tag}
              </span>
              <h2 className="font-serif text-xl text-gold mb-2">{t.name}</h2>
              <p className="text-sm text-white/60 leading-relaxed">{t.desc}</p>
              <p className="text-[11px] text-white/40 uppercase tracking-wider mt-3">{t.descEn}</p>
              <div className="mt-4 text-xs text-gold/70 group-hover:text-gold transition-colors">
                进入阅读 →
              </div>
            </Link>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="mt-14 text-center text-xs text-white/40">
          BKing 术数宝典 · 持续扩充中，更多经典内容陆续上线
        </div>
      </div>
    </main>
  );
}
