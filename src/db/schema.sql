-- WhimsiPaw CMS — SQLite schema (WP 式：模板 + 数据库 + 自定义轻量后台)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  image       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'active'   -- active | hidden
);

CREATE TABLE IF NOT EXISTS products (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL UNIQUE,
  category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  subtitle        TEXT,
  description     TEXT,
  price           REAL NOT NULL DEFAULT 0,
  compare_at_price REAL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  badge           TEXT,                           -- new | sale | bestseller | ''
  images          TEXT NOT NULL DEFAULT '[]',     -- JSON array of urls
  options         TEXT NOT NULL DEFAULT '[]',     -- JSON: [{name:'Size',values:[...]},{name:'Color',values:[...]}]
  custom_note     TEXT,                           -- made-to-measure hint
  featured        INTEGER NOT NULL DEFAULT 0,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active'  -- active | draft
);

CREATE TABLE IF NOT EXISTS pages (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  slug      TEXT NOT NULL UNIQUE,
  title     TEXT NOT NULL,
  type      TEXT NOT NULL DEFAULT 'static',       -- about | blog | static
  excerpt   TEXT,
  cover     TEXT,
  body      TEXT,                                  -- HTML
  status    TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS home_sections (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  section_key TEXT NOT NULL UNIQUE,                -- hero | product_grid | creators | pain_points | milestones | reviews | blog | newsletter
  title      TEXT,
  subtitle   TEXT,
  type       TEXT NOT NULL,                        -- hero | product_grid | creators | pain_points | milestones | reviews | blog | newsletter
  data       TEXT NOT NULL DEFAULT '{}',           -- JSON, section-specific
  sort_order INTEGER NOT NULL DEFAULT 0,
  status     TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS media (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT NOT NULL,                        -- image | video
  url        TEXT NOT NULL,
  thumb      TEXT,
  alt        TEXT,
  source     TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT,
  email      TEXT,
  phone      TEXT,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  message    TEXT,
  status     TEXT NOT NULL DEFAULT 'new',          -- new | contacted | done
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
