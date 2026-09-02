// BKing 套餐定价配置 — 2026-08-28 妮可确认（五档 + 订阅）
// 币种: 美金 / USDT / USDC 按 1:1 等同金额

export interface Plan {
  id: string;
  name: string;
  nameEn: string;
  priceUsd: number;        // 对应 USDT/USDC 等同金额
  priceText: string;       // 展示文本
  services: string[];      // 包含的玄学服务
  badge?: string;
  highlight?: boolean;
}

// 单测套餐（阶梯 1 → 4.9 → 9.9 → 14.9，每档约翻倍，转化漏斗）
export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "入门单测",
    nameEn: "Starter",
    priceUsd: 1,
    priceText: "$1",
    services: ["八字排盘", "星座分析"],
    badge: "引流款",
  },
  {
    id: "mid",
    name: "进阶测算",
    nameEn: "Advanced",
    priceUsd: 4.9,
    priceText: "$4.9",
    services: ["八字排盘", "紫微斗数", "星座分析"],
  },
  {
    id: "pro",
    name: "专业全测",
    nameEn: "Pro",
    priceUsd: 9.9,
    priceText: "$9.9",
    services: ["紫微斗数", "奇门遁甲", "星座分析", "塔罗占卜"],
    badge: "主力",
    highlight: true,
  },
  {
    id: "deluxe",
    name: "至尊全套",
    nameEn: "Deluxe",
    priceUsd: 14.9,
    priceText: "$14.9",
    services: ["八字排盘", "紫微斗数", "奇门遁甲", "天机命理", "星座分析", "塔罗占卜", "起名"],
    badge: "全套",
  },
];

// 订阅制（年付比月付省 $9，营销主推年付）
export const SUBSCRIPTION = {
  monthly: {
    priceUsd: 4.9,
    priceText: "$4.9/月",
  },
  yearly: {
    priceUsd: 49.9,
    priceText: "$49.9/年",
    saveUsd: -9,        // 相比月付年计省 9 刀
    recommend: true,
  },
  services: ["当月/当年运程", "塔罗占卜", "星座分析", "随时可测"],
};

// 支持的支付币种（等同 1:1）
export const CURRENCIES = ["USDT", "USDC", "USDG"] as const;

export type Currency = (typeof CURRENCIES)[number];