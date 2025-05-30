import { ApiBaseUrl, getApiBaseUrl } from '../lib/env';
import Banner from '@/components/Banner'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'
import { D1Database } from '@cloudflare/workers-types'

interface Post {
  id: number
  title: string
  content?: string
  summary?: string
  slug: string
  author_name: string
  author_avatar: string
  created_at: string
  likes: number
  views: number
  comments_count: number
  category?: string
  category_slug?: string
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
    // 通过API获取文章列表
    const res = await fetch(`${getApiBaseUrl()}/api/posts`);
    if (!res.ok) throw new Error('网络请求失败');
    const data = (await res.json()) as any;
    // 兼容 Cloudflare Worker 返回格式
    if (Array.isArray(data?.results)) {
      return data.results as Post[];
    } else if (Array.isArray(data)) {
      return data as Post[];
    }
    return FALLBACK_POSTS;
  } catch (error) {
    console.error('Error fetching posts from local D1 database:', error);
    return FALLBACK_POSTS;
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
                    excerpt={post.summary || (post.content ? post.content.substring(0, 200) + '...' : '')}
                    date={new Date(post.created_at).toLocaleDateString('zh-CN')}
                    views={post.views}
                    likes={post.likes}
                    comments={post.comments_count}
                    author={post.author_name}
                    category={post.category || "Uncategorized"}
                    categorySlug={post.category_slug || "uncategorized"}
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