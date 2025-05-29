import { D1Database } from '@cloudflare/workers-types';

// 在本地开发环境中，我们使用wrangler命令行工具通过d1-query.js脚本查询D1数据库
import { getPosts as getPostsFromD1, getPostBySlug as getPostBySlugFromD1 } from './d1-query';

// 查询文章列表
export const getPosts = async (): Promise<any[]> => {
  try {
    // 在本地开发环境中，通过d1-query.js脚本查询D1数据库
    return await getPostsFromD1();
  } catch (error) {
    console.error('查询文章列表时出错:', error);
    return [];
  }
};

// 查询文章详情
export const getPostBySlug = async (slug: string): Promise<any> => {
  try {
    // 在本地开发环境中，通过d1-query.js脚本查询D1数据库
    return await getPostBySlugFromD1(slug);
  } catch (error) {
    console.error('查询文章详情时出错:', error);
    throw error;
  }
};