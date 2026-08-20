"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import FlippingCard from "./components/FlippingCard";
import CrystalBall from "./components/CrystalBall";
import InterpretationCard from "./components/InterpretationCard";

// ─── 塔罗牌数据 ───
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
const SUIT_ICONS = ["🔥", "💧", "⚔️", "💰"];
const SUIT_COLORS = ["from-orange-500/20", "from-blue-500/20", "from-cyan-400/20", "from-yellow-500/20"];
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

const SPREADS = [
  {
    nameZh: "单张牌",
    nameEn: "Single Card",
    cards: 1,
    desc: "快速指引，今日运势",
    descEn: "Quick guidance, daily reading",
  },
  {
    nameZh: "三牌阵",
    nameEn: "Three Card Spread",
    cards: 3,
    desc: "过去·现在·未来",
    descEn: "Past · Present · Future",
  },
  {
    nameZh: "凯尔特十字",
    nameEn: "Celtic Cross",
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
    const pos = ["今日指引", "过去", "现在", "未来", "当前状态", "挑战", "资源", "目标", "结果"][i * 3] || `位置 ${i + 1}`;
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

const SpreadPositions: Record<number, { zh: string; en: string }[]> = {
  0: [{ zh: "今日指引", en: "Today's Guidance" }],
  1: [{ zh: "过去", en: "Past" }, { zh: "现在", en: "Present" }, { zh: "未来", en: "Future" }],
  2: [{ zh: "当前状态", en: "Current" }, { zh: "挑战", en: "Challenge" }, { zh: "资源", en: "Resources" }, { zh: "目标", en: "Goal" }, { zh: "结果", en: "Outcome" }],
};

export default function TarotPage() {
  const [spreadIdx, setSpreadIdx] = useState(0);
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [interpretation, setInterpretation] = useState("");
  const [animating, setAnimating] = useState(false);
  const [showAllCards, setShowAllCards] = useState(false);
  const [filterSuit, setFilterSuit] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [hoveredSpread, setHoveredSpread] = useState<number | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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
        }, 1200 + drawn.length * 500);
      }, 400);
    }, 400);
  };

  const handleReset = () => {
    setCards([]);
    setInterpretation("");
    setFlipped(false);
  };

  const filteredCards = ALL_CARDS.filter((c) => {
    if (filterType === "major" && c.type !== "major") return false;
    if (filterSuit !== "all" && c.suit !== filterSuit) return false;
    if (filterSuit !== "all" && filterType === "all" && c.type === "major") return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden">
      {/* 背景光晕 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(136,221,255,0.12) 0%, transparent 60%)',
            animation: 'aurora-drift 15s ease-in-out infinite',
          }}
        />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(212,154,26,0.08) 0%, transparent 60%)',
            animation: 'aurora-drift 18s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-gold/10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-gold text-xl font-serif font-bold tracking-wide">
            BKing
          </Link>
          <span className="text-gold/50 text-sm tracking-wider">塔罗占卜</span>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* ─── Header ─── */}
        <div className="text-center mb-8">
          <div className="mb-4 animate-float-soft">
            <CrystalBall size="xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-dark))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            塔罗占卜
          </h1>
          <p className="text-gray-400 mt-2 text-sm">78 张塔罗牌 · 三大牌阵 · AI 解读</p>
          <p className="text-[10px] text-white/15 mt-1 tracking-wider">Tarot · 78 Cards · 3 Spreads · AI Interpretation</p>
        </div>

        {/* ─── 牌阵选择 ─── */}
        <div className="max-w-lg mx-auto mb-6">
          <div className="flex justify-center gap-2">
            {SPREADS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setSpreadIdx(i); handleReset(); }}
                onMouseEnter={() => setHoveredSpread(i)}
                onMouseLeave={() => setHoveredSpread(null)}
                className={`relative px-4 py-2.5 rounded-xl text-sm transition-all duration-300 overflow-hidden ${
                  spreadIdx === i
                    ? 'text-dark-900 font-semibold shadow-lg shadow-gold/20'
                    : 'bg-dark-700/50 border border-white/10 text-white/60 hover:border-gold/30 hover:text-gold/80'
                }`}
              >
                {spreadIdx === i && (
                  <div className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--gold), var(--gold-light), var(--gold))',
                    }}
                  />
                )}
                <span className="relative z-10">{s.nameZh}</span>
                {hoveredSpread === i && spreadIdx !== i && (
                  <div className="absolute inset-0 bg-gold/5" />
                )}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-white/30 mt-2">{SPREADS[spreadIdx].desc}</p>
        </div>

        {/* ─── 抽牌按钮 ─── */}
        <div className="text-center mb-8">
          <button
            onClick={handleDraw}
            disabled={animating}
            className="relative group px-10 py-4 rounded-xl text-base font-semibold disabled:opacity-50 inline-flex items-center gap-3 overflow-hidden transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 40%, var(--gold) 70%, var(--gold-dark) 100%)',
              boxShadow: '0 4px 25px rgba(212,154,26,0.25)',
              backgroundSize: '200% 100%',
              animation: 'border-flow 3s linear infinite',
            }}
          >
            {/* 按钮光晕 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.15), transparent)',
              }}
            />
            <span className="relative z-10 text-dark-900">
              {animating ? "🔮 星盘转动中..." : "🎴 开始抽牌"}
            </span>
            {!animating && (
              <span className="relative z-10 text-dark-900/60 group-hover:translate-x-1 transition-transform">
                →
              </span>
            )}
          </button>
          {!cards.length && !animating && (
            <p className="text-xs text-white/20 mt-3">选择牌阵后，点击开始</p>
          )}
        </div>

        {/* ─── 卡牌展示 ─── */}
        {cards.length > 0 && (
          <div className="mb-10">
            <div ref={cardsRef} className="flex flex-wrap justify-center gap-5 md:gap-7">
              {cards.map((card, i) => {
                const positions = SpreadPositions[spreadIdx] || [];
                const pos = positions[i] || { zh: `位置 ${i + 1}`, en: `Position ${i + 1}` };
                return (
                  <div key={i} className="flex flex-col items-center">
                    {/* 位置名 */}
                    <div className="text-center mb-2">
                      <div className="text-[11px] text-gold font-medium tracking-wide">{pos.zh}</div>
                      <div className="text-[8px] text-white/20 tracking-wider">{pos.en}</div>
                    </div>
                    <FlippingCard
                      card={card}
                      flipped={flipped}
                      delay={i * 350}
                      index={i}
                      totalCards={cards.length}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── 解读区 ─── */}
        {interpretation && (
          <InterpretationCard interpretation={interpretation} onReset={handleReset} />
        )}

        {/* ─── 完整牌库 ─── */}
        <div className="mt-16">
          <button
            onClick={() => setShowAllCards(!showAllCards)}
            className="w-full text-center py-3 text-sm text-white/40 hover:text-gold transition-colors border-t border-white/5 flex items-center justify-center gap-1 group"
          >
            <span className="group-hover:tracking-wider transition-all duration-300">
              {showAllCards ? "收起牌库" : "完整牌库 · 78 张"}
            </span>
            <span className={`inline-block transition-transform duration-300 ${showAllCards ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showAllCards && (
            <div className="mt-4 animate-reveal-in">
              {/* 过滤器 */}
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                <button onClick={() => { setFilterType("all"); setFilterSuit("all"); }}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    filterType === "all" && filterSuit === "all"
                      ? 'btn-gold text-dark-900'
                      : 'bg-dark-700/50 border border-white/10 text-white/50 hover:border-gold/30'
                  }`}>
                  全部
                </button>
                <button onClick={() => { setFilterType("major"); setFilterSuit("all"); }}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    filterType === "major"
                      ? 'btn-gold text-dark-900'
                      : 'bg-dark-700/50 border border-white/10 text-white/50 hover:border-gold/30'
                  }`}>
                  大阿卡纳
                </button>
                {SUITS.map((s, i) => (
                  <button key={s} onClick={() => { setFilterSuit(s); setFilterType(""); }}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      filterSuit === s
                        ? 'btn-gold text-dark-900'
                        : 'bg-dark-700/50 border border-white/10 text-white/50 hover:border-gold/30'
                    }`}>
                    {SUIT_ICONS[i]} {s}
                  </button>
                ))}
              </div>

              {/* 牌库网格 */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {(filterType === "all" && filterSuit === "all" ? ALL_CARDS : filteredCards).map((card) => {
                  const ec = card.element === "火" ? "text-orange-400/30" :
                             card.element === "水" ? "text-blue-400/30" :
                             card.element === "风" ? "text-cyan-300/30" : "text-green-400/30";
                  return (
                    <div
                      key={card.id}
                      className="bg-dark-800/50 border border-white/5 rounded-xl p-2.5 text-center hover:border-gold/20 hover:bg-dark-800/80 transition-all duration-200 cursor-default group"
                    >
                      <div className={`text-lg mb-0.5 ${ec}`}>
                        {card.type === "major" ? "🃏" : card.suitIcon}
                      </div>
                      <div className="text-[10px] font-bold text-gold-light/80 leading-tight group-hover:text-gold-light transition-colors">
                        {card.name}
                      </div>
                      <div className="text-[7px] text-white/20 truncate mt-0.5">
                        {card.nameEn}
                      </div>
                      <div className={`text-[6px] ${ec} mt-1`}>{card.element}</div>
                    </div>
                  );
                })}
              </div>

              {/* 牌库统计 */}
              <div className="text-center mt-4 text-[10px] text-white/20">
                共 {ALL_CARDS.length} 张 · 大阿卡纳 22 张 · 小阿卡纳 40 张 · 宫廷牌 16 张
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}