"use client";

import { useEffect, useRef } from "react";

// ─── 独立豪华版水晶球 ───
// 包含：多层发光、内部光晕旋转、高光反射、浮动效果
export default function CrystalBall({ size = "xl" }: { size?: "lg" | "xl" | "2xl" }) {
  const glowRef = useRef<HTMLDivElement>(null);

  const sizeMap = {
    lg: { emoji: "text-4xl", ball: "w-20 h-20", shine: "w-7 h-4", shine2: "w-4 h-2" },
    xl: { emoji: "text-5xl", ball: "w-24 h-24", shine: "w-9 h-5", shine2: "w-5 h-2.5" },
    "2xl": { emoji: "text-6xl", ball: "w-28 h-28", shine: "w-11 h-6", shine2: "w-6 h-3" },
  };

  const s = sizeMap[size];

  // 鼠标跟踪倾斜效果
  const ballRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ball = ballRef.current;
    if (!ball) return;

    const handleMove = (e: MouseEvent) => {
      const rect = ball.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      ball.style.setProperty('--tilt-x', `${dy * -15}deg`);
      ball.style.setProperty('--tilt-y', `${dx * 15}deg`);
    };

    const handleLeave = () => {
      ball.style.setProperty('--tilt-x', '0deg');
      ball.style.setProperty('--tilt-y', '0deg');
    };

    ball.addEventListener('mousemove', handleMove);
    ball.addEventListener('mouseleave', handleLeave);

    return () => {
      ball.removeEventListener('mousemove', handleMove);
      ball.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div
        ref={ballRef}
        className={`relative ${s.ball} flex items-center justify-center`}
        style={{
          perspective: '600px',
          transform: 'rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))',
          transition: 'transform 0.2s ease-out',
          cursor: 'default',
        }}
      >
        {/* 外层光晕 - 脉冲 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(136,221,255,0.2) 0%, rgba(68,187,238,0.05) 40%, transparent 65%)',
            animation: 'crystal-pulse 3s ease-in-out infinite',
            filter: 'blur(4px)',
          }}
        />

        {/* 旋转光环 */}
        <div
          className="absolute -inset-4 rounded-full"
          style={{
            background: `conic-gradient(from 0deg,
              transparent,
              rgba(136,221,255,0.06) 20%,
              rgba(187,238,255,0.1) 40%,
              rgba(136,221,255,0.06) 60%,
              transparent 80%,
              transparent
            )`,
            animation: 'crystal-rotate 6s linear infinite',
            filter: 'blur(8px)',
          }}
        />

        {/* 第二层光环 - 反向 */}
        <div
          className="absolute -inset-3 rounded-full"
          style={{
            background: `conic-gradient(from 180deg,
              transparent,
              rgba(212,154,26,0.04) 25%,
              rgba(136,221,255,0.08) 50%,
              rgba(212,154,26,0.04) 75%,
              transparent
            )`,
            animation: 'crystal-rotate 8s linear infinite reverse',
            filter: 'blur(6px)',
          }}
        />

        {/* 水晶球本体 */}
        <div
          className={`absolute inset-0 rounded-full`}
          style={{
            background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 0%, rgba(136,221,255,0.08) 15%, rgba(68,187,238,0.04) 30%, rgba(15,52,96,0.3) 55%, rgba(15,52,96,0.5) 100%)',
            boxShadow: `
              inset 0 0 30px rgba(136,221,255,0.1),
              inset 0 0 60px rgba(68,187,238,0.05),
              0 0 20px rgba(136,221,255,0.08),
              0 0 40px rgba(136,221,255,0.04)
            `,
            backdropFilter: 'blur(2px)',
            border: '1px solid rgba(136,221,255,0.15)',
          }}
        />

        {/* 高光 - 主光 */}
        <div
          className={`absolute rounded-full ${s.shine}`}
          style={{
            top: '12%',
            left: '20%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)',
            transform: 'rotate(-30deg)',
            pointerEvents: 'none',
          }}
        />

        {/* 高光 - 次光 */}
        <div
          className={`absolute rounded-full ${s.shine2}`}
          style={{
            bottom: '20%',
            right: '12%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, rgba(187,238,255,0.1) 50%, transparent)',
            transform: 'rotate(25deg)',
            pointerEvents: 'none',
          }}
        />

        {/* 底部辉光 */}
        <div
          className="absolute rounded-full"
          style={{
            width: '70%',
            height: '20%',
            bottom: '-5%',
            left: '15%',
            background: 'radial-gradient(ellipse, rgba(136,221,255,0.12) 0%, transparent 70%)',
            filter: 'blur(6px)',
            pointerEvents: 'none',
          }}
        />

        {/* 🔮 emoji */}
        <span className={`relative z-10 ${s.emoji} drop-shadow-[0_0_15px_rgba(136,221,255,0.5)]`}>
          🔮
        </span>
      </div>
    </div>
  );
}