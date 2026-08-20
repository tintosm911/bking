"use client";

import { useState, useEffect, useRef } from "react";

// ─── 翻牌光效粒子 ───
function FlipGlow({ delay, totalCards, idx }: { delay: number; totalCards: number; idx: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay + 200);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), 1400);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const staggerOffset = idx * 40;

  return (
    <>
      {/* 横扫金光 */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
        style={{ animationDelay: `${staggerOffset}ms` }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/40 to-transparent animate-shimmer-fast"
          style={{ animationDelay: `${staggerOffset}ms` }}
        />
      </div>
      {/* 光晕爆发 */}
      <div
        className="absolute -inset-4 rounded-2xl pointer-events-none animate-glow-flash"
        style={{
          animationDelay: `${staggerOffset}ms`,
          background: 'radial-gradient(circle, rgba(212,154,26,0.25) 0%, rgba(212,154,26,0.1) 30%, transparent 60%)',
        }}
      />
      {/* 粒子喷射 */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            left: `${30 + (i % 4) * 15}%`,
            top: `${20 + Math.floor(i / 4) * 40}%`,
            background: i % 2 === 0 ? 'var(--gold-light)' : 'rgba(136,221,255,0.8)',
            boxShadow: i % 2 === 0
              ? '0 0 4px var(--gold-light)'
              : '0 0 4px rgba(136,221,255,0.8)',
            animation: `star-dust 1.5s ease-out forwards`,
            animationDelay: `${staggerOffset + i * 60}ms`,
          }}
        />
      ))}
    </>
  );
}

// ─── 牌背面 ───
function CardBack() {
  // 星光位置
  const stars = [
    { x: '15%', y: '20%', s: '2px', d: '0s' },
    { x: '75%', y: '15%', s: '1.5px', d: '0.4s' },
    { x: '40%', y: '70%', s: '2.5px', d: '0.8s' },
    { x: '80%', y: '65%', s: '1.5px', d: '1.2s' },
    { x: '25%', y: '55%', s: '1px', d: '1.6s' },
    { x: '60%', y: '80%', s: '2px', d: '0.6s' },
    { x: '85%', y: '40%', s: '1.5px', d: '1.0s' },
    { x: '10%', y: '80%', s: '1px', d: '1.4s' },
  ];

  return (
    <div className="absolute inset-0 rounded-xl flex items-center justify-center backface-hidden overflow-hidden">
      {/* 炫彩流光渐变背景 */}
      <div
        className="absolute inset-0 animate-border-flow"
        style={{
          background: `linear-gradient(135deg,
            #1a1a2e 0%,
            #16213e 20%,
            #1a1a2e 40%,
            #0f3460 55%,
            #1a1a2e 70%,
            #16213e 85%,
            #1a1a2e 100%
          )`,
        }}
      />

      {/* 动态光晕 */}
      <div
        className="absolute inset-0 animate-aurora"
        style={{
          background: `radial-gradient(ellipse at 30% 40%,
            rgba(136,221,255,0.08) 0%,
            transparent 50%
          ),
          radial-gradient(ellipse at 70% 60%,
            rgba(212,154,26,0.06) 0%,
            transparent 50%
          )`,
        }}
      />

      {/* 对角装饰条纹 */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg,
            transparent,
            transparent 8px,
            rgba(212,154,26,0.3) 8px,
            rgba(212,154,26,0.3) 9px
          )`,
        }}
      />

      {/* 星光粒子 */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: star.x,
            top: star.y,
            width: star.s,
            height: star.s,
            animationDelay: star.d,
            boxShadow: `0 0 ${star.s === '2.5px' ? '4px' : '2px'} rgba(255,255,255,0.5)`,
          }}
        />
      ))}

      {/* 外发光边框 */}
      <div className="absolute inset-[2px] rounded-[10px] border border-gold/15 pointer-events-none" />

      {/* 八角星装饰 - 四角 */}
      {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} w-5 h-5`}
          style={{ opacity: 0.3 + i * 0.05 }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z"
              fill="var(--gold-light)" opacity="0.4" />
          </svg>
        </div>
      ))}

      {/* 中央纹章区域 */}
      <div className="relative z-10 text-center unflip-content">
        {/* 水晶球 */}
        <div className="mb-3">
          <div className="crystal-ball">
            <span className="text-4xl relative z-10 drop-shadow-[0_0_12px_rgba(136,221,255,0.6)]">
              🔮
            </span>
            <div className="crystal-shine" />
            <div className="crystal-shine-secondary" />
          </div>
        </div>

        {/* 品牌名 */}
        <div className="text-sm text-gold-light/70 tracking-[0.35em] font-serif font-bold">
          BKing
        </div>
        <div className="text-[8px] text-gold/25 mt-0.5 tracking-[0.25em]">
          T A R O T
        </div>
      </div>

      {/* 中心水平装饰线 - 发光版 */}
      <div className="absolute inset-x-5 top-1/2 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(212,154,26,0.12) 30%, rgba(136,221,255,0.08) 50%, rgba(212,154,26,0.12) 70%, transparent 100%)',
        }}
      />
    </div>
  );
}

// ─── 牌正面 ───
function CardFront({ card, visible, delay }: { card: any; visible: boolean; delay: number }) {
  const elementColors: Record<string, { text: string; border: string; ring: string; bg: string; glow: string }> = {
    "火": { text: "text-orange-400", border: "border-orange-400/30", ring: "ring-orange-400/20", bg: "from-orange-500/10 via-transparent to-transparent", glow: "rgba(251,146,60,0.15)" },
    "水": { text: "text-blue-400", border: "border-blue-400/30", ring: "ring-blue-400/20", bg: "from-blue-500/10 via-transparent to-transparent", glow: "rgba(96,165,250,0.15)" },
    "风": { text: "text-cyan-300", border: "border-cyan-300/30", ring: "ring-cyan-300/20", bg: "from-cyan-400/10 via-transparent to-transparent", glow: "rgba(67,217,238,0.12)" },
    "土": { text: "text-green-400", border: "border-green-400/30", ring: "ring-green-400/20", bg: "from-green-500/10 via-transparent to-transparent", glow: "rgba(74,222,128,0.12)" },
  };

  const ec = elementColors[card.element] || elementColors["火"];
  const isReversed = card.reversed;

  return (
    <div
      className={`absolute inset-0 rounded-xl flex flex-col items-center justify-center p-3 rotate-y-180 backface-hidden transition-all duration-500 shadow-xl shadow-black/30 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}
      style={{
        background: `linear-gradient(145deg, #1a1a2e 0%, #16213e 30%, #0f3460 70%, #1a1a2e 100%)`,
        border: `1px solid rgba(212,154,26,${isReversed ? '0.15' : '0.25'})`,
        transitionDelay: visible ? `${delay + 500}ms` : '0ms',
        boxShadow: visible
          ? `0 0 25px rgba(212,154,26,0.08), inset 0 0 20px rgba(212,154,26,0.03)`
          : 'none',
      }}
    >
      {/* 元素光晕背景 */}
      <div
        className="absolute inset-0 rounded-xl opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${ec.glow} 0%, transparent 60%)`,
        }}
      />

      {/* 标题装饰线 */}
      <div className="absolute top-2 inset-x-4 flex items-center gap-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
      </div>

      {/* 元素环 */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 border ${ec.border} relative`}
        style={{ boxShadow: `0 0 8px ${ec.glow}` }}
      >
        <span className={`text-lg ${ec.text}`}>
          {card.type === "major" ? "🃏" : card.suitIcon}
        </span>
      </div>

      {/* 牌名 */}
      <div className="text-center">
        <div className={`text-xs font-bold leading-tight ${isReversed ? 'text-red-400/80' : 'text-gold-light'}`}>
          {isReversed && <span className="inline-block mr-0.5">⬇</span>}
          {card.name}
        </div>
        <div className="text-[7px] text-white/20 leading-tight mt-0.5">
          {card.nameEn}
        </div>
      </div>

      {/* 元素标签 */}
      <div className={`text-[7px] ${ec.text}/40 mt-1 px-2 py-0.5 rounded-full border ${ec.border} bg-black/20`}>
        {card.element} · {card.type === 'major' ? '大' : card.type === 'court' ? '宫廷' : '小'}
      </div>

      {/* 分隔线 */}
      <div className="w-10 h-px my-2"
        style={{
          background: `linear-gradient(90deg, transparent, ${isReversed ? 'rgba(248,113,113,0.2)' : 'rgba(212,154,26,0.2)'}, transparent)`,
        }}
      />

      {/* 释义 */}
      <div className="text-[8px] text-white/35 text-center leading-relaxed px-1">
        {isReversed ? `⚠ ${card.meaningEn}` : card.meaning}
      </div>

      {/* 逆位标签 */}
      {isReversed && (
        <div className="text-[7px] text-red-400/40 mt-1.5 tracking-widest uppercase">
          Reversed
        </div>
      )}

      {/* 底部装饰 */}
      <div className="absolute bottom-2 inset-x-4 flex items-center gap-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
      </div>

      {/* 底部编号 */}
      <div className={`absolute bottom-1.5 text-[6px] ${ec.text}/20`}>
        #{card.cardNumber + 1}
      </div>
    </div>
  );
}

// ─── 主翻牌组件 ───
export default function FlippingCard({
  card,
  flipped,
  delay,
  index,
  totalCards,
}: {
  card: any;
  flipped: boolean;
  delay: number;
  index: number;
  totalCards: number;
}) {
  const [showFront, setShowFront] = useState(false);
  const [floatY, setFloatY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flipped) {
      const timer = setTimeout(() => setShowFront(true), delay + 500);
      return () => clearTimeout(timer);
    }
  }, [flipped, delay]);

  // 翻牌后的微浮动 + 呼吸效果
  useEffect(() => {
    if (showFront) {
      const start = Date.now();
      const interval = setInterval(() => {
        const t = Date.now() - start;
        setFloatY(Math.sin(t / 1800 + index * 1.2) * 3.5);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [showFront, index]);

  // 未翻牌时微呼吸
  useEffect(() => {
    if (!flipped) {
      const interval = setInterval(() => {
        setFloatY(Math.sin(Date.now() / 2500 + index * 0.8) * 2);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [flipped, index]);

  return (
    <div
      ref={cardRef}
      className="relative"
      style={{ transform: `translateY(${floatY}px)` }}
    >
      <div
        className={`relative w-32 h-48 sm:w-36 sm:h-52 md:w-40 md:h-56 cursor-pointer perspective-1000 transition-all duration-700 ease-out ${
          flipped ? '' : 'hover:-translate-y-3 hover:shadow-2xl hover:shadow-gold/10'
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div
          className={`relative w-full h-full transition-transform duration-[1000ms] ease-in-out preserve-3d ${
            flipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transitionDelay: `${delay}ms`,
            transitionTimingFunction: flipped
              ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'  // 弹性缓出
              : 'ease-in-out',
          }}
        >
          <CardBack />
          <CardFront card={card} visible={showFront} delay={delay} />
        </div>

        {/* 翻牌光效 */}
        {flipped && (
          <FlipGlow delay={delay} totalCards={totalCards} idx={index} />
        )}
      </div>
    </div>
  );
}