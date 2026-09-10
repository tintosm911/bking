"use client";

/**
 * TTSButton — 玄机语音播报按钮
 * =====================================================
 * C 档「体验升级」①：结果能"说"出来，更有仪式感。
 *
 * 实现：浏览器原生 Web Speech API（speechSynthesis），
 *   - 零成本、零依赖、无墙，Vercel 可直跑
 *   - 中文语音（zh-CN），自动挑系统里最好的中文音色
 *   - 黑金玄学按钮，读文本时金色脉冲 + 旋转声纹
 *   - 支持开始 / 暂停 / 停止
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface TTSButtonProps {
  /** 要朗读的文本 */
  text: string;
  /** 按钮文案 */
  label?: string;
  /** 朗读速率 0.8~1.1 */
  rate?: number;
  /** 小尺寸模式（用于解读卡片内嵌） */
  small?: boolean;
}

export default function TTSButton({ text, label = "🔊 听解读", rate = 0.95, small = false }: TTSButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 检测浏览器是否支持 TTS（前端降级，不支持就隐藏按钮）
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  // 组件卸载时停止朗读
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setPaused(false);
  }, []);

  const speak = useCallback(() => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    // 已有朗读 → 先停
    synth.cancel();

    const clean = text
      // 去掉 markdown / 代码块符号，只留可朗读的中文正文
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[#>*`~—•·|]/g, "")
      .replace(/\*\*|__|【|】/g, (m) => (m === "【" ? "\n" : m === "】" ? "：" : ""))
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!clean) return;

    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "zh-CN";
    u.rate = rate;
    u.pitch = 1;
    u.volume = 1;

    // 挑中文音色（优先导出的中文女声，其次任意中文，最后默认）
    const voices = synth.getVoices();
    const zh = voices.filter((v) => v.lang.toLowerCase().startsWith("zh"));
    if (zh.length) {
      // 优先"普通话/女声/自然"，否则用第一个
      const preferred =
        zh.find((v) => /xiaoxiao|huihui|yaoyao|tingting|meijia|女|female/i.test(v.name)) || zh[0];
      u.voice = preferred;
    }

    u.onstart = () => setSpeaking(true);
    u.onend = () => { setSpeaking(false); setPaused(false); };
    u.onerror = () => { setSpeaking(false); setPaused(false); };

    utteranceRef.current = u;
    synth.speak(u);
  }, [text, rate]);

  const toggle = useCallback(() => {
    if (!speaking) {
      speak();
    } else if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }, [speaking, paused, speak]);

  if (!supported) return null;

  const base = small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        onClick={toggle}
        title={speaking ? (paused ? "继续朗读" : "暂停朗读") : "听解读"}
        className={`
          inline-flex items-center gap-1.5 rounded-full font-medium transition-all
          border ${small ? "border-gold/25" : "border-gold/30"}
          ${speaking
            ? "bg-gold/25 text-gold border-gold/50 shadow-[0_0_18px_rgba(212,154,26,0.35)]"
            : "bg-gold/8 text-gold hover:bg-gold/15 hover:border-gold/50 hover:shadow-[0_0_12px_rgba(212,154,26,0.25)]"}
          ${base}
        `}
      >
        {/* 声纹动画：朗读时波纹跳动画 */}
        <span className="flex items-end gap-[2px] h-3.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`w-[2px] bg-current rounded-full ${speaking && !paused ? "animate-pulse" : ""}`}
              style={{
                height: speaking && !paused
                  ? `${[70, 100, 55, 85][i]}%`
                  : "35%",
                animationDelay: `${i * 0.12}s`,
                transition: "height 0.2s ease",
              }}
            />
          ))}
        </span>
        <span>{speaking ? (paused ? "继续" : "停止") : label.replace("🔊 ", "")}</span>
      </button>
      {speaking && (
        <button
          onClick={stop}
          title="停止朗读"
          className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 hover:text-white/80 border border-white/10"
        >
          停止
        </button>
      )}
    </div>
  );
}
