// 用户注册 / 登录 / 查询
import { getDb } from "./index";

interface DbUser {
  id: number;
  email: string;
  password_hash: string;
  wallet_address: string | null;
  nickname: string | null;
  birthday: string | null;
  birth_hour: string | null;
  birth_place: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  is_active: number;
  is_verified: number;
}

export type SafeUser = Omit<DbUser, "password_hash">;

export function createUser(params: {
  email: string;
  passwordHash: string;
  wallet_address?: string;
  nickname?: string;
  birthday?: string;
  birth_hour?: string;
  birth_place?: string;
  gender?: string;
}): SafeUser {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO users (email, password_hash, wallet_address, nickname, birthday, birth_hour, birth_place, gender)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    params.email,
    params.passwordHash,
    params.wallet_address || null,
    params.nickname || null,
    params.birthday || null,
    params.birth_hour || null,
    params.birth_place || null,
    params.gender || null,
  );
  return getUserById(result.lastInsertRowid as number)!;
}

export function getUserByEmail(email: string): DbUser | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as DbUser | undefined;
}

export function getUserById(id: number): SafeUser | undefined {
  const db = getDb();
  return db.prepare("SELECT id, email, wallet_address, nickname, birthday, birth_hour, birth_place, gender, created_at, updated_at, last_login_at, is_active, is_verified FROM users WHERE id = ?").get(id) as SafeUser | undefined;
}

export function getUserByWallet(wallet: string): SafeUser | undefined {
  const db = getDb();
  return db.prepare("SELECT id, email, wallet_address, nickname, birthday, birth_hour, birth_place, gender, created_at, updated_at, last_login_at, is_active, is_verified FROM users WHERE wallet_address = ?").get(wallet) as SafeUser | undefined;
}

export function updateUser(id: number, params: Partial<{
  nickname: string;
  birthday: string;
  birth_hour: string;
  birth_place: string;
  gender: string;
  wallet_address: string;
  is_verified: number;
  is_active: number;
  last_login_at: string;
}>): SafeUser | undefined {
  const db = getDb();
  const keys = Object.keys(params);
  if (keys.length === 0) return getUserById(id);

  const sets = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => (params as any)[k]);

  db.prepare(`UPDATE users SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  return getUserById(id);
}

export function getAllUsers(page = 1, pageSize = 20) {
  const db = getDb();
  const offset = (page - 1) * pageSize;
  const rows = db.prepare("SELECT id, email, wallet_address, nickname, birthday, created_at, is_active, is_verified FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?").all(pageSize, offset) as SafeUser[];
  const total = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count;
  return { rows, total, page, pageSize };
}

export function getUserStats() {
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count;
  const verified = (db.prepare("SELECT COUNT(*) as count FROM users WHERE is_verified = 1").get() as any).count;
  const withWallet = (db.prepare("SELECT COUNT(*) as count FROM users WHERE wallet_address IS NOT NULL").get() as any).count;
  const todayNew = (db.prepare("SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')").get() as any).count;
  return { total, verified, withWallet, todayNew };
}

export function getBirthdayUsers(month: number, day: number) {
  const db = getDb();
  const monthStr = String(month).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  return db.prepare(
    "SELECT id, email, nickname FROM users WHERE birthday LIKE ? AND is_active = 1"
  ).all(`${monthStr}-${dayStr}%`) as { id: number; email: string; nickname: string | null }[];
}