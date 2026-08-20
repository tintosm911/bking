// 生日检查 + 祝福发送 + 礼物赠送
// 由 cron job 每天 08:00 调用

import { getBirthdayUsers } from "@/lib/db/users";
import { sendBirthdayGreeting } from "@/lib/mail";
import { getDb } from "@/lib/db";

// 简单的优惠码生成
function generateCoupon(userId: number): { code: string; discount: string } {
  const code = `BDAY${userId}${Date.now().toString(36).toUpperCase()}`;
  return { code, discount: "免费一次占卜" };
}

export async function checkBirthdays() {
  const now = new Date();
  const month = now.getMonth() + 1;  // JS 月份 0-based
  const day = now.getDate();

  const users = getBirthdayUsers(month, day);

  const results: { userId: number; sent: boolean; gift?: string }[] = [];

  for (const user of users) {
    const coupon = generateCoupon(user.id);

    // 记录礼物
    const db = getDb();
    const existing = db.prepare(
      "SELECT id FROM birthday_gifts WHERE user_id = ? AND year = ?"
    ).get(user.id, now.getFullYear());

    if (existing) {
      results.push({ userId: user.id, sent: false });
      continue;  // 今年已送过
    }

    const sent = await sendBirthdayGreeting({
      to: user.email,
      nickname: user.nickname || undefined,
      giftInfo: `🎟️ ${coupon.code} — ${coupon.discount}`,
    });

    if (sent) {
      db.prepare(
        "INSERT INTO birthday_gifts (user_id, year, gift_type, gift_data, sent_at) VALUES (?, ?, ?, ?, datetime('now'))"
      ).run(user.id, now.getFullYear(), "coupon", JSON.stringify(coupon));
    }

    results.push({ userId: user.id, sent, gift: coupon.code });
  }

  return {
    date: `${month}/${day}`,
    totalUsers: users.length,
    sentResults: results,
  };
}