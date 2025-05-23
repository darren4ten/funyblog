import Banner from '@/components/Banner'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'
import { D1Database } from '@cloudflare/workers-types'

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

// 后备数据
const FALLBACK_POSTS: Post[] = [
  {
    id: 1,
    title: "Hello World123!",
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
    title: "Getting Started with Next.js456",
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
    `).all<Post>()

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

export default async function HomePage() {
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