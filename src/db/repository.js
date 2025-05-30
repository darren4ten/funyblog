// 数据库查询函数集合，用于 Cloudflare Worker 环境

/**
 * 获取文章列表
 * @param {D1Database} db - D1 数据库实例
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise<Object[]>} 文章列表
 */
export async function getPosts(db, page = 1, limit = 10) {
  const offset = (Number(page) - 1) * Number(limit);
  const posts = await db.prepare(`
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
  `).bind(limit, offset).all();
  return posts;
}

/**
 * 获取文章详情
 * @param {D1Database} db - D1 数据库实例
 * @param {string} slug - 文章 slug
 * @returns {Promise<Object|null>} 文章详情
 */
export async function getPostBySlug(db, slug) {
  const post = await db.prepare(`
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
  `).bind(slug).first();
  return post;
}

/**
 * 获取文章评论
 * @param {D1Database} db - D1 数据库实例
 * @param {string} slug - 文章 slug
 * @returns {Promise<Object[]>} 评论列表
 */
export async function getCommentsByPostSlug(db, slug) {
  const post = await db.prepare(`
    SELECT id FROM posts WHERE slug = ?
  `).bind(slug).first();

  if (!post) {
    return null;
  }

  const comments = await db.prepare(`
    SELECT
      c.id, c.content, c.created_at,
      c.author_name
    FROM comments c
    WHERE c.post_id = ?
    ORDER BY c.created_at DESC
  `).bind(post.id).all();
  return comments;
}

/**
 * 创建评论
 * @param {D1Database} db - D1 数据库实例
 * @param {string} slug - 文章 slug
 * @param {string} content - 评论内容
 * @param {string} authorName - 作者名称
 * @param {string} authorEmail - 作者邮箱
 * @returns {Promise<Object>} 操作结果
 */
export async function createComment(db, slug, content, authorName = "anonymous", authorEmail = "") {
  const post = await db.prepare(`
    SELECT id FROM posts WHERE slug = ?
  `).bind(slug).first();

  if (!post) {
    return null;
  }

  await db.prepare(`
    INSERT INTO comments (post_id, author_name, content, author_email)
    VALUES (?, ?, ?, ?)
  `).bind(post.id, authorName, content, authorEmail).run();
  return { message: 'Comment created successfully' };
}

/**
 * 获取最近评论
 * @param {D1Database} db - D1 数据库实例
 * @param {number} limit - 获取数量限制
 * @returns {Promise<Object[]>} 最近评论列表
 */
export async function getRecentComments(db, limit = 5) {
  const comments = await db.prepare(`
    SELECT
      c.id, c.content, c.created_at, c.author_name, p.title as post_title, p.slug as post_slug
    FROM comments c
    LEFT JOIN posts p ON c.post_id = p.id
    WHERE c.status = 'approved'
    ORDER BY c.created_at DESC
    LIMIT ?
  `).bind(limit).all();
  return comments;
}

/**
 * 获取所有分类
 * @param {D1Database} db - D1 数据库实例
 * @returns {Promise<Object[]>} 分类列表
 */
export async function getCategories(db) {
  const categories = await db.prepare(`
    SELECT
      c.id, c.name, c.slug,
      COUNT(p.id) as count
    FROM categories c
    LEFT JOIN posts p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all();
  return categories;
}

/**
 * 获取某个分类的所有文章
 * @param {D1Database} db - D1 数据库实例
 * @param {string} slug - 分类 slug
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise<Object[]>} 文章列表
 */
export async function getPostsByCategorySlug(db, slug, page = 1, limit = 10) {
  const offset = (Number(page) - 1) * Number(limit);
  const posts = await db.prepare(`
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
  `).bind(slug, limit, offset).all();
  return posts;
}

/**
 * 搜索文章
 * @param {D1Database} db - D1 数据库实例
 * @param {string} query - 搜索关键词
 * @param {number} limit - 获取数量限制
 * @returns {Promise<Object[]>} 搜索结果
 */
export async function searchPosts(db, query, limit = 5) {
  const posts = await db.prepare(`
    SELECT
      p.id, p.title, p.slug
    FROM posts p
    WHERE p.title LIKE ? AND p.status = 'published'
    LIMIT ?
  `).bind(`%${query}%`, limit).all();
  return posts;
}

/**
 * 点赞文章
 * @param {D1Database} db - D1 数据库实例
 * @param {string} slug - 文章 slug
 * @returns {Promise<Object>} 操作结果
 */
export async function likePost(db, slug) {
  await db.prepare(`
    UPDATE posts SET likes = likes + 1 WHERE slug = ?
  `).bind(slug).run();
  return { message: 'Post liked successfully' };
}

/**
 * 获取站点设置
 * @param {D1Database} db - D1 数据库实例
 * @returns {Promise<Object|null>} 站点设置
 */
export async function getSiteSettings(db) {
  const settings = await db.prepare(`
    SELECT site_title, site_subtitle, footer_main_content, footer_subtitle
    FROM site_settings
    LIMIT 1
  `).first();
  return settings;
}

/**
 * 获取特定标签的文章列表
 * @param {D1Database} db - D1 数据库实例
 * @param {string} slug - 标签 slug
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise<Object[]>} 文章列表
 */
export async function getPostsByTagSlug(db, slug, page = 1, limit = 10) {
  const offset = (Number(page) - 1) * Number(limit);
  const posts = await db.prepare(`
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
  `).bind(slug, limit, offset).all();
  return posts;
}

/**
 * 验证用户登录
 * @param {D1Database} db - D1 数据库实例
 * @param {string} username - 用户名
 * @param {string} passwordHash - 密码哈希
 * @returns {Promise<Object|null>} 用户信息
 */
export async function getUserForLogin(db, username, passwordHash) {
  const user = await db.prepare(`
    SELECT id, username
    FROM users
    WHERE username = ? AND password_hash = ?
  `).bind(username, passwordHash).first();
  return user;
}

/**
 * 根据用户ID获取用户信息
 * @param {D1Database} db - D1 数据库实例
 * @param {number} userId - 用户ID
 * @returns {Promise<Object|null>} 用户信息
 */
export async function getUserById(db, userId) {
  const user = await db.prepare(`
    SELECT username
    FROM users
    WHERE id = ?
  `).bind(userId).first();
  return user;
}

/**
 * 获取文章详情
 * @param {D1Database} db - D1 数据库实例
 * @param {number} id - 文章 ID
 * @returns {Promise<Object|null>} 文章详情
 */
export async function getPostById(db, id) {
  const post = await db.prepare(`
    SELECT
      p.id, p.title, p.content, p.summary, p.slug, p.created_at, p.updated_at, p.views, p.likes,
      u.username as author_name, u.avatar_url as author_avatar,
      c.name as category,
      c.slug as category_slug,
      GROUP_CONCAT(t.name) as tags
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.id = ?
    GROUP BY p.id
  `).bind(id).first();
  return post;
}

/**
 * 更新文章
 * @param {D1Database} db - D1 数据库实例
 * @param {number} id - 文章 ID
 * @param {string} title - 文章标题
 * @param {string} content - 文章内容
 * @param {string} category - 文章分类
 * @param {string[]} tags - 文章标签
 * @returns {Promise<Object>} 操作结果
 */
export async function updatePost(db, id, title, content, category, tags) {
  // 更新文章基本信息
  await db.prepare(`
    UPDATE posts
    SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(title, content, id).run();

  // 更新分类
  if (category) {
    const categoryResult = await db.prepare(`
      SELECT id FROM categories WHERE name = ? OR slug = ?
    `).bind(category, category).first();
    
    if (categoryResult) {
      await db.prepare(`
        UPDATE posts
        SET category_id = ?
        WHERE id = ?
      `).bind(categoryResult.id, id).run();
    }
  }

  // 更新标签
  if (tags && tags.length > 0) {
    // 先删除现有标签
    await db.prepare(`
      DELETE FROM post_tags WHERE post_id = ?
    `).bind(id).run();

    // 然后添加新标签
    for (const tag of tags) {
      if (tag.trim()) {
        // 检查标签是否存在，不存在则创建
        let tagResult = await db.prepare(`
          SELECT id FROM tags WHERE name = ? OR slug = ?
        `).bind(tag, tag).first();
        
        if (!tagResult) {
          await db.prepare(`
            INSERT INTO tags (name, slug) VALUES (?, ?)
          `).bind(tag, tag.toLowerCase().replace(/\s+/g, '-')).run();
          
          tagResult = await db.prepare(`
            SELECT id FROM tags WHERE name = ?
          `).bind(tag).first();
        }
        
        if (tagResult) {
          await db.prepare(`
            INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)
          `).bind(id, tagResult.id).run();
        }
      }
    }
  }

  return { message: 'Post updated successfully', id };
}

/**
 * 创建文章
 * @param {D1Database} db - D1 数据库实例
 * @param {string} title - 文章标题
 * @param {string} content - 文章内容
 * @param {string} category - 文章分类
 * @param {string[]} tags - 文章标签
 * @returns {Promise<Object>} 操作结果
 */
export async function createPost(db, title, content, category, tags) {
  // 创建文章
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const result = await db.prepare(`
    INSERT INTO posts (title, content, slug, author_id, status, category_id)
    VALUES (?, ?, ?, 1, 'published', 1)
    RETURNING id
  `).bind(title, content, slug).first();

  const postId = result.id;

  // 设置分类
  if (category) {
    const categoryResult = await db.prepare(`
      SELECT id FROM categories WHERE name = ? OR slug = ?
    `).bind(category, category).first();
    
    if (categoryResult) {
      await db.prepare(`
        UPDATE posts
        SET category_id = ?
        WHERE id = ?
      `).bind(categoryResult.id, postId).run();
    }
  }

  // 设置标签
  if (tags && tags.length > 0) {
    for (const tag of tags) {
      if (tag.trim()) {
        // 检查标签是否存在，不存在则创建
        let tagResult = await db.prepare(`
          SELECT id FROM tags WHERE name = ? OR slug = ?
        `).bind(tag, tag).first();
        
        if (!tagResult) {
          await db.prepare(`
            INSERT INTO tags (name, slug) VALUES (?, ?)
          `).bind(tag, tag.toLowerCase().replace(/\s+/g, '-')).run();
          
          tagResult = await db.prepare(`
            SELECT id FROM tags WHERE name = ?
          `).bind(tag).first();
        }
        
        if (tagResult) {
          await db.prepare(`
            INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)
          `).bind(postId, tagResult.id).run();
        }
      }
    }
  }

  return { message: 'Post created successfully', id: postId };
}