import Banner from '@/components/Banner'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

interface Post {
  id: number
  title: string
  content: string
  slug: string
  author: {
    name: string
    avatar: string
  }
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

async function getPosts(): Promise<Post[]> {
  // 这里将来会从 Cloudflare D1 获取数据
  return [
    {
      id: 1,
      title: 'Hello World',
      content: '欢迎使用我们的博客系统！这是第一篇文章。',
      slug: 'hello-world',
      author: {
        name: 'Administrator',
        avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp'
      },
      created_at: '2025-05-18',
      likes: 0,
      views: 0,
      comments_count: 2
    },
    {
      id: 2,
      title: 'Markdown 教程',
      content: '这是一篇关于 Markdown 的基础教程...',
      slug: 'markdown-tutorial',
      author: {
        name: 'Administrator',
        avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp'
      },
      created_at: '2025-05-18',
      likes: 9,
      views: 2,
      comments_count: 1
    }
  ]
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

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Banner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-[calc(100%-320px)]">
            <div className="space-y-6">
              {posts.map((post, index) => (
                <PostCard key={post.slug} {...post} />
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