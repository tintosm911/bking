"use client";

/**
 * TTSButton — 玄机大师语音播报（成熟男声）
 * =====================================================
 * 调用后端 /api/tts（Edge TTS 云健男声），产出**成熟深沉的玄机大师音**，
 * 替代原浏览器 AI 机器音 / 小女孩声。
 *
 * 支持开始 / 暂停 / 继续 / 停止；读文本时金色脉冲 + 旋转声纹。
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
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);
  const [err, setErr] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seqRef = useRef(0); // 防止并发/过期响应

  // 组件卸载时停止
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    seqRef.current++;
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(false);
    setPaused(false);
    setLoading(false);
    setErr("");
  }, []);

  const speak = useCallback(async () => {
    if (!text || typeof window === "undefined") return;
    const mySeq = ++seqRef.current;
    audioRef.current?.pause();
    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, rate: rate * 1.0, voice: "zh-CN-YunjianNeural" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "TTS 失败");
      }
      if (mySeq !== seqRef.current) return; // 已停止/被新朗读覆盖

      const blob = await res.blob();
      if (mySeq !== seqRef.current) return;
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => { setSpeaking(false); setPaused(false); setLoading(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setErr("播放失败"); setSpeaking(false); setPaused(false); setLoading(false); };
      audio.onpause = () => setPaused(true);
      audio.onplay = () => setPaused(false);

      setLoading(false);
      await audio.play();
      setSpeaking(true);
    } catch (e: any) {
      if (mySeq === seqRef.current) {
        setErr(e.message || "语音失败");
        setLoading(false);
        setSpeaking(false);
      }
    }
  }, [text, rate]);

  const toggle = useCallback(() => {
    if (loading) return;
    if (!speaking) {
      speak();
    } else if (paused) {
      audioRef.current?.play();
      setPaused(false);
    } else {
      audioRef.current?.pause();
      setPaused(true);
    }
  }, [speaking, paused, loading, speak]);

  const base = small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        onClick={toggle}
        title={speaking ? (paused ? "继续朗读" : "暂停朗读") : "听解读"}
        disabled={loading}
        className={`
          inline-flex items-center gap-1.5 rounded-full font-medium transition-all
          border ${small ? "border-gold/25" : "border-gold/30"}
          disabled:opacity-60
          ${speaking
            ? "bg-gold/25 text-gold border-gold/50 shadow-[0_0_18px_rgba(212,154,26,0.35)]"
            : "bg-gold/8 text-gold hover:bg-gold/15 hover:border-gold/50 hover:shadow-[0_0_12px_rgba(212,154,26,0.25)]"}
          ${base}
        `}
      >
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
        <span>
          {loading ? "合成中…" : speaking ? (paused ? "继续" : "停止") : label.replace("🔊 ", "")}
        </span>
      </button>
      {err && <span className="text-[10px] text-red-400">{err}</span>}
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
