'use client'

import Link from 'next/link'

interface Post {
  id: number
  title: string
  slug: string
}

interface RecentPostsProps {
  posts?: Post[]
}

const defaultPosts: Post[] = [
  {
    id: 1,
    title: 'cowabi.com申请首年免费域名和主机',
    slug: 'cowabi-free-domain'
  },
  {
    id: 2,
    title: 'Hello world!',
    slug: 'hello-world'
  }
]

export default function RecentPosts({ posts = defaultPosts }: RecentPostsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold mb-4">Recent Posts</h2>
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id}>
            <Link 
              href={`/posts/${post.slug}`} 
              className="text-gray-700 hover:text-blue-600 line-clamp-2"
            >
              {post.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}