"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import WishingForm from "../../components/wishing-well/WishingForm";
import WishCard from "../../components/wishing-well/WishCard";
import type { Wish } from "../../components/wishing-well/WishCard";

// ─── Particle Background ───
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(138, 196, 255, ${p.o})`;
        ctx.fill();
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ─── AnimatedSection ───
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"} ${className}`}>
      {children}
    </div>
  );
}

// ─── Sample wishes (placeholder) ───
const sampleWishes: Wish[] = [
  {
    id: "ww-001",
    category: "wealth",
    title: "愿今年交易稳定盈利，突破百万",
    content: "做量化交易三年了，今年目标是稳定盈利、风控到位，希望市场给机会，技术能精进。",
    amount: "100 USDT",
    contributorCount: 23,
    progress: 72,
    status: "funding",
    createdAt: "2026-08-15",
    expiresAt: "2026-09-15",
  },
  {
    id: "ww-002",
    category: "love",
    title: "希望能遇到灵魂伴侣",
    content: "单身两年了，希望能遇到一个懂我、理解我的人，不求完美，只求真诚。",
    amount: "50 USDT",
    contributorCount: 15,
    progress: 48,
    status: "funding",
    createdAt: "2026-08-10",
    expiresAt: "2026-09-10",
  },
  {
    id: "ww-003",
    category: "career",
    title: "创业项目顺利融资",
    content: "AI 短剧项目筹备半年，希望今年能拿到天使轮，团队能活下来。",
    amount: "500 USDT",
    contributorCount: 67,
    progress: 91,
    status: "funding",
    createdAt: "2026-07-20",
    expiresAt: "2026-09-20",
  },
  {
    id: "ww-004",
    category: "health",
    title: "家人身体健康，无病无灾",
    content: "父母年纪大了，只愿他们身体健康，平平安安。",
    amount: "10 USDT",
    contributorCount: 8,
    progress: 100,
    status: "fulfilled",
    createdAt: "2026-07-01",
    expiresAt: "2026-08-01",
  },
  {
    id: "ww-005",
    category: "study",
    title: "考研上岸，金榜题名",
    content: "准备了两年，今年一定要考上心仪的学校。",
    amount: "50 USDT",
    contributorCount: 42,
    progress: 85,
    status: "funding",
    createdAt: "2026-08-05",
    expiresAt: "2026-09-05",
  },
  {
    id: "ww-006",
    category: "family",
    title: "希望能和家人团聚过年",
    content: "在国外工作三年没回家了，今年春节一定要回去。",
    amount: "10 USDT",
    contributorCount: 31,
    progress: 100,
    status: "fulfilled",
    createdAt: "2026-06-15",
    expiresAt: "2026-07-15",
  },
];

// ─── Stats ───
const stats = [
  { num: "238", label: "总愿望数", labelEn: "Total Wishes" },
  { num: "67", label: "已实现", labelEn: "Fulfilled" },
  { num: "1,284", label: "助力人次", labelEn: "Contributors" },
  { num: "12,580", label: "USDT 祈愿总额", labelEn: "Total Pledged" },
];

// ─── Tabs ───
const tabs = [
  { id: "all", label: "全部愿望" },
  { id: "funding", label: "募集中" },
  { id: "fulfilled", label: "已实现" },
  { id: "new", label: "最新" },
];

export default function WishingWellPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [wishes] = useState(sampleWishes);

  const filtered = activeTab === "all" ? wishes
    : activeTab === "funding" ? wishes.filter(w => w.status === "funding")
    : activeTab === "fulfilled" ? wishes.filter(w => w.status === "fulfilled")
    : activeTab === "new" ? [...wishes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)
    : wishes;

  return (
    <div className="relative min-h-screen bg-[#0d0d0d] overflow-x-hidden">
      <ParticleField />

      {/* Gradient orbs */}
      <div className="fixed top-1/4 left-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-4">
              <span className="text-gold text-2xl font-serif font-bold tracking-wider">BKing</span>
              <span className="hidden md:inline text-xs text-white/20">/ 许愿池</span>
            </Link>
            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 rounded-lg text-base text-white/60 hover:text-white transition-colors">
                登录
              </button>
              <button className="btn-gold px-5 py-2.5 rounded-lg text-base font-semibold">
                注册
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <AnimatedSection className="flex flex-col items-center text-center max-w-3xl mx-auto gap-4">
          {/* Tag */}
          <div>
            <span className="px-4 py-1.5 text-xs text-white/40 bg-white/[0.03] rounded-full border border-white/[0.06] tracking-wider">
              💎 许愿池 · 链上祈愿
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight">
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              写下你的愿望
            </span>
          </h1>

          <p className="text-sm md:text-base text-white/40 leading-relaxed max-w-lg">
            在链上许下心愿，汇聚众人之力，助你愿望成真
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowForm(true)}
              className="btn-gold px-8 py-3.5 rounded-xl text-base font-semibold inline-flex items-center gap-2 shadow-lg shadow-gold/15"
            >
              ✨ 写下愿望
            </button>
            <Link
              href="/"
              className="px-8 py-3.5 rounded-xl text-base inline-flex items-center gap-2 border border-white/10 text-white/60 hover:border-white/20 transition-all"
            >
              ← 返回首页
            </Link>
          </div>
        </AnimatedSection>

        {/* Stats */}
        <AnimatedSection className="w-full max-w-4xl mx-auto mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-xl md:text-2xl lg:text-3xl font-serif font-bold bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                  {stat.num}
                </div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
                <div className="text-[10px] text-white/20">{stat.labelEn}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ─── Form Section ─── */}
      {showForm && (
        <section className="relative z-10 px-6 pb-12">
          <AnimatedSection className="max-w-2xl mx-auto">
            <WishingForm />
            <div className="text-center mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                收起表单
              </button>
            </div>
          </AnimatedSection>
        </section>
      )}

      {/* ─── Wish Pool ─── */}
      <section className="relative z-10 px-6 pb-16">
        <AnimatedSection className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
            <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs transition-all ${
                    activeTab === tab.id
                      ? "bg-gold/15 text-gold"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/20">{filtered.length} 个愿望</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔮</div>
              <p className="text-sm text-white/30">暂无愿望</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-xs text-gold hover:text-gold-light transition-colors"
              >
                写下第一个愿望 →
              </button>
            </div>
          )}
        </AnimatedSection>
      </section>

      {/* ─── How It Works ─── */}
      <section className="relative z-10 px-6 pb-20">
        <AnimatedSection className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gold mb-3">许愿池如何运作</h2>
          <p className="text-sm text-white/40 mb-10">How the Wishing Well Works</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "写下愿望", desc: "选择类别，写下心愿，设定祈愿金额", icon: "✍️" },
              { step: "02", title: "链上验证", desc: "连接钱包支付祈愿金，愿望上链存证", icon: "🔗" },
              { step: "03", title: "众人助力", desc: "他人可为你的愿望助力，汇聚祈愿能量", icon: "🤝" },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06]">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-xs text-gold/60 mb-1 tracking-wider">{item.step}</div>
                <h3 className="text-base font-serif font-bold text-white/70 mb-2">{item.title}</h3>
                <p className="text-xs text-white/35 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 px-6 py-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] inline-block">
            <p className="text-xs text-white/30 leading-relaxed">
              💡 许愿金将按比例分配：<span className="text-gold">70%</span> 进入愿望实现基金 · <span className="text-gold">20%</span> 社区激励 · <span className="text-gold">10%</span> 平台运营
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-gold font-serif font-bold tracking-wider">BKing</span>
              <span className="text-[10px] text-white/15">© 2026 许愿池 RWA</span>
            </div>
            <div className="flex gap-6 text-xs text-white/30">
              <Link href="/" className="hover:text-white/60 transition-colors">首页</Link>
              <span className="hover:text-white/60 cursor-pointer transition-colors">服务条款</span>
              <span className="hover:text-white/60 cursor-pointer transition-colors">隐私政策</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}