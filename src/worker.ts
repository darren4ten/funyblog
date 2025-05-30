/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'
import type { Context } from 'hono'
import { getPosts, getPostBySlug, getCommentsByPostSlug, createComment, getRecentComments, getCategories, getPostsByCategorySlug, searchPosts, likePost, getSiteSettings, getPostsByTagSlug, getUserForLogin, getUserById, getPostById } from './db/repository.js'

// 扩展 Hono 上下文类型以包含自定义变量
interface CustomContext extends Context {
  set(key: 'jwtPayload', value: Record<string, any>): void;
  get(key: 'jwtPayload'): Record<string, any> | undefined;
}

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

 // JWT 中间件 - 验证受保护的路由，但排除登录接口
 app.use('/api/bdmin/*', async (c, next) => {
   // 排除登录接口
   if (c.req.path === '/api/bdmin/login') {
     await next();
     return;
   }
   const authHeader = c.req.header('Authorization');
   if (!authHeader || !authHeader.startsWith('Bearer ')) {
     return c.json({ error: '未提供令牌或令牌格式错误' }, 401);
   }
   
   const token = authHeader.split(' ')[1];
   if (!token) {
     return c.json({ error: '未提供令牌' }, 401);
   }
   
   try {
     const parts = token.split('.');
     if (parts.length !== 3) {
       return c.json({ error: '无效的令牌格式' }, 401);
     }
     const [encodedHeader, encodedPayload, signature] = parts;
     const input = `${encodedHeader}.${encodedPayload}`;
     const textEncoder = new TextEncoder();
     const secret = c.env.JWT_SECRET || 'default-secret-for-development-only';
     const keyData = textEncoder.encode(secret);
     const inputData = textEncoder.encode(input);
     if (!c.env.JWT_SECRET) {
       console.warn('JWT_SECRET 环境变量未设置，使用默认密钥（仅用于开发环境）');
     }
     const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
     const signatureBuffer = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
     const isValid = await crypto.subtle.verify('HMAC', cryptoKey, signatureBuffer, inputData);
     
     if (!isValid) {
       return c.json({ error: '令牌签名无效' }, 401);
     }
     
     const decodedPayload = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
     const decoded = JSON.parse(decodedPayload);
     if (!decoded.userId || !decoded.username || !decoded.role || !decoded.iat || !decoded.exp) {
       return c.json({ error: '无效的令牌格式' }, 401);
     }
     if (decoded.exp < Math.floor(Date.now() / 1000)) {
       return c.json({ error: '令牌已过期' }, 401);
     }
     
     // 将用户信息添加到请求上下文中
     // 使用扩展后的上下文类型
     (c as unknown as CustomContext).set('jwtPayload', decoded);
     await next();
   } catch (err) {
     console.error('JWT 验证错误:', err);
     return c.json({ error: '无效的令牌' }, 401);
   }
 });

// 获取文章列表
app.get('/api/posts', async (c: Context<{ Bindings: Bindings }>) => {
  const { page = '1', limit = '10' } = c.req.query()
  const posts = await getPosts(c.env.DB, parseInt(page), parseInt(limit))
  return c.json(posts)
})

// 获取文章详情
app.get('/api/posts/:slug', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()
  const post = await getPostBySlug(c.env.DB, slug)
  if (!post) {
    return c.json({ error: 'Post not found' }, 404)
  }
  return c.json(post)
})

// 获取文章详情 by ID (for admin)
app.get('/api/bdmin/posts/:id', async (c: Context<{ Bindings: Bindings }>) => {
  const { id } = c.req.param()
  const post = await getPostById(c.env.DB, parseInt(id))
  if (!post) {
    return c.json({ error: 'Post not found' }, 404)
  }
  return c.json(post)
})

// 获取评论
app.get('/api/posts/:slug/comments', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()
  const comments = await getCommentsByPostSlug(c.env.DB, slug)
  if (!comments) {
    return c.json({ error: 'Post not found' }, 404)
  }
  return c.json(comments)
})

// 创建评论
app.post('/api/posts/:slug/comments', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()
  const { content } = await c.req.json()
  const result = await createComment(c.env.DB, slug, content)
  if (!result) {
    return c.json({ error: 'Post not found' }, 404)
  }
  return c.json(result)
})

// 获取最近评论
app.get('/api/comments', async (c: Context<{ Bindings: Bindings }>) => {
  const { limit = '5' } = c.req.query()
  const comments = await getRecentComments(c.env.DB, parseInt(limit))
  return c.json(comments)
})

// 获取所有分类
app.get('/api/categories', async (c: Context<{ Bindings: Bindings }>) => {
  const categories = await getCategories(c.env.DB)
  return c.json(categories)
})

// 获取某个分类的所有文章
app.get('/api/categories/:slug/posts', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()
  const { page = '1', limit = '10' } = c.req.query()
  const posts = await getPostsByCategorySlug(c.env.DB, slug, parseInt(page), parseInt(limit))
  return c.json(posts)
})

// 搜索文章
app.get('/api/search', async (c: Context<{ Bindings: Bindings }>) => {
  const { query, limit = '5' } = c.req.query()
  if (!query) {
    return c.json({ error: 'Query parameter is required' }, 400)
  }
  const posts = await searchPosts(c.env.DB, query, parseInt(limit))
  return c.json(posts)
})

// 点赞文章
app.post('/api/posts/:slug/like', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()
  const result = await likePost(c.env.DB, slug)
  return c.json(result)
})

// 获取站点设置
app.get('/api/site-settings', async (c: Context<{ Bindings: Bindings }>) => {
  const settings = await getSiteSettings(c.env.DB)
  if (!settings) {
    return c.json({ error: 'Site settings not found' }, 404)
  }
  return c.json(settings)
})

// 获取特定标签的文章列表
app.get('/api/tags/:slug/posts', async (c: Context<{ Bindings: Bindings }>) => {
  const { slug } = c.req.param()
  const { page = '1', limit = '10' } = c.req.query()
  const posts = await getPostsByTagSlug(c.env.DB, slug, parseInt(page), parseInt(limit))
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

    const user = await getUserForLogin(c.env.DB, username, passwordHash) as { id: number, username: string } | null;
    if (!user) {
      return c.json({ error: '用户名或密码错误' }, 401);
    }

    const userId = user.id;
    const userName = user.username;
    // 使用 HMAC-SHA256 签名生成 JWT 令牌
    const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
    const payload = JSON.stringify({ userId, username: userName, role: 'admin', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) });
    const encodedHeader = btoa(header).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = btoa(payload).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const input = `${encodedHeader}.${encodedPayload}`;
    const textEncoder = new TextEncoder();
    const secret = c.env.JWT_SECRET || 'default-secret-for-development-only';
    const keyData = textEncoder.encode(secret);
    const inputData = textEncoder.encode(input);
    if (!c.env.JWT_SECRET) {
      console.warn('JWT_SECRET 环境变量未设置，使用默认密钥（仅用于开发环境）');
    }
    const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, inputData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = btoa(String.fromCharCode.apply(null, signatureArray)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${input}.${signature}`;
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
      const parts = token.split('.');
      if (parts.length !== 3) {
        return c.json({ error: '无效的令牌格式' }, 401);
      }
      const [encodedHeader, encodedPayload, signature] = parts;
      const input = `${encodedHeader}.${encodedPayload}`;
      const textEncoder = new TextEncoder();
      const secret = c.env.JWT_SECRET || 'default-secret-for-development-only';
      const keyData = textEncoder.encode(secret);
      const inputData = textEncoder.encode(input);
      if (!c.env.JWT_SECRET) {
        console.warn('JWT_SECRET 环境变量未设置，使用默认密钥（仅用于开发环境）');
      }
      const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
      const signatureBuffer = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      const isValid = await crypto.subtle.verify('HMAC', cryptoKey, signatureBuffer, inputData);
      if (!isValid) {
        return c.json({ error: '令牌签名无效' }, 401);
      }
      const decodedPayload = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
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
    const user = await getUserById(c.env.DB, userId) as { username: string } | null;
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