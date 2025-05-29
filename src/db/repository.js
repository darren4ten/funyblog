// 导入必要的依赖
const { execSync } = require('child_process');

// 执行数据库查询的函数
function queryD1Database(query) {
  try {
    // 避免在命令中使用引号，改用单引号或避免多行查询直接拼接
    const sanitizedQuery = query.replace(/(\r\n|\n|\r)/gm, " ").trim();
    const command = `wrangler d1 execute funyblog --command="${sanitizedQuery}" --json`;
    console.log('Executing command:', command);
    const result = execSync(command, { encoding: 'utf-8', shell: true });
    return JSON.parse(result);
  } catch (error) {
    console.error('Error executing D1 query:', error.message, error.stderr);
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
      c.author_name, c.author_email
    FROM comments c
    WHERE c.post_id = ${post.id}
    ORDER BY c.created_at DESC
  `;
  const commentsResult = queryD1Database(commentsQuery);
  return { ...post, comments: commentsResult ? commentsResult[0].results : [] };
}

// 查询用户信息
function getUserById(userId) {
  const query = `
    SELECT username
    FROM users
    WHERE id = ${userId}
  `;
  const result = queryD1Database(query);
  if (result && result[0] && result[0].results && result[0].results.length > 0) {
    return result[0].results[0];
  }
  return null;
}

// 查询用户以验证登录
function getUserForLogin(username, passwordHash) {
  const query = `
    SELECT id, username
    FROM users
    WHERE username = '${username}' AND password_hash = '${passwordHash}'
  `;
  const result = queryD1Database(query);
  if (result && result[0].results && result[0].results.length > 0) {
    return result[0].results[0];
  }
  return null;
}

// 导出函数以便在API层中使用
module.exports = {
  getPosts,
  getPostBySlug,
  getUserById,
  getUserForLogin
};