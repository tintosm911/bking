import Link from "next/link";

const skills = [
  {
    name: "八字",
    icon: "🌙",
    desc: "四柱八字 · 十神格局 · 大运流年",
    color: "from-amber-900/40 to-yellow-900/20",
  },
  {
    name: "紫微斗数",
    icon: "⭐",
    desc: "十二宫位 · 星曜分布 · 四化飞星",
    color: "from-purple-900/40 to-indigo-900/20",
  },
  {
    name: "奇门遁甲",
    icon: "🏯",
    desc: "时空盘局 · 三奇八门 · 择时决策",
    color: "from-red-900/40 to-orange-900/20",
  },
  {
    name: "星座运势",
    icon: "🌍",
    desc: "行星相位 · 宫位系统 · 每日运势",
    color: "from-blue-900/40 to-cyan-900/20",
  },
  {
    name: "塔罗占卜",
    icon: "🔮",
    desc: "大阿卡纳 · 小阿卡纳 · 牌阵解读",
    color: "from-violet-900/40 to-pink-900/20",
  },
];

const socialLinks = [
  { name: "Discord", href: "#", icon: "💬" },
  { name: "X / Twitter", href: "#", icon: "𝕏" },
  { name: "Telegram", href: "#", icon: "✈️", status: "coming" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-hero-gradient bg-noise">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star-twinkle absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-gold text-2xl font-serif font-bold tracking-wider">BKing</span>
              <span className="hidden sm:inline text-xs text-gold/60 uppercase tracking-[0.2em]">东方玄学 · AI 命理</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="btn-gold-outline px-4 py-2 rounded-lg text-sm">
                登录
              </button>
              <button className="btn-gold px-4 py-2 rounded-lg text-sm">
                注册
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-block mb-4">
            <span className="px-3 py-1 text-xs text-gold bg-gold/10 rounded-full border border-gold/20">
              许愿池 RWA · 玄学赛道
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold tracking-tight">
            <span className="text-white">东方智慧 · </span>
            <span className="bg-gold-gradient bg-clip-text text-transparent">AI 解码</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-400 leading-relaxed">
            八字 · 紫微斗数 · 奇门遁甲 · 西方星座 · 塔罗
            <br />
            五大玄学系统，AI 交叉验证你的命运轨迹
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="#skills"
              className="btn-gold px-8 py-3 rounded-xl text-base font-semibold inline-flex items-center gap-2"
            >
              <Link href="/bazi" className="btn-gold px-8 py-3 rounded-xl text-base font-semibold inline-flex items-center gap-2">
              🔮 开始测算
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <button className="btn-gold-outline px-8 py-3 rounded-xl text-base inline-flex items-center gap-2">
              💎 许愿池
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mystical ornament */}
        <div className="mt-16 flex justify-center">
          <div className="w-px h-16 bg-gradient-to-b from-gold/50 to-transparent" />
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gold">
            五大玄学体系
          </h2>
          <p className="mt-3 text-gray-500">
            单一系统或有偏差，两套系统揭示真相，五套系统交叉验证
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {skills.map((skill) => (
            <button
              key={skill.name}
              className={`card-hover relative group rounded-2xl p-6 bg-gradient-to-b ${skill.color} border border-gold/10 mystical-glow overflow-hidden text-left`}
            >
              <div className="relative z-10">
                <div className="text-4xl mb-4">{skill.icon}</div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">{skill.name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{skill.desc}</p>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-gold text-xs">测算 →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Wallet Connect & Community */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Wallet Connect */}
            <div>
              <h3 className="text-2xl font-serif font-bold text-gold mb-4">
                连接钱包
              </h3>
              <p className="text-gray-400 mb-6">
                OKX 钱包一键连接，使用 USDT / USDC / USDG 支付
              </p>
              <button className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold">
                🔗 连接 OKX 钱包
              </button>
              <div className="mt-6 flex gap-4">
                <span className="px-3 py-1 bg-gold/5 rounded-lg text-xs text-gold/60">USDT</span>
                <span className="px-3 py-1 bg-gold/5 rounded-lg text-xs text-gold/60">USDC</span>
                <span className="px-3 py-1 bg-gold/5 rounded-lg text-xs text-gold/60">USDG</span>
              </div>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-2xl font-serif font-bold text-gold mb-4">
                加入社区
              </h3>
              <p className="text-gray-400 mb-6">
                与 10,000+ 玄学爱好者一起探索命运
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm transition-all ${
                      link.status === "coming"
                        ? "border-gray-700 text-gray-500 cursor-not-allowed"
                        : "border-gold/20 text-gold hover:bg-gold/10"
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.name}</span>
                    {link.status === "coming" && (
                      <span className="text-xs text-gray-600">Coming</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { num: "10,000+", label: "社区成员" },
            { num: "50,000+", label: "命理分析" },
            { num: "5", label: "玄学体系" },
            { num: "98.5%", label: "准确率" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4">
              <div className="text-2xl sm:text-3xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                {stat.num}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gold/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gold font-serif font-bold">BKing</span>
              <span className="text-xs text-gray-600">© 2026 许愿池 RWA</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <span>服务条款</span>
              <span>隐私政策</span>
              <span>帮助中心</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}