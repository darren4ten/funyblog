import Image from 'next/image'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CommentSection from '@/components/CommentSection'

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
  comments: Array<{
    id: number
    author: {
      name: string
      avatar: string
    }
    content: string
    created_at: string
  }>
}

async function getPost(slug: string): Promise<Post | null> {
  // 这里将来会从 Cloudflare D1 获取数据
  const posts: Record<string, Post> = {
    'hello-world': {
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
      comments: [
        {
          id: 1,
          author: {
            name: 'Test User',
            avatar: 'https://www.gravatar.com/avatar/11111111111111111111111111111111?d=mp'
          },
          content: '这是第一条评论！',
          created_at: '2025-05-18'
        },
        {
          id: 2,
          author: {
            name: 'Administrator',
            avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp'
          },
          content: '感谢您的评论！',
          created_at: '2025-05-18'
        }
      ]
    }
  }

  return posts[slug] || null
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white p-8 rounded-lg shadow-md">
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center space-x-4">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div className="font-medium">{post.author.name}</div>
                  <div className="text-sm text-gray-500">{post.created_at}</div>
                </div>
              </div>
            </header>

            <div className="prose max-w-none mb-8">
              {post.content}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
              <div className="flex space-x-4">
                <span>{post.views} 阅读</span>
                <button className="hover:text-blue-600">{post.likes} 点赞</button>
              </div>
            </div>
          </article>

          <CommentSection comments={post.comments} postSlug={post.slug} />
        </div>
      </div>
    </>
  )
} 