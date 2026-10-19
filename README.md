# WhimsiPaw CMS — 自研轻量建站系统（前台 + 管理后台）

一个 WordPress 式思路的自研 CMS：**模板 + 数据库 + 后台 CRUD**，但后台是定制的轻量中文界面（不用 WordPress）。
技术栈：Node.js 22 + Express + EJS + SQLite（内置 `node:sqlite`），零外部数据库依赖。

## 启动

```bash
cd cms
npm start          # 或 node src/server.js
```

- 前台：http://localhost:4000/
- 后台：http://localhost:4000/admin （账号 `admin` / `admin123`，请尽快修改）

## 功能总览

### 前台（全部数据来自数据库）
- 首页：按 `home_sections` 顺序动态渲染 8 种区块（hero 视频、新品网格、宠物明星、痛点、里程碑、评价、博客、订阅）
- 商品列表 + 分类筛选（`/products?cat=pet-apparel`）
- 商品详情：多图、尺码/颜色选项、定制定制说明、询价表单（写入 inquiries）
- 单页 / 博客（`/page/:slug`）

### 管理后台（全权管理整站）
| 菜单 | 能力 |
|---|---|
| 仪表盘 | 商品/分类/页面/询价/媒体统计 |
| 商品 | 增删改查、多图、选项(JSON)、定价、角标、上下架 |
| 分类 | 增删改查、排序 |
| 页面/博客 | 增删改查、发布状态 |
| 首页区块 | 编辑任意区块的标题/副标题/JSON 数据/排序，可停用 |
| 媒体库 | URL 登记 + 本地上传（写入 `public/assets/media/`） |
| 询价/留资 | 查看、标记状态 |
| 站点设置 | 站名、标语、Logo、主色、页脚、邮箱、币种 |

鉴权：HMAC-SHA256 签名 cookie（`node:crypto`），密码 scrypt 哈希，无第三方依赖。

## 图片/视频素材说明（重要）

当前使用两套素材：
- **主用**：AI 生成的品牌风格图（1024×1024 统一方图、粉色渐变底）与逗玩宠物视频，原文件在 `../site/assets/media/`（`_*.jpg` / `banner-dog.mp4` / `banner-cat.mp4`），已拷贝为 `media/p_*.jpg` / `banner-pet-*.mp4`。这批图是早期已生成的存量文件，恢复使用**不产生新积分消耗**。
- **备用**：Pexels 免费图库照片（可商用许可），完整保留在 `media/stock-pexels/` 子目录，随时可切换。

上线替换真实商品图时，直接覆盖 `public/assets/media/` 下同名文件，或在后台上传新图后修改商品图片路径即可。商品卡 CSS 已锁定统一比例（`aspect-ratio` + `object-fit: cover`），换成任意宽高比的真实照片都不会破坏版式。

### 占位文件对照

| 文件 | 内容 | AI 存量原图 | Pexels 备用 ID（stock-pexels/） |
|---|---|---|---|
| p_kimono.jpg | 樱花和服（狗） | site/_kimono.jpg | 28829460 |
| p_sweater.jpg | 云朵毛衣（狗） | site/_sweater.jpg | 6607850 |
| p_bowl.jpg | 樱花慢食碗 | site/_bowl.jpg | 6952249 |
| p_bed.jpg | 云朵甜甜圈窝 | site/_bed.jpg | 6708461 |
| p_leash.jpg | 糖果牵引绳 | site/_leash.jpg | 37162574 |
| p_catcos.jpg | 魔女喵套装 | site/_catcos.jpg | 33212065 |
| p_raincoat.jpg | 晴雨衣 | site/_raincoat.jpg | 19321355 |
| p_bandana.jpg | 花朵方巾 | site/_bandana.jpg | 29227307 |
| p_backpack.jpg | 泡泡太空舱包 | site/_backpack.jpg | 35651203 |
| p_tote.jpg | 手编托特包 | site/_tote.jpg | 35685406 |
| banner-pet-1.mp4 | 逗狗视频（hero 竖版） | site/banner-dog.mp4 | 视频 13260818 |
| banner-pet-2.mp4 | 逗猫视频（hero 横版） | site/banner-cat.mp4 | 视频 9597599 |

## 目录结构

```
cms/
├─ src/
│  ├─ server.js          # Express 入口（端口 4000）
│  ├─ auth.js            # 登录/签名 cookie/鉴权中间件
│  ├─ routes/site.js     # 前台路由
│  ├─ routes/admin.js    # 后台路由（全部 CRUD）
│  └─ db/
│     ├─ index.js        # SQLite 连接 + 密码哈希 + 自动建表/种子
│     ├─ schema.sql      # 表结构
│     └─ seed.js         # 示例数据
├─ views/                # EJS 模板（site + admin）
├─ public/assets/
│  ├─ css/main.css       # 设计系统（薄荷渐变主题）
│  ├─ js/main.js         # 前台交互
│  └─ media/             # 图片/视频素材（主用 AI 存量图 + Pexels 备份在 stock-pexels/）
└─ data/site.db          # SQLite 数据库（自动生成）
```

## 上线切换 MySQL（可选）

当前用 SQLite（本地零配置）。上线时安装 `mysql2`，把 `src/db/index.js` 的连接换成 MySQL，
SQL 语句基本兼容，只需把 `INSERT OR IGNORE` 改为 `INSERT IGNORE` —— 架构与 WordPress（模板+库+后台）一致。
