import { D1Database } from '@cloudflare/workers-types'

interface Env {
  DB: D1Database
}

export const env: Env = {
  // @ts-ignore - 这里的 DB 会在运行时由 Cloudflare 注入
  DB: globalThis.DB
} 