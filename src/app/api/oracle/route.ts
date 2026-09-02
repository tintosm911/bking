import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { runOracle, OracleSession, OracleMessage } from "@/lib/oracle_engine";

/**
 * DB 优先 + 内存降级：
 * - 本机（better-sqlite3 可写文件）→ 用 SQLite 持久化会话记忆
 * - Vercel serverless（无持久磁盘/原生模块不可用）→ 自动降级为进程内内存存储
 * 保证玄机大师能在任意平台独立上线。
 */

// 内存降级存储（serverless 会话重启后短暂丢失，但排盘/解读完全正常）
const memSessions = new Map<string, OracleSession>();

/** 尝试获取 DB；失败返回 null（自动降级，不抛异常） */
function tryDb(): any {
  try {
    return getDb();
  } catch {
    return null;
  }
}

/** 生成或找回会话，返回会话数据 */
function loadSession(sessionId?: string, userId?: number): OracleSession {
  const db = tryDb();
  let id = sessionId || "";

  if (id) {
    // 内存降级：先从内存找
    const mem = memSessions.get(id);
    if (mem) {
      return { ...mem, messages: [...mem.messages], profile: { ...mem.profile } };
    }

    if (db) {
      try {
        const row = db.prepare("SELECT * FROM oracle_sessions WHERE id = ?").get(id) as any;
        if (row) {
          return {
            id: row.id,
            userId: row.user_id,
            messages: JSON.parse(row.messages || "[]"),
            profile: JSON.parse(row.profile || "{}"),
          };
        }
      } catch {
        /* DB 不可用 → 走内存 */
      }
    }
  }

  // 新建会话
  id = crypto.randomUUID();
  const created: OracleSession = { id, userId, messages: [], profile: {} };

  if (db) {
    try {
      db.prepare(
        "INSERT INTO oracle_sessions (id, user_id, profile, messages) VALUES (?, ?, ?, ?)"
      ).run(id, userId ?? null, JSON.stringify(created.profile), JSON.stringify(created.messages));
    } catch {
      /* 忽略，内存兜底 */
    }
  }
  memSessions.set(id, created);
  return created;
}

function saveSession(session: OracleSession) {
  // 始终更新内存副本（保证同进程内连续会话）
  memSessions.set(session.id, {
    ...session,
    messages: [...session.messages],
    profile: { ...session.profile },
  });

  const db = tryDb();
  if (db) {
    try {
      db.prepare(
        "UPDATE oracle_sessions SET profile = ?, messages = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(JSON.stringify(session.profile), JSON.stringify(session.messages), session.id);
    } catch {
      /* 忽略，内存兜底 */
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, sessionId } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "缺少询问内容" }, { status: 400 });
    }
    const text = query.trim();

    // 可选：从 auth 关联用户（暂不强制登录）
    const session = loadSession(sessionId as string);

    // 追加用户消息
    const msg: OracleMessage = { role: "user", content: text, ts: Date.now() };
    session.messages.push(msg);

    // 调用玄机大师引擎
    const reply = runOracle(text, session.profile);

    // 记住用户信息 + 追加大师回复
    session.profile = { ...session.profile, ...reply.profile };
    const replyMsg: OracleMessage = { role: "master", content: reply.message, ts: Date.now() };
    session.messages.push(replyMsg);

    // 只保留最近 50 条，防止无限膨胀
    if (session.messages.length > 50) {
      session.messages = session.messages.slice(-50);
    }

    saveSession(session);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      reply: reply.message,
      skill: reply.skill,
      mood: reply.mood,
      needBirthInfo: reply.needBirthInfo,
      detail: reply.detail ?? null,
      profile: session.profile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `玄机大师开悟失败: ${err.message || "未知错误"}` },
      { status: 500 }
    );
  }
}