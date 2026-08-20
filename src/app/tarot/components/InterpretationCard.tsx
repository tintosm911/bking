"use client";

import { useEffect, useState } from "react";

// ─── 逐行显现解读组件 ───
export default function InterpretationCard({
  interpretation,
  onReset,
}: {
  interpretation: string;
  onReset: () => void;
}) {
  const lines = interpretation.split("\n");
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    setVisibleLines(0);
    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= lines.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [interpretation, lines.length]);

  return (
    <div className="max-w-2xl mx-auto animate-reveal-in">
      <div className="relative rounded-2xl p-6 border overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'rgba(212,154,26,0.12)',
          boxShadow: '0 0 30px rgba(212,154,26,0.04), inset 0 0 30px rgba(212,154,26,0.02)',
        }}
      >
        {/* 顶部装饰线 */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(212,154,26,0.2), transparent)',
          }}
        />

        {/* 标题 */}
        <div className="text-center mb-5">
          <div className="relative inline-block">
            <span className="text-lg font-serif font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-dark))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ✦ 塔罗解读 ✦
            </span>
          </div>
        </div>

        {/* 解读内容 - 逐行显现 */}
        <div className="space-y-1">
          {lines.slice(0, visibleLines).map((line, i) => (
            <p
              key={i}
              className="text-xs sm:text-sm leading-relaxed font-sans"
              style={{
                color: line.startsWith("——") ? 'rgba(212,154,26,0.4)' :
                       line.startsWith("  ") ? 'rgba(255,255,255,0.35)' :
                       'rgba(255,255,255,0.7)',
                animation: 'reveal-in 0.4s ease-out forwards',
                paddingLeft: line.startsWith("  ") ? '1rem' : '0',
                marginTop: !line ? '0.25rem' : '0',
              }}
            >
              {line || "\u00A0"}
            </p>
          ))}

          {/* 加载光标 */}
          {visibleLines < lines.length && (
            <span className="inline-block w-2 h-4 bg-gold-light/40 animate-pulse ml-0.5" />
          )}
        </div>

        {/* 底部装饰 */}
        <div className="absolute bottom-0 left-1/3 right-1/3 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(212,154,26,0.08), transparent)',
          }}
        />
      </div>

      {/* 重新占卜按钮 */}
      <div className="text-center mt-6">
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-xl text-sm border transition-all inline-flex items-center gap-2 group"
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.5)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(212,154,26,0.3)';
            e.currentTarget.style.color = 'var(--gold)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          <span className="group-hover:rotate-180 transition-transform duration-500 inline-block">🔄</span>
          重新占卜
        </button>
      </div>
    </div>
  );
}