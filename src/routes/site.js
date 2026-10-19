const express = require('express');
const router = express.Router();
const { q } = require('../db');

function getSettings() {
  const rows = q.all('SELECT key, value FROM settings');
  const o = {};
  for (const r of rows) o[r.key] = r.value;
  return o;
}

function parseJSON(v, fallback) {
  try { return JSON.parse(v); } catch { return fallback; }
}

// 首页
router.get('/', (req, res) => {
  const settings = getSettings();
  const sections = q.all("SELECT * FROM home_sections WHERE status='active' ORDER BY sort_order");
  const categories = q.all("SELECT * FROM categories WHERE status='active' ORDER BY sort_order");
  const products = q.all("SELECT id, slug, name, subtitle, price, compare_at_price, badge, images, featured FROM products WHERE status='active' ORDER BY sort_order");
  const blogs = q.all("SELECT slug, title, excerpt, cover, type FROM pages WHERE type='blog' AND status='published' ORDER BY created_at DESC LIMIT 3");
  res.render('home', { settings, sections, categories, products, blogs, parseJSON });
});

// 产品列表
router.get('/products', (req, res) => {
  const settings = getSettings();
  const categories = q.all("SELECT * FROM categories WHERE status='active' ORDER BY sort_order");
  const cat = req.query.cat || '';
  let products, activeCat = '';
  if (cat) {
    const c = q.get('SELECT id, name FROM categories WHERE slug=?', [cat]);
    if (c) { activeCat = c.name; products = q.all('SELECT * FROM products WHERE status=? AND category_id=? ORDER BY sort_order', ['active', c.id]); }
  }
  if (!products) products = q.all("SELECT * FROM products WHERE status='active' ORDER BY sort_order");
  res.render('products', { settings, categories, products, cat, activeCat, parseJSON });
});

// 产品详情
router.get('/product/:slug', (req, res) => {
  const settings = getSettings();
  const categories = q.all("SELECT * FROM categories WHERE status='active' ORDER BY sort_order");
  const p = q.get('SELECT * FROM products WHERE slug=?', [req.params.slug]);
  if (!p || p.status !== 'active') return res.status(404).render('404', { settings, categories });
  p.images = parseJSON(p.images, []);
  p.options = parseJSON(p.options, []);
  const category = p.category_id ? q.get('SELECT name FROM categories WHERE id=?', [p.category_id]) : null;
  const related = q.all('SELECT id, slug, name, subtitle, price, badge, images FROM products WHERE status=? AND category_id=? AND id!=? LIMIT 4', ['active', p.category_id, p.id]);
  related.forEach(r => r.images = parseJSON(r.images, []));
  res.render('product', { settings, categories, p, category, related, parseJSON });
});

// 单页 / 博客
router.get('/page/:slug', (req, res) => {
  const settings = getSettings();
  const categories = q.all("SELECT * FROM categories WHERE status='active' ORDER BY sort_order");
  const page = q.get('SELECT * FROM pages WHERE slug=?', [req.params.slug]);
  if (!page) return res.status(404).render('404', { settings, categories });
  res.render('page', { settings, categories, page });
});

// 询价/留资
router.post('/inquire', (req, res) => {
  const { name, email, phone, message, product_id } = req.body;
  if (!email && !name) return res.json({ ok: false, msg: '请填写姓名或邮箱' });
  q.run('INSERT INTO inquiries (name, email, phone, message, product_id) VALUES (?,?,?,?,?)',
    [name || null, email || null, phone || null, message || null, product_id ? Number(product_id) : null]);
  res.json({ ok: true, msg: '已收到，我们会尽快联系你！' });
});

module.exports = router;
