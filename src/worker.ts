/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import type { Context } from 'hono'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 配置 CORS
app.use('*', cors())

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
  const userId = c.get('jwtPayload').sub

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

export default {
  fetch: (req: Request, env: any, ctx: any) => {
    return app.fetch(req, env, ctx);
  }
}