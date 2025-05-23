import Banner from '@/components/Banner'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'
import { D1Database, D1Result } from '@cloudflare/workers-types'

interface Post {
  id: number
  title: string
  content: string
  slug: string
  author_name: string
  author_avatar: string
  created_at: string
  likes: number
  views: number
  comments_count: number
}

interface D1QueryResult {
  id: number
  title: string
  content: string
  slug: string
  author_name: string
  author_avatar: string
  created_at: string
  likes: number
  views: number
  comments_count: number
}

interface Category {
  name: string
  slug: string
  count: number
}

// 后备数据
const FALLBACK_POSTS: Post[] = [
  {
    id: 1,
    title: "Hello World!",
    content: "Welcome to my blog! This is the first post.",
    slug: "hello-world",
    author_name: "Admin",
    author_avatar: "/images/default-avatar.png",
    created_at: new Date().toISOString(),
    likes: 0,
    views: 0,
    comments_count: 0
  },
  {
    id: 2,
    title: "Getting Started with Next.js",
    content: "Next.js is a powerful framework for building React applications...",
    slug: "getting-started-nextjs",
    author_name: "Admin",
    author_avatar: "/images/default-avatar.png",
    created_at: new Date().toISOString(),
    likes: 0,
    views: 0,
    comments_count: 0
  }
]

async function getPosts(): Promise<Post[]> {
  try {
    const db = globalThis.DB as D1Database | undefined

    // 检查是否在 Cloudflare Pages 环境中
    if (!db) {
      console.log('Running in development mode, using fallback data')
      return FALLBACK_POSTS
    }

    const result = await db.prepare(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.slug,
        p.created_at,
        p.views,
        p.likes,
        u.name as author_name,
        u.avatar as author_avatar,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `).all<D1QueryResult>()

    if (!result?.results?.length) {
      console.log('No posts found, using fallback data')
      return FALLBACK_POSTS
    }

    return result.results
  } catch (error) {
    console.error('Error fetching posts:', error)
    return FALLBACK_POSTS
  }
}

async function getCategories(): Promise<Category[]> {
  // 这里将来会从 Cloudflare D1 获取数据
  return [
    { name: '技术', slug: 'technology', count: 5 },
    { name: '生活', slug: 'life', count: 3 },
    { name: '教程', slug: 'tutorial', count: 2 }
  ]
}

const posts = [
  {
    title: "cowabi.com申请首年免域名和主机",
    excerpt: "访问Cowabi.com，开启首年免费域名和主机，注意需要绑定信用卡。第一步，访问网站注册 第二步，添加WordPress站点 注意,不要切中文，切中文看不到控制面板，...",
    date: "18 5 月, 2025",
    views: 0,
    likes: 0,
    comments: 0,
    author: "admin",
    category: "Uncategorized",
    slug: "cowabi-free-domain"
  },
  {
    title: "Hello world!",
    excerpt: "Welcome to WordPress. This is your first post. Edit or delete it, then start writing!",
    date: "18 5 月, 2025",
    views: 9,
    likes: 2,
    comments: 2,
    author: "admin",
    category: "Uncategorized",
    slug: "hello-world"
  }
]

export default async function Home() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-[calc(100%-320px)]">
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.slug}>
                  <PostCard
                    title={post.title}
                    excerpt={post.content.substring(0, 200) + '...'}
                    date={new Date(post.created_at).toLocaleDateString('zh-CN')}
                    views={post.views}
                    likes={post.likes}
                    comments={post.comments_count}
                    author={post.author_name}
                    category="Uncategorized"
                    slug={post.slug}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-[320px] flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  )
} 