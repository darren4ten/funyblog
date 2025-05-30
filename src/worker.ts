/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'
import type { Context } from 'hono'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

 // 配置 CORS
app.use('*', cors({
  origin: 'http://localhost:3000',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

 // JWT 中间件 - 在本地开发环境中暂时禁用
 // app.use('/api/*', jwt({
 //   secret: 'placeholder-secret' // 临时解决方案，实际环境中应使用环境变量
 // }))

// 获取文章列表
app.get('/api/posts', async (c: Context<{ Bindings: Bindings }>) => {
  const { page = 1, limit = 10 } = c.req.query()
  const offset = (Number(page) - 1) * Number(limit)

  const posts = await c.env.DB.prepare(`
    SELECT
      p.id, p.title, p.summary, p.slug, p.created_at, p.views, p.likes,
      u.username as author_name, u.avatar_url as author_avatar,
      c.name as category,
      c.slug as category_slug,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'published'
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all()

  return c.json(posts)
})

// 获取文章详情
app.get('/api/posts/:slug', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()

  const post = await c.env.DB.prepare(`
    SELECT
      p.id, p.title, p.content, p.slug, p.created_at, p.updated_at, p.views, p.likes,
      u.username as author_name, u.avatar_url as author_avatar,
      c.name as category,
      GROUP_CONCAT(t.name) as tags
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.slug = ?
    GROUP BY p.id
  `).bind(slug).first()

  if (!post) {
    return c.json({ error: 'Post not found' }, 404)
  }

  return c.json(post)
})

// 获取评论
app.get('/api/posts/:slug/comments', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()

  const post = await c.env.DB.prepare(`
    SELECT id FROM posts WHERE slug = ?
  `).bind(slug).first()

  if (!post) {
    return c.json({ error: 'Post not found' }, 404)
  }

  const comments = await c.env.DB.prepare(`
    SELECT
      c.id, c.content, c.created_at,
      c.author_name
    FROM comments c
    WHERE c.post_id = ?
    ORDER BY c.created_at DESC
  `).bind(post.id).all()

  return c.json(comments)
})

// 创建评论
app.post('/api/posts/:slug/comments', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()
  const { content } = await c.req.json()

  const post = await c.env.DB.prepare(`
    SELECT id FROM posts WHERE slug = ?
  `).bind(slug).first()

  if (!post) {
    return c.json({ error: 'Post not found' }, 404)
  }

  await c.env.DB.prepare(`
    INSERT INTO comments (post_id, author_name, content)
    VALUES (?, ?, ?)
  `).bind(post.id, "anonymous", content).run()

  return c.json({ message: 'Comment created successfully' })
})

 // 获取最近评论
app.get('/api/comments', async (c: Context<{ Bindings: Bindings }>) => {
  const { limit = 5 } = c.req.query()

  const comments = await c.env.DB.prepare(`
    SELECT
      c.id, c.content, c.created_at, c.author_name, p.title as post_title, p.slug as post_slug
    FROM comments c
    LEFT JOIN posts p ON c.post_id = p.id
    WHERE c.status = 'approved'
    ORDER BY c.created_at DESC
    LIMIT ?
  `).bind(limit).all()

  return c.json(comments)
})

 // 获取所有分类
app.get('/api/categories', async (c: Context<{ Bindings: Bindings }>) => {
  const categories = await c.env.DB.prepare(`
    SELECT
      c.id, c.name, c.slug,
      COUNT(p.id) as count
    FROM categories c
    LEFT JOIN posts p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all()

  return c.json(categories)
})

 // 获取某个分类的所有文章
app.get('/api/categories/:slug/posts', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()
  const { page = 1, limit = 10 } = c.req.query()
  const offset = (Number(page) - 1) * Number(limit)

  const posts = await c.env.DB.prepare(`
    SELECT
      p.id, p.title, p.content, p.slug, p.created_at, p.views, p.likes,
      u.username as author_name, u.avatar_url as author_avatar,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE c.slug = ? AND p.status = 'published'
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(slug, limit, offset).all()

  return c.json(posts)
})

 // 搜索文章
app.get('/api/search', async (c: Context<{ Bindings: Bindings }>) => {
  const { query, limit = 5 } = c.req.query()

  if (!query) {
    return c.json({ error: 'Query parameter is required' }, 400)
  }

  const posts = await c.env.DB.prepare(`
    SELECT
      p.id, p.title, p.slug
    FROM posts p
    WHERE p.title LIKE ? AND p.status = 'published'
    LIMIT ?
  `).bind(`%${query}%`, limit).all()

  return c.json(posts)
})

// 点赞文章
app.post('/api/posts/:slug/like', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()

  await c.env.DB.prepare(`
    UPDATE posts SET likes = likes + 1 WHERE slug = ?
  `).bind(slug).run()

  return c.json({ message: 'Post liked successfully' })
})

// 获取站点设置
app.get('/api/site-settings', async (c: Context<{ Bindings: Bindings }>) => {
  const settings = await c.env.DB.prepare(`
    SELECT site_title, site_subtitle, footer_main_content, footer_subtitle
    FROM site_settings
    LIMIT 1
  `).first()
  
  if (!settings) {
    return c.json({ error: 'Site settings not found' }, 404)
  }
  
  return c.json(settings)
})

// 获取特定标签的文章列表
app.get('/api/tags/:slug/posts', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()
  const { page = 1, limit = 10 } = c.req.query()
  const offset = (Number(page) - 1) * Number(limit)

  const posts = await c.env.DB.prepare(`
    SELECT
      p.id, p.title, p.summary, p.slug, p.created_at, p.views, p.likes,
      u.username as author_name, u.avatar_url as author_avatar,
      c.name as category,
      c.slug as category_slug,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE REPLACE(LOWER(t.slug), '.', '') = REPLACE(LOWER(?), '.', '') AND p.status = 'published'
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(slug, limit, offset).all()

  return c.json(posts)
})

// 登录接口
app.post('/api/bdmin/login', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { username, password } = await c.req.json();
    if (!username || !password) {
      return c.json({ error: '用户名和密码不能为空' }, 400);
    }

    // 使用Web Crypto API进行密码哈希处理
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const user = await c.env.DB.prepare(`
      SELECT id, username
      FROM users
      WHERE username = ? AND password_hash = ?
    `).bind(username, passwordHash).first();

    if (!user) {
      return c.json({ error: '用户名或密码错误' }, 401);
    }

    const userId = user.id;
    const userName = user.username;
    // 使用简单的 base64 编码生成令牌，适用于 Cloudflare Workers 环境
    const payload = JSON.stringify({ userId, username: userName, role: 'admin', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) });
    const token = btoa(payload);
    const response = c.json({ message: '登录成功', token: token }, 200);
    response.headers.set('Set-Cookie', `auth_token=${token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; HttpOnly`);
    return response;
  } catch (error) {
    console.error('登录错误:', error);
    return c.json({ error: '服务器错误' }, 500);
  }
});

// 获取当前用户信息接口
app.post('/api/bdmin/current-user', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { token } = await c.req.json();
    if (!token) {
      return c.json({ error: '未登录' }, 401);
    }

    let decoded;
    try {
      const decodedPayload = atob(token);
      decoded = JSON.parse(decodedPayload);
      if (!decoded.userId || !decoded.username || !decoded.role || !decoded.iat || !decoded.exp) {
        return c.json({ error: '无效的令牌格式' }, 401);
      }
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return c.json({ error: '令牌已过期' }, 401);
      }
    } catch (err) {
      console.error('令牌解码或解析错误:', err);
      return c.json({ error: '无效的令牌' }, 401);
    }

    const userId = decoded.userId;
    const user = await c.env.DB.prepare(`
      SELECT username
      FROM users
      WHERE id = ?
    `).bind(userId).first();

    if (user) {
      return c.json({ username: user.username }, 200);
    } else {
      return c.json({ error: '用户未找到' }, 404);
    }
  } catch (error) {
    console.error('获取当前用户信息出错:', error);
    return c.json({ error: '服务器错误' }, 500);
  }
});

export default {
  fetch: (req: Request, env: any, ctx: any) => {
    return app.fetch(req, env, ctx);
  }
}