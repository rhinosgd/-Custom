const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { q } = require('../db');
const { COOKIE, login, requireAuth } = require('../auth');

const MEDIA_DIR = path.join(__dirname, '..', '..', 'public', 'assets', 'media');

function parseJSON(v, fb) { try { return JSON.parse(v); } catch { return fb; } }
function linesToArr(s) { return (s || '').split('\n').map(x => x.trim()).filter(Boolean); }

// ---------- 登录 ----------
router.get('/login', (req, res) => res.render('admin/login', { err: null }));
router.post('/login', (req, res) => {
  const token = login(req.body.username, req.body.password);
  if (!token) return res.render('admin/login', { err: '用户名或密码错误' });
  res.cookie(COOKIE, token, { httpOnly: true, maxAge: 7 * 24 * 3600 * 1000 });
  res.redirect('/admin');
});
router.get('/logout', (req, res) => { res.clearCookie(COOKIE); res.redirect('/admin/login'); });

// ---------- 鉴权中间件（登录页除外） ----------
router.use(requireAuth);
router.use((req, res, next) => { res.locals.admin = req.admin; next(); });

// ---------- 仪表盘 ----------
router.get('/', (req, res) => {
  const counts = {
    products: q.get("SELECT COUNT(*) c FROM products WHERE status='active'").c,
    categories: q.get("SELECT COUNT(*) c FROM categories").c,
    pages: q.get("SELECT COUNT(*) c FROM pages").c,
    inquiries: q.get("SELECT COUNT(*) c FROM inquiries WHERE status='new'").c,
    media: q.get('SELECT COUNT(*) c FROM media').c,
  };
  res.render('admin/dashboard', { admin: req.admin, counts });
});

// ---------- 产品 CRUD ----------
router.get('/products', (req, res) => {
  const products = q.all('SELECT p.*, c.name cat_name FROM products p LEFT JOIN categories c ON p.category_id=c.id ORDER BY p.sort_order');
  res.render('admin/products', { products });
});
router.get('/products/new', (req, res) => {
  const categories = q.all('SELECT * FROM categories ORDER BY sort_order');
  res.render('admin/product-form', { p: null, categories });
});
router.post('/products/new', (req, res) => {
  const b = req.body;
  const id = q.insert(`INSERT INTO products (slug, category_id, name, subtitle, description, price, compare_at_price, currency, badge, images, options, custom_note, featured, status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [b.slug, b.category_id || null, b.name, b.subtitle, b.description, parseFloat(b.price) || 0, parseFloat(b.compare_at_price) || null, b.currency || 'USD', b.badge || '',
     JSON.stringify(linesToArr(b.images)), b.options || '[]', b.custom_note || '', b.featured ? 1 : 0, b.status || 'active']);
  res.redirect('/admin/products');
});
router.get('/products/:id/edit', (req, res) => {
  const p = q.get('SELECT * FROM products WHERE id=?', [req.params.id]);
  if (!p) return res.redirect('/admin/products');
  p.images = parseJSON(p.images, []).join('\n');
  const categories = q.all('SELECT * FROM categories ORDER BY sort_order');
  res.render('admin/product-form', { p, categories });
});
router.post('/products/:id', (req, res) => {
  const b = req.body;
  q.run(`UPDATE products SET slug=?, category_id=?, name=?, subtitle=?, description=?, price=?, compare_at_price=?, currency=?, badge=?, images=?, options=?, custom_note=?, featured=?, status=?
    WHERE id=?`,
    [b.slug, b.category_id || null, b.name, b.subtitle, b.description, parseFloat(b.price) || 0, parseFloat(b.compare_at_price) || null, b.currency || 'USD', b.badge || '',
     JSON.stringify(linesToArr(b.images)), b.options || '[]', b.custom_note || '', b.featured ? 1 : 0, b.status || 'active', req.params.id]);
  res.redirect('/admin/products');
});
router.post('/products/:id/delete', (req, res) => {
  q.run('DELETE FROM products WHERE id=?', [req.params.id]);
  res.redirect('/admin/products');
});

// ---------- 分类 CRUD ----------
router.get('/categories', (req, res) => {
  const categories = q.all('SELECT * FROM categories ORDER BY sort_order');
  res.render('admin/categories', { categories });
});
router.post('/categories', (req, res) => {
  const b = req.body;
  if (b.id) q.run('UPDATE categories SET slug=?, name=?, description=?, sort_order=? WHERE id=?', [b.slug, b.name, b.description, parseInt(b.sort_order) || 0, b.id]);
  else q.insert('INSERT INTO categories (slug, name, description, sort_order) VALUES (?,?,?,?)', [b.slug, b.name, b.description, parseInt(b.sort_order) || 0]);
  res.redirect('/admin/categories');
});
router.post('/categories/:id/delete', (req, res) => {
  q.run('DELETE FROM categories WHERE id=?', [req.params.id]);
  res.redirect('/admin/categories');
});

// ---------- 单页 / 博客 CRUD ----------
router.get('/pages', (req, res) => {
  const pages = q.all("SELECT * FROM pages ORDER BY created_at DESC");
  res.render('admin/pages', { pages });
});
router.get('/pages/new', (req, res) => res.render('admin/page-form', { p: null }));
router.post('/pages/new', (req, res) => {
  const b = req.body;
  q.insert('INSERT INTO pages (slug, title, type, excerpt, body, cover, status) VALUES (?,?,?,?,?,?,?)',
    [b.slug, b.title, b.type || 'static', b.excerpt, b.body, b.cover || '', b.status || 'published']);
  res.redirect('/admin/pages');
});
router.get('/pages/:id/edit', (req, res) => {
  const p = q.get('SELECT * FROM pages WHERE id=?', [req.params.id]);
  if (!p) return res.redirect('/admin/pages');
  res.render('admin/page-form', { p });
});
router.post('/pages/:id', (req, res) => {
  const b = req.body;
  q.run('UPDATE pages SET slug=?, title=?, type=?, excerpt=?, body=?, cover=?, status=? WHERE id=?',
    [b.slug, b.title, b.type || 'static', b.excerpt, b.body, b.cover || '', b.status || 'published', req.params.id]);
  res.redirect('/admin/pages');
});
router.post('/pages/:id/delete', (req, res) => {
  q.run('DELETE FROM pages WHERE id=?', [req.params.id]);
  res.redirect('/admin/pages');
});

// ---------- 首页区块编辑 ----------
router.get('/sections', (req, res) => {
  const sections = q.all('SELECT * FROM home_sections ORDER BY sort_order');
  res.render('admin/sections', { sections });
});
router.get('/sections/:key/edit', (req, res) => {
  const s = q.get('SELECT * FROM home_sections WHERE section_key=?', [req.params.key]);
  if (!s) return res.redirect('/admin/sections');
  s.data = parseJSON(s.data, {});
  res.render('admin/section-form', { s });
});
router.post('/sections/:key', (req, res) => {
  const b = req.body;
  q.run('UPDATE home_sections SET title=?, subtitle=?, status=?, data=? WHERE section_key=?',
    [b.title, b.subtitle, b.status || 'active', b.data || '{}', req.params.key]);
  res.redirect('/admin/sections');
});

// ---------- 站点设置 ----------
router.get('/settings', (req, res) => {
  const rows = q.all('SELECT key, value FROM settings');
  const settings = {}; for (const r of rows) settings[r.key] = r.value;
  res.render('admin/settings', { settings });
});
router.post('/settings', (req, res) => {
  for (const [k, v] of Object.entries(req.body)) {
    if (k === '_csrf') continue;
    q.run('INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [k, v]);
  }
  res.redirect('/admin/settings');
});

// ---------- 媒体库 ----------
router.get('/media', (req, res) => {
  const media = q.all('SELECT * FROM media ORDER BY created_at DESC');
  const files = fs.readdirSync(MEDIA_DIR).filter(f => !f.startsWith('.'));
  res.render('admin/media', { media, files });
});
router.post('/media/add', (req, res) => {
  const b = req.body;
  if (b.url) q.insert('INSERT INTO media (type, url, thumb, alt, source) VALUES (?,?,?,?,?)',
    [b.type || 'image', b.url, b.thumb || '', b.alt || '', b.source || 'url']);
  res.redirect('/admin/media');
});
// 本地文件上传（raw body）
router.post('/media/upload', express.raw({ type: '*/*', limit: '25mb' }), (req, res) => {
  const name = req.query.name || `upload-${Date.now()}`;
  if (!req.body || !req.body.length) return res.status(400).json({ ok: false });
  const ext = path.extname(name) || '';
  const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  fs.writeFileSync(path.join(MEDIA_DIR, safe), req.body);
  const url = `/assets/media/${safe}`;
  q.insert('INSERT INTO media (type, url, alt, source) VALUES (?,?,?,?)',
    [/\.(mp4|webm|mov)$/i.test(safe) ? 'video' : 'image', url, name, 'upload']);
  res.json({ ok: true, url });
});

// ---------- 询价 ----------
router.get('/inquiries', (req, res) => {
  const inquiries = q.all(`SELECT i.*, p.name product_name FROM inquiries i LEFT JOIN products p ON i.product_id=p.id ORDER BY i.created_at DESC`);
  res.render('admin/inquiries', { inquiries });
});
router.post('/inquiries/:id/status', (req, res) => {
  q.run('UPDATE inquiries SET status=? WHERE id=?', [req.body.status, req.params.id]);
  res.redirect('/admin/inquiries');
});

module.exports = router;
