import { D1Database } from '@cloudflare/workers-types'

interface Env {
  DB: D1Database
}

export const env: Env = {
  // @ts-ignore - 这里的 DB 会在运行时由 Cloudflare 注入
  DB: globalThis.DB
} 
// API 基础 URL 配置
export const ApiBaseUrl = {
  local: 'http://127.0.0.1:8787',
  prod: 'https://test.com'
};
// 根据环境变量判断当前环境并返回相应的 API 基础 URL
export function getApiBaseUrl(): string {
  const env = process.env.NODE_ENV || 'local';
  return env === 'production' ? ApiBaseUrl.prod : ApiBaseUrl.local;
}