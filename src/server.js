const express = require('express');
const path = require('path');
const cookieParser = (req, res, next) => {
  req.cookies = {};
  const c = req.headers.cookie;
  if (c) for (const part of c.split(';')) {
    const [k, ...v] = part.trim().split('=');
    req.cookies[k] = decodeURIComponent(v.join('='));
  }
  next();
};

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(cookieParser);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));

app.use('/', require('./routes/site'));
app.use('/admin', require('./routes/admin'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`\n  WhimsiPaw CMS 运行中：\n  前台  http://localhost:${PORT}/\n  后台  http://localhost:${PORT}/admin  (admin / admin123)\n`));
