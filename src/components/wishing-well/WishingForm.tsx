"use client";

import { useState } from "react";

const categories = [
  { id: "wealth", name: "财运", icon: "💰" },
  { id: "love", name: "姻缘", icon: "💕" },
  { id: "career", name: "事业", icon: "💼" },
  { id: "health", name: "健康", icon: "🏥" },
  { id: "study", name: "学业", icon: "📚" },
  { id: "family", name: "家庭", icon: "👨‍👩‍👧‍👧" },
  { id: "spiritual", name: "灵性", icon: "🕯️" },
  { id: "other", name: "其他", icon: "✨" },
];

const amounts = [
  { value: "10", label: "10 USDT", desc: "基础祈愿" },
  { value: "50", label: "50 USDT", desc: "诚心祈愿" },
  { value: "100", label: "100 USDT", desc: "大愿祈福" },
  { value: "500", label: "500 USDT", desc: "宏大心愿" },
];

export default function WishingForm() {
  const [step, setStep] = useState<"form" | "preview" | "pay">("form");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string>("");

  const finalAmount = amount === "custom" ? customAmount : amount;

  const handleSubmit = async () => {
    if (!category || !title || !content || !finalAmount) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/wishing-well", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title,
          content,
          amount: finalAmount,
          action: "create",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.wishId || "愿望已提交");
        setStep("pay");
      } else {
        setResult(data.error || "提交失败");
      }
    } catch (e: any) {
      setResult(e.message || "网络错误");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "pay") {
    return (
      <div className="rounded-3xl p-8 md:p-12 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] text-center">
        <div className="text-5xl mb-4">✨</div>
        <h3 className="text-2xl font-serif font-bold text-gold mb-2">愿望已提交</h3>
        <p className="text-sm text-white/50 mb-4">
          连接钱包支付 {finalAmount} USDT 即可开启许愿池助力
        </p>
        <p className="text-[10px] text-white/20 mb-6">愿望 ID: {result}</p>
        <button className="btn-gold px-8 py-3.5 rounded-xl text-base font-semibold inline-flex items-center gap-2">
          🔗 连接 OKX 钱包支付
        </button>
        <div className="mt-6 text-xs text-white/25">
          <p>支持：USDT / USDC / USDG</p>
          <p className="mt-1">支付后愿望将展示在许愿池中，等待有缘人助力</p>
        </div>
      </div>
    );
  }

  if (step === "preview") {
    return (
      <div className="rounded-3xl p-8 md:p-12 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06]">
        <h3 className="text-xl font-serif font-bold text-gold mb-4 text-center">预览你的愿望</h3>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] rounded-xl">
            <span className="text-lg">{categories.find(c => c.id === category)?.icon}</span>
            <div>
              <p className="text-xs text-white/30">分类</p>
              <p className="text-sm text-white/70">{categories.find(c => c.id === category)?.name}</p>
            </div>
          </div>
          <div className="px-4 py-3 bg-white/[0.03] rounded-xl">
            <p className="text-xs text-white/30">标题</p>
            <p className="text-sm text-white/70">{title}</p>
          </div>
          <div className="px-4 py-3 bg-white/[0.03] rounded-xl">
            <p className="text-xs text-white/30">内容</p>
            <p className="text-sm text-white/70 leading-relaxed">{content}</p>
          </div>
          <div className="px-4 py-3 bg-white/[0.03] rounded-xl">
            <p className="text-xs text-white/30">祈愿金额</p>
            <p className="text-sm text-gold">{finalAmount} USDT</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setStep("form")}
            className="flex-1 px-6 py-3 rounded-xl text-sm border border-white/10 text-white/60 hover:border-white/20 transition-all"
          >
            返回修改
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 btn-gold px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "提交中..." : "确认提交"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-8 md:p-12 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06]">
      <h3 className="text-xl font-serif font-bold text-gold mb-2">写下你的愿望</h3>
      <p className="text-sm text-white/40 mb-6">选择类别、写下心愿、设定祈愿金额</p>

      {/* Category selector */}
      <div className="mb-6">
        <p className="text-xs text-white/30 mb-3 uppercase tracking-wider">愿望类别</p>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                category === cat.id
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="text-[10px]">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">愿望标题</p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="用一句话概括你的心愿..."
          maxLength={50}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white/70 text-sm placeholder:text-white/15 focus:outline-none focus:border-gold/30 transition-all"
        />
        <p className="text-[10px] text-white/15 mt-1 text-right">{title.length}/50</p>
      </div>

      {/* Content */}
      <div className="mb-6">
        <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">愿望详情</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="详细描述你的心愿..."
          rows={4}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white/70 text-sm placeholder:text-white/15 focus:outline-none focus:border-gold/30 transition-all resize-none"
        />
        <p className="text-[10px] text-white/15 mt-1 text-right">{content.length}/500</p>
      </div>

      {/* Amount */}
      <div className="mb-8">
        <p className="text-xs text-white/30 mb-3 uppercase tracking-wider">祈愿金额 (USDT)</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {amounts.map((a) => (
            <button
              key={a.value}
              onClick={() => setAmount(a.value)}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                amount === a.value
                  ? "border-gold bg-gold/10"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <span className={`text-sm font-semibold ${
                amount === a.value ? "text-gold" : "text-white/60"
              }`}>{a.label}</span>
              <span className="text-[10px] text-white/30">{a.desc}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setAmount("custom")}
          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all ${
            amount === "custom"
              ? "border-gold bg-gold/10"
              : "border-white/10 hover:border-white/20"
          }`}
        >
          <span className={`text-sm ${amount === "custom" ? "text-gold" : "text-white/40"}`}>
            自定义金额
          </span>
          {amount === "custom" && (
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="输入 USDT 数量"
              min="1"
              className="w-32 px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/70 text-sm text-right placeholder:text-white/15 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={() => setStep("preview")}
        disabled={!category || !title || !content || !finalAmount}
        className="w-full btn-gold px-8 py-3.5 rounded-xl text-base font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        预览愿望 ✨
      </button>
    </div>
  );
}