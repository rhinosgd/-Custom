const crypto = require('node:crypto');
const { q, verifyPassword } = require('./db');

const SECRET = process.env.AUTH_SECRET || 'whimspaw-dev-secret-change-me';
const COOKIE = 'wp_sid';

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}
function unsign(token) {
  try {
    const [body, sig] = token.split('.');
    const good = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
    if (sig !== good) return null;
    const data = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (data.exp && data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}

function login(username, password) {
  const admin = q.get('SELECT * FROM admins WHERE username=?', [username]);
  if (!admin || !verifyPassword(password, admin.password_hash)) return null;
  return sign({ user: admin.username, exp: Date.now() + 7 * 24 * 3600 * 1000 });
}

function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE];
  const data = token && unsign(token);
  if (!data) return res.redirect('/admin/login');
  req.admin = data.user;
  next();
}

module.exports = { COOKIE, sign, unsign, login, requireAuth };
