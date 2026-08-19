"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// 78张塔罗牌 - 大阿卡纳22张 + 小阿卡纳56张
type Card = {
  id: number;
  name: string;
  nameEn: string;
  element: string;
  meaning: string;
  meaningEn: string;
  type: "major" | "minor" | "court";
  suit: string;
  suitEn: string;
  suitIcon: string;
  rank: string;
  rankEn: string;
  cardNumber: number;
};

const MAJOR_ARCANA = [
  { id: 0, name: "愚者", nameEn: "The Fool", element: "风", meaning: "新的开始、冒险、天真", meaningEn: "New beginnings, adventure, innocence" },
  { id: 1, name: "魔术师", nameEn: "The Magician", element: "风", meaning: "创造力、自信、技能", meaningEn: "Creativity, confidence, skill" },
  { id: 2, name: "女祭司", nameEn: "The High Priestess", element: "水", meaning: "直觉、神秘、潜意识", meaningEn: "Intuition, mystery, subconscious" },
  { id: 3, name: "女皇", nameEn: "The Empress", element: "土", meaning: "丰收、滋养、母性", meaningEn: "Abundance, nurturing, femininity" },
  { id: 4, name: "皇帝", nameEn: "The Emperor", element: "火", meaning: "权威、秩序、掌控", meaningEn: "Authority, order, control" },
  { id: 5, name: "教皇", nameEn: "The Hierophant", element: "土", meaning: "传统、智慧、导师", meaningEn: "Tradition, wisdom, mentor" },
  { id: 6, name: "恋人", nameEn: "The Lovers", element: "风", meaning: "选择、爱情、联结", meaningEn: "Choices, love, connection" },
  { id: 7, name: "战车", nameEn: "The Chariot", element: "水", meaning: "胜利、决心、征服", meaningEn: "Victory, determination, conquest" },
  { id: 8, name: "力量", nameEn: "Strength", element: "火", meaning: "勇气、毅力、内在力量", meaningEn: "Courage, endurance, inner strength" },
  { id: 9, name: "隐士", nameEn: "The Hermit", element: "土", meaning: "内省、智慧、独处", meaningEn: "Introspection, wisdom, solitude" },
  { id: 10, name: "命运之轮", nameEn: "Wheel of Fortune", element: "火", meaning: "变化、轮回、机遇", meaningEn: "Change, cycles, opportunity" },
  { id: 11, name: "正义", nameEn: "Justice", element: "风", meaning: "公平、真相、因果", meaningEn: "Fairness, truth, cause-effect" },
  { id: 12, name: "倒吊人", nameEn: "The Hanged Man", element: "水", meaning: "牺牲、换位思考、等待", meaningEn: "Sacrifice, new perspective, surrender" },
  { id: 13, name: "死神", nameEn: "Death", element: "水", meaning: "结束、转变、重生", meaningEn: "Endings, transformation, rebirth" },
  { id: 14, name: "节制", nameEn: "Temperance", element: "火", meaning: "平衡、调和、耐心", meaningEn: "Balance, moderation, patience" },
  { id: 15, name: "恶魔", nameEn: "The Devil", element: "土", meaning: "束缚、欲望、沉迷", meaningEn: "Bondage, materialism, obsession" },
  { id: 16, name: "高塔", nameEn: "The Tower", element: "火", meaning: "剧变、崩塌、觉醒", meaningEn: "Upheaval, collapse, awakening" },
  { id: 17, name: "星星", nameEn: "The Star", element: "风", meaning: "希望、灵感、宁静", meaningEn: "Hope, inspiration, serenity" },
  { id: 18, name: "月亮", nameEn: "The Moon", element: "水", meaning: "幻象、恐惧、直觉", meaningEn: "Illusion, fear, intuition" },
  { id: 19, name: "太阳", nameEn: "The Sun", element: "火", meaning: "喜悦、成功、活力", meaningEn: "Joy, success, vitality" },
  { id: 20, name: "审判", nameEn: "Judgement", element: "火", meaning: "觉醒、重生、召唤", meaningEn: "Awakening, rebirth, calling" },
  { id: 21, name: "世界", nameEn: "The World", element: "土", meaning: "完成、圆满、成就", meaningEn: "Completion, fulfillment, accomplishment" },
];

const SUITS = ["权杖", "圣杯", "宝剑", "星币"];
const SUITS_EN = ["Wands", "Cups", "Swords", "Pentacles"];
const SUIT_COLORS = ["from-orange-500/30", "from-blue-500/30", "from-cyan-400/30", "from-yellow-500/30"];
const SUIT_ICONS = ["🔥", "💧", "⚔️", "💰"];
const COURT_RANKS = ["侍卫", "骑士", "女王", "国王"];
const COURT_RANKS_EN = ["Page", "Knight", "Queen", "King"];
const NUMBER_RANKS = ["Ace", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

function getAllCards(): Card[] {
  const cards: Card[] = (MAJOR_ARCANA.map((m, i) => ({
    ...m,
    type: "major" as const,
    suit: "",
    suitEn: "",
    suitIcon: "",
    rank: m.name,
    rankEn: m.nameEn,
    cardNumber: i,
  })) as Card[]).concat(
    SUITS.flatMap((suit, si) => {
      const result: Card[] = [];
      const meanings: Record<string, { zh: string; en: string }> = {
        "权杖": { zh: "行动、热情、创造", en: "Action, passion, creation" },
        "圣杯": { zh: "情感、关系、直觉", en: "Emotion, relationships, intuition" },
        "宝剑": { zh: "思维、冲突、真理", en: "Thought, conflict, truth" },
        "星币": { zh: "物质、工作、财富", en: "Material, work, wealth" },
      };
      const courtMeanings: Record<string, { zh: string; en: string }> = {
        "权杖": { zh: "冒险者、创业者、开拓者", en: "Adventurer, entrepreneur, pioneer" },
        "圣杯": { zh: "情感使者、疗愈者、艺术家", en: "Emotional messenger, healer, artist" },
        "宝剑": { zh: "思考者、沟通者、智谋家", en: "Thinker, communicator, strategist" },
        "星币": { zh: "工匠、管理者、守护者", en: "Craftsman, manager, guardian" },
      };
      for (let i = 1; i <= 10; i++) {
        result.push({
          id: 22 + si * 14 + i - 1, name: `${suit}${i}`, nameEn: `${NUMBER_RANKS[i]} of ${SUITS_EN[si]}`,
          type: "minor" as const, suit, suitEn: SUITS_EN[si], suitIcon: SUIT_ICONS[si],
          rank: `${suit}${i}`, rankEn: `${NUMBER_RANKS[i]} of ${SUITS_EN[si]}`,
          element: ["火", "水", "风", "土"][si], meaning: meanings[suit].zh, meaningEn: meanings[suit].en, cardNumber: 22 + si * 14 + i - 1,
        });
      }
      COURT_RANKS.forEach((rank, ri) => {
        result.push({
          id: 22 + si * 14 + 10 + ri, name: `${suit}${rank}`, nameEn: `${rank} of ${SUITS_EN[si]}`,
          type: "court" as const, suit, suitEn: SUITS_EN[si], suitIcon: SUIT_ICONS[si],
          rank, rankEn: COURT_RANKS_EN[ri],
          element: ["火", "水", "风", "土"][si], meaning: courtMeanings[suit].zh, meaningEn: courtMeanings[suit].en, cardNumber: 22 + si * 14 + 10 + ri,
        });
      });
      return result;
    })
  );

  return cards;
}

const ALL_CARDS = getAllCards();

// 牌阵定义
const SPREADS = [
  {
    name: "单张牌",
    nameEn: "Single Card",
    nameZh: "单张牌",
    cards: 1,
    desc: "快速指引，今日运势",
    descEn: "Quick guidance, daily reading",
  },
  {
    name: "三牌阵",
    nameEn: "Three Card Spread",
    nameZh: "三牌阵",
    cards: 3,
    desc: "过去·现在·未来",
    descEn: "Past · Present · Future",
  },
  {
    name: "凯尔特十字",
    nameEn: "Celtic Cross",
    nameZh: "凯尔特十字",
    cards: 5,
    desc: "深度综合解读",
    descEn: "Deep comprehensive reading",
  },
];

function generateReading(spreadIdx: number) {
  const spread = SPREADS[spreadIdx];
  const shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, spread.cards).map((c) => ({
    ...c,
    reversed: Math.random() > 0.7,
  }));
  return selected;
}

// 炫光特效组件 - 翻牌时的光效
function FlipGlow({ delay }: { delay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay + 200);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/30 to-transparent animate-shimmer-fast" />
      <div className="absolute -inset-2 bg-gold/10 blur-xl animate-pulse-slow" />
    </div>
  );
}

// 翻牌动画组件 - 3D翻牌 + 光效 + 粒子
function FlippingCard({
  card,
  flipped,
  delay,
  index,
}: {
  card: any;
  flipped: boolean;
  delay: number;
  index: number;
}) {
  const [showFront, setShowFront] = useState(false);
  const [floatY, setFloatY] = useState(0);

  useEffect(() => {
    if (flipped) {
      const timer = setTimeout(() => setShowFront(true), delay + 500);
      return () => clearTimeout(timer);
    }
  }, [flipped, delay]);

  // 翻牌后的微浮动效果
  useEffect(() => {
    if (showFront) {
      const interval = setInterval(() => {
        setFloatY(Math.sin(Date.now() / 2000 + index) * 4);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [showFront, index]);

  return (
    <div
      className="relative"
      style={{ transform: `translateY(${floatY}px)` }}
    >
      {/* 粒子背景 */}
      {flipped && (
        <div className="absolute -inset-4 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold/40 animate-particle"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
                animationDelay: `${delay + i * 150}ms`,
                animationDuration: `${1.5 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className={`relative w-32 h-48 sm:w-36 sm:h-52 md:w-40 md:h-56 cursor-pointer perspective-1000 transition-all duration-700 ease-out ${
          flipped ? "" : "hover:-translate-y-3"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div
          className={`relative w-full h-full transition-transform duration-[800ms] ease-in-out preserve-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
          style={{ transitionDelay: `${delay}ms` }}
        >
          {/* Card back - 华丽背面 */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-dark-900 via-gold-dark/30 to-dark-900 border border-gold/25 flex items-center justify-center backface-hidden shadow-xl shadow-gold/15 overflow-hidden">
            {/* 装饰底纹 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-3 left-3 w-8 h-8 border-t border-l border-gold/40 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-gold/40 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b border-l border-gold/40 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b border-r border-gold/40 rounded-br-lg" />
            </div>
            {/* 中央纹章 */}
            <div className="text-center relative z-10">
              <div className="w-14 h-14 mx-auto mb-2 rounded-full border-2 border-gold/30 flex items-center justify-center">
                <span className="text-3xl opacity-70">🔮</span>
              </div>
              <div className="text-sm text-gold/50 tracking-[0.3em] font-serif">BKing</div>
              <div className="text-[8px] text-gold/20 mt-1 tracking-[0.2em]">TAROT</div>
            </div>
            {/* 中心装饰线 */}
            <div className="absolute inset-x-4 top-1/2 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          </div>

          {/* Card front - 华丽正面 */}
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-950 border border-gold/20 flex flex-col items-center justify-center p-3 rotate-y-180 backface-hidden transition-all duration-500 shadow-xl shadow-black/30 ${
              showFront ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{ transitionDelay: showFront ? `${delay + 500}ms` : "0ms" }}
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute inset-3 rounded-lg border border-gold/20" />
            </div>

            {/* 元素环 */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 border border-current ${
              card.element === "火" ? "text-orange-400/40" :
              card.element === "水" ? "text-blue-400/40" :
              card.element === "风" ? "text-cyan-300/40" :
              "text-green-400/40"
            }`}>
              <span className="text-xl">
                {card.type === "major" ? "🃏" : card.suitIcon}
              </span>
            </div>

            {/* 牌名 */}
            <div className="text-center">
              <div className={`text-xs font-bold leading-tight mb-0.5 ${
                card.reversed ? "text-red-400" : "text-gold-light"
              }`}>
                {card.reversed && <span className="inline-block mr-0.5">⬇</span>}
                {card.name}
              </div>
              <div className="text-[8px] text-white/25 leading-tight">
                {card.nameEn}
              </div>
            </div>

            {/* 元素标签 */}
            <div className="text-[7px] text-white/15 mt-0.5 px-2 py-0.5 rounded-full border border-white/5">
              {card.element}
            </div>

            {/* 分隔线 */}
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent my-1.5" />

            {/* 释义 */}
            <div className="text-[8px] text-white/35 text-center leading-tight px-1">
              {card.reversed ? `⚠ ${card.meaningEn}` : card.meaning}
            </div>

            {card.reversed && (
              <div className="text-[7px] text-red-400/50 mt-1 tracking-wider uppercase">
                Reversed
              </div>
            )}

            {/* 底部装饰 */}
            <div className="absolute bottom-1.5 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
        </div>

        {/* 翻牌光效 */}
        {flipped && <FlipGlow delay={delay} />}
      </div>
    </div>
  );
}

// 牌阵位置说明
function SpreadPosition({ spreadIdx, cardIdx }: { spreadIdx: number; cardIdx: number }) {
  const positions: Record<number, string[]> = {
    0: ["今日指引"],
    1: ["过去", "现在", "未来"],
    2: ["当前状态", "挑战", "资源", "目标", "结果"],
  };
  const positionsEn: Record<number, string[]> = {
    0: ["Today's Guidance"],
    1: ["Past", "Present", "Future"],
    2: ["Current", "Challenge", "Resources", "Goal", "Outcome"],
  };
  const pos = positions[spreadIdx] || [""];
  const posEn = positionsEn[spreadIdx] || [""];
  return (
    <div className="text-center mb-1">
      <div className="text-[10px] text-gold font-medium">{pos[cardIdx]}</div>
      <div className="text-[8px] text-white/20">{posEn[cardIdx]}</div>
    </div>
  );
}

// 解读生成
function generateInterpretation(cards: any[], spreadIdx: number) {
  const majorCount = cards.filter((c) => c.type === "major").length;
  const reversalCount = cards.filter((c) => c.reversed).length;
  const elements = cards.map((c) => c.element);
  const dominantElements = [...new Set(elements)].sort(
    (a, b) => elements.filter((e) => e === b).length - elements.filter((e) => e === a).length
  );

  const lines: string[] = [];
  lines.push(`本次占卜抽取了 ${cards.length} 张牌：`);
  cards.forEach((c, i) => {
    const pos = SPREADS[spreadIdx].nameZh;
    lines.push(`${i + 1}. ${c.name} (${c.nameEn})${c.reversed ? " 逆位" : ""}`);
  });

  if (majorCount >= 2) {
    lines.push(`\n大阿卡纳出现 ${majorCount} 张，本次占卜能量较强，涉及重大人生课题。`);
  }

  if (reversalCount >= 2) {
    lines.push(`${reversalCount} 张逆位牌，建议审视当前阻碍，调整方向。`);
  }

  lines.push(`\n主导元素: ${dominantElements.join("、")}`);
  const elementMeanings: Record<string, string> = {
    "火": "行动力强，需要果断决策",
    "水": "情感主导，听从直觉",
    "风": "理智思考，沟通关键",
    "土": "务实稳健，关注现实",
  };
  dominantElements.forEach((el) => {
    if (elementMeanings[el]) lines.push(`  ${el}: ${elementMeanings[el]}`);
  });

  lines.push(`\n—— BKing AI 塔罗解读 · 仅供参考 ——`);
  return lines.join("\n");
}

export default function TarotPage() {
  const [spreadIdx, setSpreadIdx] = useState(0);
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [interpretation, setInterpretation] = useState("");
  const [animating, setAnimating] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [showAllCards, setShowAllCards] = useState(false);
  const [filterSuit, setFilterSuit] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const handleDraw = () => {
    setAnimating(true);
    setFlipped(false);
    setInterpretation("");

    setTimeout(() => {
      const drawn = generateReading(spreadIdx);
      setCards(drawn);
      setTimeout(() => {
        setFlipped(true);
        setTimeout(() => {
          setAnimating(false);
          setInterpretation(generateInterpretation(drawn, spreadIdx));
        }, 1200 + drawn.length * 300);
      }, 300);
    }, 400);
  };

  // 牌库过滤
  const filteredCards = ALL_CARDS.filter((c) => {
    if (filterType === "major" && c.type !== "major") return false;
    if (filterType === "minor" && c.type !== "minor" && c.type !== "court") return false;
    if (filterSuit !== "all" && c.suit !== filterSuit && c.type !== "major") return false;
    if (filterSuit !== "all" && c.type === "major") return false; // major only shows when suit=all
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Nav */}
      <nav className="relative z-10 border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-gold text-xl font-serif font-bold">BKing</Link>
          <span className="text-gold/60 text-sm">塔罗占卜</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🔮</div>
          <h1 className="text-3xl font-serif font-bold text-gold">塔罗占卜</h1>
          <p className="text-gray-400 mt-2">78 张塔罗牌 · 三大牌阵 · AI 解读</p>
          <p className="text-xs text-white/15 mt-1">Tarot · 78 Cards · 3 Spreads · AI Interpretation</p>
        </div>

        {/* Spread Selector */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="flex justify-center gap-2">
            {SPREADS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setSpreadIdx(i); setCards([]); setInterpretation(""); }}
                className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                  spreadIdx === i
                    ? "btn-gold text-dark-900 font-semibold"
                    : "bg-dark-700 border border-white/10 text-white/60 hover:border-gold/30"
                }`}
              >
                {s.nameZh}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-white/30 mt-2">{SPREADS[spreadIdx].desc}</p>
        </div>

        {/* Draw Button */}
        <div className="text-center mb-10">
          <button
            onClick={handleDraw}
            disabled={animating}
            className="btn-gold px-8 py-3.5 rounded-xl text-base font-semibold disabled:opacity-50 inline-flex items-center gap-2 shadow-lg shadow-gold/15"
          >
            {animating ? "🔮 占卜中..." : "🎴 开始抽牌"}
          </button>
        </div>

        {/* Cards Display */}
        {cards.length > 0 && (
          <div className="mb-10">
            <div
              ref={cardsRef}
              className="flex flex-wrap justify-center gap-4 md:gap-6"
            >
              {cards.map((card, i) => (
                <div key={i} className="flex flex-col items-center">
                  <SpreadPosition spreadIdx={spreadIdx} cardIdx={i} />
                  <FlippingCard card={card} flipped={flipped} delay={i * 300} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interpretation */}
        {interpretation && (
          <div className="max-w-2xl mx-auto">
            <div className="glass rounded-2xl p-6 border border-gold/20">
              <h2 className="text-lg font-serif font-bold text-gold mb-4 text-center">【塔罗解读】</h2>
              <pre className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                {interpretation}
              </pre>
            </div>

            <div className="text-center mt-6">
              <button onClick={() => { setCards([]); setInterpretation(""); }}
                className="px-6 py-3 rounded-xl text-sm border border-white/10 text-white/60 hover:border-gold/30 hover:text-gold transition-all">
                重新占卜
              </button>
            </div>
          </div>
        )}

        {/* Full Card Library - Toggle */}
        <div className="mt-16">
          <button
            onClick={() => setShowAllCards(!showAllCards)}
            className="w-full text-center py-3 text-sm text-white/40 hover:text-gold transition-colors border-t border-white/5"
          >
            {showAllCards ? "收起牌库 ▲" : "完整牌库 ▼ (78张)"}
          </button>

          {showAllCards && (
            <div className="mt-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                <button onClick={() => { setFilterType("all"); setFilterSuit("all"); }}
                  className={`px-3 py-1.5 rounded-lg text-xs ${filterType === "all" ? "btn-gold text-dark-900" : "bg-dark-700 border border-white/10 text-white/50"}`}>
                  全部
                </button>
                <button onClick={() => setFilterType("major")}
                  className={`px-3 py-1.5 rounded-lg text-xs ${filterType === "major" ? "btn-gold text-dark-900" : "bg-dark-700 border border-white/10 text-white/50"}`}>
                  大阿卡纳
                </button>
                {SUITS.map((s, i) => (
                  <button key={s} onClick={() => { setFilterSuit(s); setFilterType(""); }}
                    className={`px-3 py-1.5 rounded-lg text-xs ${filterSuit === s ? "btn-gold text-dark-900" : "bg-dark-700 border border-white/10 text-white/50"}`}>
                    {SUIT_ICONS[i]} {s}
                  </button>
                ))}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {(filterType === "all" && filterSuit === "all" ? ALL_CARDS : filteredCards).map((card) => (
                  <div key={card.id}
                    className="bg-dark-800 border border-white/5 rounded-xl p-2 text-center hover:border-gold/20 transition-colors cursor-default"
                  >
                    <div className="text-lg mb-0.5">{card.type === "major" ? "🃏" : card.suitIcon}</div>
                    <div className="text-[10px] font-bold text-gold-light leading-tight">{card.name}</div>
                    <div className="text-[7px] text-white/20 truncate">{card.nameEn}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
