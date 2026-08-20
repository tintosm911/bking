// 订单 & 报告 & 占卜记录
import { getDb } from "./index";

// ─── 订单 ───
export interface Order {
  id: number;
  user_id: number;
  service_type: string;
  amount: string;
  currency: string;
  tx_hash: string | null;
  status: string;
  created_at: string;
  paid_at: string | null;
}

export function createOrder(params: {
  user_id: number;
  service_type: string;
  amount: string;
  currency?: string;
  tx_hash?: string;
}): Order {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO orders (user_id, service_type, amount, currency, tx_hash)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    params.user_id,
    params.service_type,
    params.amount,
    params.currency || "USDT",
    params.tx_hash || null,
  );
  return getOrderById(result.lastInsertRowid as number)!;
}

export function getOrderById(id: number): Order | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order | undefined;
}

export function getOrdersByUser(userId: number) {
  const db = getDb();
  return db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(userId) as Order[];
}

export function updateOrderStatus(id: number, status: string, tx_hash?: string) {
  const db = getDb();
  const paidAt = status === "paid" ? ", paid_at = datetime('now')" : "";
  const tx = tx_hash ? ", tx_hash = ?" : "";
  const values: any[] = [status];
  if (tx_hash) values.push(tx_hash);
  values.push(id);
  db.prepare(`UPDATE orders SET status = ?${paidAt}${tx} WHERE id = ?`).run(...values);
}

// ─── 报告 (PDF) ───
export interface Report {
  id: number;
  user_id: number;
  order_id: number | null;
  service_type: string;
  title: string | null;
  pdf_path: string | null;
  pdf_size: number | null;
  emailed_at: string | null;
  created_at: string;
}

export function createReport(params: {
  user_id: number;
  order_id?: number;
  service_type: string;
  title?: string;
  pdf_path?: string;
  pdf_size?: number;
}): Report {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO reports (user_id, order_id, service_type, title, pdf_path, pdf_size)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    params.user_id,
    params.order_id || null,
    params.service_type,
    params.title || null,
    params.pdf_path || null,
    params.pdf_size || null,
  );
  return getReportById(result.lastInsertRowid as number)!;
}

export function getReportById(id: number): Report | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM reports WHERE id = ?").get(id) as Report | undefined;
}

export function getReportsByUser(userId: number) {
  const db = getDb();
  return db.prepare("SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC").all(userId) as Report[];
}

export function markReportEmailed(id: number) {
  const db = getDb();
  db.prepare("UPDATE reports SET emailed_at = datetime('now') WHERE id = ?").run(id);
}

// ─── 占卜记录 ───
export function saveReading(params: {
  user_id: number;
  service_type: string;
  input_data: string;
  result_data: string;
  order_id?: number;
}) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO readings (user_id, service_type, input_data, result_data, order_id)
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(
    params.user_id,
    params.service_type,
    params.input_data,
    params.result_data,
    params.order_id || null,
  );
}

export function getReadingsByUser(userId: number) {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM readings WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
  ).all(userId);
}