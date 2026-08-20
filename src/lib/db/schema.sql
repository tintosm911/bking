-- BKing 数据库 Schema
-- SQLite

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  wallet_address TEXT,
  nickname TEXT,
  birthday TEXT,          -- YYYY-MM-DD
  birth_hour TEXT,        -- 时辰 HH:mm
  birth_place TEXT,       -- 出生地
  gender TEXT,            -- male / female
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT,
  is_active INTEGER DEFAULT 1,
  is_verified INTEGER DEFAULT 0
);

-- 订单表 (付费预测)
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_type TEXT NOT NULL,  -- bazi / tarot / qimen / zwei / wishing
  amount TEXT NOT NULL,        -- 金额, 字符串保留精度
  currency TEXT DEFAULT 'USDT',
  tx_hash TEXT,                -- 链上交易哈希
  status TEXT DEFAULT 'pending', -- pending / paid / completed / refunded
  created_at TEXT DEFAULT (datetime('now')),
  paid_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 报告表 (生成的 PDF 记录)
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_id INTEGER,
  service_type TEXT NOT NULL,
  title TEXT,
  pdf_path TEXT,             -- PDF 文件路径
  pdf_size INTEGER,          -- 字节数
  emailed_at TEXT,           -- 发送时间
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 占卜记录表
CREATE TABLE IF NOT EXISTS readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_type TEXT NOT NULL,  -- bazi / tarot / qimen / zwei
  input_data TEXT,             -- JSON: 用户输入 (生日/问题等)
  result_data TEXT,            -- JSON: 占卜结果
  order_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 生日礼物/祝福记录
CREATE TABLE IF NOT EXISTS birthday_gifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  gift_type TEXT DEFAULT 'greeting',  -- greeting / coupon / free_reading / physical
  gift_data TEXT,                     -- JSON: 优惠码/免费额度等
  sent_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 许愿记录 (扩展 wishing-well 持久化)
CREATE TABLE IF NOT EXISTS wishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  wallet_address TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'open',    -- open / funding / fulfilled / expired
  goal_amount TEXT,              -- 目标金额
  raised_amount TEXT DEFAULT '0', -- 已筹集
  supporter_count INTEGER DEFAULT 0,
  tx_hash TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  fulfilled_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 助力记录
CREATE TABLE IF NOT EXISTS wish_supports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wish_id INTEGER NOT NULL,
  user_id INTEGER,
  wallet_address TEXT,
  amount TEXT NOT NULL,
  message TEXT,
  tx_hash TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (wish_id) REFERENCES wishes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 站点统计 (缓存)
CREATE TABLE IF NOT EXISTS site_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_key TEXT UNIQUE NOT NULL,
  stat_value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_birthday ON users(birthday);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_readings_user ON readings(user_id);
CREATE INDEX IF NOT EXISTS idx_readings_service ON readings(service_type);
CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes(status);
CREATE INDEX IF NOT EXISTS idx_birthday_gifts_year ON birthday_gifts(year);