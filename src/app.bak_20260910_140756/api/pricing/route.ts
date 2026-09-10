import { NextRequest, NextResponse } from "next/server";
import { PLANS, SUBSCRIPTION, CURRENCIES } from "@/lib/pricing";

export const runtime = "nodejs";

/** GET /api/pricing — 前端拉取套餐定价配置 */
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    plans: PLANS,
    subscription: SUBSCRIPTION,
    currencies: CURRENCIES,
    note: "币种按 1:1 等同金额（USD = USDT = USDC）",
  });
}