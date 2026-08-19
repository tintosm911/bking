"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const skills: { name: string; icon: string; desc: string; descEn: string; color: string; href: string }[] = [
  {
    name: "八字",
    icon: "🌙",
    desc: "四柱八字 · 十神格局 · 大运流年",
    descEn: "Four Pillars · Fortune · Decade Luck",
    color: "from-amber-900/40 to-yellow-900/20",
    href: "/bazi",
  },
  {
    name: "紫微斗数",
    icon: "⭐",
    desc: "十二宫位 · 星曜分布 · 四化飞星",
    descEn: "Zi Wei · 12 Palaces · Star Layout",
    color: "from-purple-900/40 to-indigo-900/20",
    href: "/zwei",
  },
  {
    name: "奇门遁甲",
    icon: "🏯",
    desc: "时空盘局 · 三奇八门 · 择时决策",
    descEn: "Qi Men · Space-Time · Divination",
    color: "from-red-900/40 to-orange-900/20",
    href: "/qimen",
  },
  {
    name: "星座运势",
    icon: "🌍",
    desc: "行星相位 · 宫位系统 · 每日运势",
    descEn: "Western Astrology · Signs · Horoscope",
    color: "from-blue-900/40 to-cyan-900/20",
    href: "#",
  },
  {
    name: "塔罗占卜",
    icon: "🔮",
    desc: "大阿卡纳 · 小阿卡纳 · 牌阵解读",
    descEn: "Tarot · Major Arcana · Card Spreads",
    color: "from-violet-900/40 to-pink-900/20",
    href: "#",
  },
];

const socialLinks = [
  { name: "Discord", href: "#", icon: "💬" },
  { name: "X / Twitter", href: "#", icon: "𝕏" },
  { name: "Telegram", href: "#", icon: "✈️", status: "coming" },
];

const stats = [
  { num: "10,000+", label: "社区成员", labelEn: "Community" },
  { num: "50,000+", label: "命理分析", labelEn: "Readings" },
  { num: "5", label: "玄学体系", labelEn: "Systems" },
  { num: "98.5%", label: "准确率", labelEn: "Accuracy" },
];

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

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        o: Math.random() * 0.5 + 0.1,
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
        ctx.fillStyle = `rgba(212, 154, 26, ${p.o})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212, 154, 26, ${0.06 * (1 - dist / 150)})`;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0d0d0d] overflow-x-hidden">
      {/* Particle background */}
      <ParticleField />

      {/* Gradient orbs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <span className="text-gold text-2xl font-serif font-bold tracking-wider">BKing</span>
              <span className="hidden md:inline text-xs text-white/30 uppercase tracking-[0.2em]">东方玄学 · AI 命理</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white transition-colors">
                登录
              </button>
              <button className="btn-gold px-5 py-2 rounded-lg text-sm font-semibold">
                注册
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center px-6 pt-20 lg:pt-28 pb-16">
        <AnimatedSection className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6">
            <span className="px-4 py-1.5 text-xs text-gold bg-gold/8 rounded-full border border-gold/15 tracking-wider">
              ✦ 许愿池 RWA · 玄学赛道
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold tracking-tight leading-none">
            <span className="text-white/90">东方智慧 · </span>
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              AI 解码
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-white/40 leading-relaxed">
            八字 · 紫微斗数 · 奇门遁甲 · 西方星座 · 塔罗
          </p>
          <p className="text-sm md:text-base text-white/20 leading-relaxed">
            Ba Zi · Zi Wei · Qi Men · Western Astrology · Tarot
          </p>
          <p className="mt-4 max-w-xl mx-auto text-sm text-white/25">
            Five ancient wisdom systems, cross-validated by AI for your destiny
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link href="/bazi" className="btn-gold px-8 py-3.5 rounded-xl text-base font-semibold inline-flex items-center gap-2 shadow-lg shadow-gold/15">
              🔮 开始测算
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <button className="px-8 py-3.5 rounded-xl text-base inline-flex items-center gap-2 border border-white/10 text-white/70 hover:border-gold/30 hover:text-gold transition-all">
              💎 许愿池
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          <p className="mt-4 text-xs text-white/15">
            Start your reading →
          </p>
        </AnimatedSection>

        {/* Decorative divider */}
        <div className="mt-16 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-gold/30 to-transparent" />
          <svg className="w-4 h-4 text-gold/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="relative z-10 flex flex-col items-center px-6 py-16">
        <AnimatedSection className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
            <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">五大玄学体系</span>
          </h2>
          <p className="mt-3 text-sm text-white/30">
            Five Systems of Wisdom
          </p>
          <p className="mt-2 text-sm text-white/20 max-w-md mx-auto">
            Single system may deviate — two reveal truth, five cross-validate your destiny
          </p>
        </AnimatedSection>

        <AnimatedSection className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {skills.map((skill) => (
              <Link
                href={skill.href}
                key={skill.name}
                className="relative group rounded-2xl p-6 bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] hover:border-gold/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/10 text-center"
              >
                <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">{skill.icon}</div>
                <h3 className="text-xl font-serif font-bold text-white/90 mb-1">{skill.name}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{skill.desc}</p>
                <p className="text-[10px] text-white/20 leading-relaxed mt-1">{skill.descEn}</p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-gold text-xs tracking-wider">探索 →</span>
                </div>
              </Link>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Wallet & Community */}
      <section className="relative z-10 flex flex-col items-center px-6 py-16">
        <AnimatedSection className="w-full max-w-5xl mx-auto">
          <div className="rounded-3xl p-8 md:p-12 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
              {/* Wallet Connect */}
              <div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3">
                  <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">连接钱包</span>
                </h3>
                <p className="text-sm text-white/40 mb-1">Connect Wallet</p>
                <p className="text-sm text-white/30 mb-6">
                  OKX 钱包一键连接 · USDT / USDC / USDG 支付
                </p>
                <button className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                  <span>🔗</span>
                  连接 OKX 钱包
                </button>
                <div className="mt-6 flex gap-3">
                  <span className="px-3 py-1 bg-white/5 rounded-lg text-xs text-white/40 border border-white/5">USDT</span>
                  <span className="px-3 py-1 bg-white/5 rounded-lg text-xs text-white/40 border border-white/5">USDC</span>
                  <span className="px-3 py-1 bg-white/5 rounded-lg text-xs text-white/40 border border-white/5">USDG</span>
                </div>
              </div>

              {/* Community */}
              <div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3">
                  <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">加入社区</span>
                </h3>
                <p className="text-sm text-white/40 mb-1">Join Community</p>
                <p className="text-sm text-white/30 mb-6">
                  与 10,000+ 玄学爱好者一起探索命运
                </p>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm transition-all ${
                        link.status === "coming"
                          ? "border-white/5 text-white/20 cursor-not-allowed"
                          : "border-white/10 text-white/60 hover:border-gold/25 hover:text-gold hover:bg-gold/5"
                      }`}
                    >
                      <span>{link.icon}</span>
                      <span>{link.name}</span>
                      {link.status === "coming" && (
                        <span className="text-[10px] text-white/15">Coming</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Stats */}
      <section className="relative z-10 flex flex-col items-center px-6 py-12">
        <AnimatedSection className="w-full max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                  {stat.num}
                </div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
                <div className="text-[10px] text-white/20">{stat.labelEn}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-gold font-serif font-bold tracking-wider">BKing</span>
              <span className="text-[10px] text-white/15">© 2026 许愿池 RWA</span>
            </div>
            <div className="flex gap-6 text-xs text-white/30">
              <span className="hover:text-white/60 cursor-pointer transition-colors">服务条款</span>
              <span className="hover:text-white/60 cursor-pointer transition-colors">隐私政策</span>
              <span className="hover:text-white/60 cursor-pointer transition-colors">帮助中心</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}