const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'site.db');
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// 初始化表结构
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// ---------- 密码工具（无第三方依赖） ----------
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(pw, salt, 32).toString('hex');
  return `scrypt$${salt}$${derived}`;
}
function verifyPassword(pw, stored) {
  try {
    const [scheme, salt, derived] = stored.split('$');
    if (scheme !== 'scrypt') return false;
    return crypto.scryptSync(pw, salt, 32).toString('hex') === derived;
  } catch { return false; }
}

// ---------- 简易查询助手 ----------
const q = {
  all: (sql, params = []) => db.prepare(sql).all(...params),
  get: (sql, params = []) => db.prepare(sql).get(...params),
  run: (sql, params = []) => db.prepare(sql).run(...params),
  insert: (sql, params = []) => { const r = db.prepare(sql).run(...params); return r.lastInsertRowid; },
};

// ---------- 首次启动灌入示例数据 ----------
const cnt = db.prepare('SELECT COUNT(*) c FROM products').get().c;
if (cnt === 0) {
  require('./seed')({ q, hashPassword });
}

module.exports = { db, q, hashPassword, verifyPassword };
