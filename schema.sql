-- 用户表 - 存储用户信息
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,    -- 用户ID
  username TEXT NOT NULL UNIQUE,           -- 用户名
  nickname TEXT,                           -- 显示名称
  email TEXT NOT NULL UNIQUE,              -- 邮箱
  password_hash TEXT NOT NULL,             -- 密码哈希
  avatar_url TEXT,                         -- 头像URL
  bio TEXT,                                -- 个人简介
  role TEXT NOT NULL DEFAULT 'user',       -- 用户角色：admin-管理员，editor-编辑，user-普通用户
  is_active BOOLEAN DEFAULT 1,             -- 账户是否激活
  last_login DATETIME,                     -- 最后登录时间
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- 更新时间
);

-- 分类表 - 存储文章分类
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,    -- 分类ID
  name TEXT NOT NULL,                      -- 分类名称
  slug TEXT NOT NULL UNIQUE,               -- URL友好的名称
  description TEXT,                        -- 分类描述
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- 更新时间
);

-- 标签表 - 存储文章标签
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,    -- 标签ID
  name TEXT NOT NULL,                      -- 标签名称
  slug TEXT NOT NULL UNIQUE,               -- URL友好的名称
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- 更新时间
);

-- 文章表 - 存储博客文章
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,    -- 文章ID
  title TEXT NOT NULL,                     -- 文章标题
  slug TEXT NOT NULL UNIQUE,               -- URL友好的标题
  content TEXT NOT NULL,                   -- 文章内容
  excerpt TEXT,                            -- 文章摘要
  author_id INTEGER NOT NULL,              -- 作者ID
  category_id INTEGER NOT NULL,            -- 分类ID
  status TEXT NOT NULL DEFAULT 'draft',    -- 文章状态：draft-草稿，published-已发布
  cover_image TEXT,                        -- 文章封面图片
  reading_time INTEGER DEFAULT 0,          -- 预计阅读时间（分钟）
  is_featured BOOLEAN DEFAULT 0,           -- 是否为推荐文章
  is_commentable BOOLEAN DEFAULT 1,        -- 是否允许评论
  meta_description TEXT,                   -- SEO 元描述
  meta_keywords TEXT,                      -- SEO 关键词
  views INTEGER DEFAULT 0,                 -- 浏览量
  likes INTEGER DEFAULT 0,                 -- 点赞数
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 更新时间
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 文章标签关联表 - 存储文章和标签的多对多关系
CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER NOT NULL,                -- 文章ID
  tag_id INTEGER NOT NULL,                 -- 标签ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 评论表 - 存储文章评论
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,    -- 评论ID
  post_id INTEGER NOT NULL,                -- 文章ID
  parent_id INTEGER,                       -- 父评论ID（用于回复功能）
  author_name TEXT NOT NULL,               -- 评论者名称
  author_email TEXT NOT NULL,              -- 评论者邮箱
  content TEXT NOT NULL,                   -- 评论内容
  ip_address TEXT,                         -- 评论者IP地址
  user_agent TEXT,                         -- 评论者浏览器信息
  likes INTEGER DEFAULT 0,                 -- 评论点赞数
  status TEXT NOT NULL DEFAULT 'pending',  -- 评论状态：pending-待审核，approved-已通过
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 更新时间
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE SET NULL
);

-- 插入测试数据
-- 用户数据
INSERT INTO users (username, nickname, email, password_hash, avatar_url, bio, role) VALUES
('admin', '管理员', 'admin@example.com', 'hashed_password', 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp', '分享技术与生活', 'admin');

-- 分类数据
INSERT INTO categories (name, slug, description) VALUES
('技术', 'technology', '技术相关文章'),
('生活', 'life', '生活随笔'),
('教程', 'tutorial', '各类教程');

-- 标签数据
INSERT INTO tags (name, slug) VALUES
('JavaScript', 'javascript'),
('React', 'react'),
('Next.js', 'nextjs');

-- 文章数据
INSERT INTO posts (title, slug, content, excerpt, summary, author_id, category_id, status, views, likes, is_featured, reading_time, meta_description) VALUES
('Hello World', 'hello-world', '欢迎使用我们的博客系统！这是第一篇文章。

这是一个基于 Cloudflare 技术栈的博客系统，包括：

- Cloudflare Workers
- Cloudflare D1 数据库
- Cloudflare Pages
- Next.js 14
- React
- Tailwind CSS

希望你能喜欢这个系统！', '欢迎使用我们的博客系统！这是第一篇文章。', '欢迎使用我们的博客系统！这是第一篇文章。这是一个基于 Cloudflare 技术栈的博客系统，包括：', 1, 1, 'published', 9, 2, 1, 2, '一个基于 Cloudflare 技术栈的现代博客系统'),
('Markdown 教程', 'markdown-tutorial', '# Markdown 基础教程

Markdown 是一种轻量级标记语言，它允许人们使用易读易写的纯文本格式编写文档。

## 基本语法

### 标题

使用 # 号可表示 1-6 级标题，一级标题对应一个 # 号，二级标题对应两个 # 号，以此类推。

### 强调

- *斜体*：使用 * 或 _
- **粗体**：使用 ** 或 __
- ***粗斜体***：使用 *** 或 ___

### 列表

无序列表使用 - 或 * 作为列表标记：

- 第一项
- 第二项
- 第三项

有序列表使用数字并加上 . 号：

1. 第一项
2. 第二项
3. 第三项

### 链接和图片

[链接名称](链接地址)
![图片描述](图片地址)

### 代码

行内代码使用反引号：`code`

代码块使用三个反引号：

```javascript
console.log("Hello World!");
```

## 结语

这只是 Markdown 的基础用法，更多高级用法请参考官方文档。', 'Markdown 是一种轻量级标记语言，本文介绍其基本语法。', 'Markdown 是一种轻量级标记语言，它允许人们使用易读易写的纯文本格式编写文档。', 1, 3, 'published', 2, 9, 0, 5, 'Markdown 基础教程：从入门到精通');

-- 文章标签关联数据
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 2),
(1, 3),
(2, 1);

-- 评论数据
INSERT INTO comments (post_id, author_name, author_email, content, status, ip_address, user_agent) VALUES
(1, 'admin', 'admin@example.com', '欢迎使用本博客系统！', 'approved', '127.0.0.1', 'Mozilla/5.0'),
(1, 'test_user', 'test@example.com', '博客系统很不错！', 'approved', '127.0.0.1', 'Mozilla/5.0'),
(1, 'visitor1', 'visitor1@example.com', '很棒的博客，期待更多内容！', 'approved', '127.0.0.1', 'Mozilla/5.0'),
(2, 'markdown_lover', 'markdown@example.com', '很详细的 Markdown 教程，感谢分享！', 'approved', '127.0.0.1', 'Mozilla/5.0'),
(2, 'learner', 'learner@example.com', '学到了很多，谢谢！', 'approved', '127.0.0.1', 'Mozilla/5.0'),
(2, 'tech_fan', 'tech_fan@example.com', 'Markdown 真是太有用了！', 'approved', '127.0.0.1', 'Mozilla/5.0');
