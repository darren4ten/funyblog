const { execSync } = require('child_process');
const fs = require('fs');

// 执行wrangler d1 execute命令来查询数据库
function queryD1Database(query) {
  try {
    const command = `wrangler d1 execute funyblog --command "${query}" --json`;
    const result = execSync(command, { encoding: 'utf-8' });
    return JSON.parse(result);
  } catch (error) {
    console.error('Error executing D1 query:', error.message);
    return null;
  }
}

// 查询文章列表
function getPosts() {
  const query = `
    SELECT 
      p.id, p.title, p.content, p.slug, p.created_at, p.views, p.likes,
      u.username as author_name, u.avatar_url as author_avatar,
      COUNT(DISTINCT c.id) as comments_count
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
    WHERE p.status = 'published'
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
  const result = queryD1Database(query);
  return result ? result[0].results : [];
}

// 查询文章详情
function getPostBySlug(slug) {
  const query = `
    SELECT 
      p.id, p.title, p.content, p.slug, p.created_at, p.views, p.likes,
      u.username as author_name, u.avatar_url as author_avatar
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.slug = '${slug}'
  `;
  const postResult = queryD1Database(query);
  if (!postResult || postResult[0].results.length === 0) {
    throw new Error('文章未找到');
  }
  const post = postResult[0].results[0];
  
  // 获取评论
  const commentsQuery = `
    SELECT 
      c.id, c.content, c.created_at,
      u.username as author_name, u.avatar_url as author_avatar
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.post_id = ${post.id}
    ORDER BY c.created_at DESC
  `;
  const commentsResult = queryD1Database(commentsQuery);
  return { ...post, comments: commentsResult ? commentsResult[0].results : [] };
}

// 导出函数以便在前端应用中使用
module.exports = {
  getPosts,
  getPostBySlug
};