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
      p.id, p.title, p.content, p.slug, p.created_at, p.views, p.likes,
      u.username as author_name, u.avatar_url as author_avatar,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
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
      p.id, p.title, p.content, p.slug, p.created_at, p.views, p.likes,
      u.username as author_name, u.avatar_url as author_avatar,
      c.name as category
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ?
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

// 点赞文章
app.post('/api/posts/:slug/like', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()

  await c.env.DB.prepare(`
    UPDATE posts SET likes = likes + 1 WHERE slug = ?
  `).bind(slug).run()

  return c.json({ message: 'Post liked successfully' })
})

export default {
  fetch: (req: Request, env: any, ctx: any) => {
    return app.fetch(req, env, ctx);
  }
}