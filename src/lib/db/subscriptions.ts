// 会员订阅数据层 — 年付 $49.9 / 月付 $4.9
// 订阅期内可随时测 当期运程 + 塔罗 + 星座
import { getDb } from "./index";

export interface Subscription {
  id: number;
  user_id: number;
  plan: string;               // monthly / yearly
  status: string;             // active / expired / cancelled
  started_at: string;
  expires_at: string;
  last_order_id: number | null;
  cancelled_at: string | null;
  created_at: string;
}

/** 创建订阅，按 plan 计算到期时间 */
export function createSubscription(params: {
  user_id: number;
  plan: "monthly" | "yearly";
  order_id?: number;
}): Subscription {
  const db = getDb();
  const months = params.plan === "yearly" ? 12 : 1;
  const stmt = db.prepare(`
    INSERT INTO subscriptions (user_id, plan, status, expires_at, last_order_id)
    VALUES (?, ?, 'active', datetime('now', '+' || ? || ' months'), ?)
  `);
  const result = stmt.run(
    params.user_id,
    params.plan,
    months,
    params.order_id || null,
  );
  return getSubscriptionById(result.lastInsertRowid as number)!;
}

export function getSubscriptionById(id: number): Subscription | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM subscriptions WHERE id = ?").get(id) as Subscription | undefined;
}

/** 查询用户当前有效订阅（未过期且 active） */
export function getActiveSubscription(userId: number): Subscription | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM subscriptions
    WHERE user_id = ? AND status = 'active' AND datetime(expires_at) > datetime('now')
    ORDER BY id DESC LIMIT 1
  `).get(userId) as Subscription | undefined;
}

/** 订阅到期标记（cron 可调用，将所有已过期的活动订阅标为 expired） */
export function expireSubscriptions(): number {
  const db = getDb();
  const result = db.prepare(`
    UPDATE subscriptions SET status = 'expired'
    WHERE status = 'active' AND datetime(expires_at) <= datetime('now')
  `).run();
  return result.changes;
}

export function cancelSubscription(id: number) {
  const db = getDb();
  db.prepare(`
    UPDATE subscriptions SET status = 'cancelled', cancelled_at = datetime('now')
    WHERE id = ?
  `).run(id);
}

export function getSubscriptionsByUser(userId: number) {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC"
  ).all(userId) as Subscription[];
}