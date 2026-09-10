import { NextRequest, NextResponse } from "next/server";

// ─── 内存存储（临时，后续替换为数据库） ───
interface WishRecord {
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
  walletAddress?: string;
  txHash?: string;
}

const wishes: WishRecord[] = [];

// ─── 工具函数 ───
function generateId(): string {
  return `ww-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateExpiry(days: number = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── 分类映射 ───
const validCategories = ["wealth", "love", "career", "health", "study", "family", "spiritual", "other"];

// ─── POST: 创建愿望 ───
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, category, title, content, amount, walletAddress, wishId } = body;

    switch (action) {
      case "create": {
        // 验证
        if (!category || !validCategories.includes(category)) {
          return NextResponse.json({ success: false, error: "无效的愿望类别" }, { status: 400 });
        }
        if (!title || title.length < 2 || title.length > 50) {
          return NextResponse.json({ success: false, error: "标题需在 2-50 字之间" }, { status: 400 });
        }
        if (!content || content.length < 4 || content.length > 500) {
          return NextResponse.json({ success: false, error: "内容需在 4-500 字之间" }, { status: 400 });
        }
        if (!amount || isNaN(Number(amount)) || Number(amount) < 1) {
          return NextResponse.json({ success: false, error: "祈愿金额至少 1 USDT" }, { status: 400 });
        }

        const wish: WishRecord = {
          id: generateId(),
          category,
          title,
          content,
          amount: `${amount} USDT`,
          contributorCount: 0,
          progress: 0,
          status: "open",
          createdAt: new Date().toISOString().slice(0, 10),
          expiresAt: generateExpiry(),
          walletAddress: walletAddress || undefined,
        };

        wishes.push(wish);

        return NextResponse.json({
          success: true,
          wishId: wish.id,
          message: "愿望已提交，等待支付确认",
        });
      }

      case "fulfill": {
        // 标记已实现
        const wishToFulfill = wishes.find((w) => w.id === wishId);
        if (!wishToFulfill) {
          return NextResponse.json({ success: false, error: "愿望不存在" }, { status: 404 });
        }
        wishToFulfill.status = "fulfilled";
        wishToFulfill.progress = 100;
        return NextResponse.json({ success: true, message: "愿望已标记为实现" });
      }

      case "contribute": {
        // 助力愿望
        const wishToContribute = wishes.find((w) => w.id === wishId);
        if (!wishToContribute) {
          return NextResponse.json({ success: false, error: "愿望不存在" }, { status: 404 });
        }
        wishToContribute.contributorCount += 1;
        const targetAmount = Number(wishToContribute.amount.replace(" USDT", ""));
        // 简化处理：每次助力增加进度
        const contributionAmount = Number(body.contributionAmount) || 1;
        const currentAmount = (wishToContribute.progress / 100) * targetAmount;
        const newAmount = Math.min(currentAmount + contributionAmount, targetAmount);
        wishToContribute.progress = Math.round((newAmount / targetAmount) * 100);
        if (wishToContribute.progress >= 100) {
          wishToContribute.status = "fulfilled";
        } else if (wishToContribute.progress > 0) {
          wishToContribute.status = "funding";
        }
        return NextResponse.json({ success: true, progress: wishToContribute.progress });
      }

      default:
        return NextResponse.json({ success: false, error: "未知操作" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: `服务器错误: ${err.message}` },
      { status: 500 }
    );
  }
}

// ─── GET: 获取愿望列表 ───
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const id = searchParams.get("id");

  // 单个愿望
  if (id) {
    const wish = wishes.find((w) => w.id === id);
    if (!wish) {
      return NextResponse.json({ success: false, error: "愿望不存在" }, { status: 404 });
    }
    return NextResponse.json({ success: true, wish });
  }

  // 列表（带过滤）
  let filtered = [...wishes];

  if (category && validCategories.includes(category)) {
    filtered = filtered.filter((w) => w.category === category);
  }
  if (status && ["open", "funding", "fulfilled", "expired"].includes(status)) {
    filtered = filtered.filter((w) => w.status === status);
  }

  // 默认按时间倒序
  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({
    success: true,
    count: filtered.length,
    wishes: filtered,
  });
}