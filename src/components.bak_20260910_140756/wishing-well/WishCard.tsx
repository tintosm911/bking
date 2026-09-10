"use client";

import { useState } from "react";

export interface Wish {
  id: string;
  category: string;
  title: string;
  content: string;
  amount: string;
  contributorCount: number;
  progress: number;
  status: "open" | "funding" | "fulfilled" | "expired";
  createdAt: string;
  expiresAt: string;
}

const categoryEmoji: Record<string, string> = {
  wealth: "💰",
  love: "💕",
  career: "💼",
  health: "🏥",
  study: "📚",
  family: "👨‍👩‍👧‍👧",
  spiritual: "🕯️",
  other: "✨",
};

const categoryNames: Record<string, string> = {
  wealth: "财运",
  love: "姻缘",
  career: "事业",
  health: "健康",
  study: "学业",
  family: "家庭",
  spiritual: "灵性",
  other: "其他",
};

const statusStyles: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  funding: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  fulfilled: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  expired: "bg-gray-500/10 text-gray-400 border-gray-500/10",
};

const statusNames: Record<string, string> = {
  open: "待开启",
  funding: "募集中",
  fulfilled: "已愿成",
  expired: "已过期",
};

export default function WishCard({ wish }: { wish: Wish }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="group relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] hover:border-gold/25 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Top badge */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{categoryEmoji[wish.category] || "✨"}</span>
          <span className="text-xs text-white/40">{categoryNames[wish.category] || "其他"}</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] border ${statusStyles[wish.status]}`}>
          {statusNames[wish.status]}
        </span>
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        <h3 className="text-base font-serif font-bold text-white/80 mb-1.5 group-hover:text-gold transition-colors">
          {wish.title}
        </h3>
        <p className={`text-xs text-white/40 leading-relaxed transition-all ${
          expanded ? "" : "line-clamp-2"
        }`}>
          {wish.content}
        </p>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-white/30">
            {wish.amount} {wish.status === "funding" ? "已筹" : "目标"}
          </span>
          <span className="text-[10px] text-gold">{wish.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500"
            style={{ width: `${wish.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between border-t border-white/[0.04] pt-3">
        <span className="text-[10px] text-white/20">
          {wish.contributorCount} 人助力 · {wish.createdAt}
        </span>
        <span className="text-[10px] text-white/20">
          截止 {wish.expiresAt}
        </span>
      </div>
    </div>
  );
}