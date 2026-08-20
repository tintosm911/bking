// BKing 数据库初始化 & 客户端
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "bking.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  // 确保 data 目录存在
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // 初始化 Schema
  const schemaPath = path.join(process.cwd(), "src", "lib", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);

  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}