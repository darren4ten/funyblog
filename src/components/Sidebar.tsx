'use client'

import Link from 'next/link'

interface Post {
  id: number
  title: string
  slug: string
}

interface Category {
  name: string
  slug: string
  count: number
}

interface SidebarProps {
  recentPosts?: Post[]
  categories?: Category[]
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

const defaultCategories: Category[] = [
  {
    name: 'Uncategorized',
    slug: 'uncategorized',
    count: 2
  }
]

export default function Sidebar({ 
  recentPosts = defaultPosts, 
  categories = defaultCategories 
}: SidebarProps) {
  return (
    <div className="space-y-6">
      {/* 搜索框 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">搜索</h2>
        <form className="flex" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="搜索..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 最近文章 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Recent Posts</h2>
        <div className="space-y-3">
          {recentPosts.map(post => (
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

      {/* 最近评论 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Recent Comments</h2>
        <div className="space-y-3">
          <div>
            <Link 
              href="/posts/hello-world#comments" 
              className="text-gray-700 hover:text-blue-600 line-clamp-2"
            >
              admin 发表在 Hello world!
            </Link>
          </div>
          <div>
            <Link 
              href="/posts/hello-world#comments" 
              className="text-gray-700 hover:text-blue-600 line-clamp-2"
            >
              A WordPress Commenter 发表在 Hello world!
            </Link>
          </div>
        </div>
      </div>

      {/* 归档 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Archives</h2>
        <div className="space-y-2">
          <div>
            <Link 
              href="/archives/2025/05" 
              className="text-gray-700 hover:text-blue-600"
            >
              2025 年 5 月
            </Link>
          </div>
        </div>
      </div>

      {/* 分类 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Categories</h2>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category.slug} className="flex justify-between items-center">
              <Link 
                href={`/category/${category.slug}`} 
                className="text-gray-700 hover:text-blue-600"
              >
                {category.name}
              </Link>
              <span className="text-gray-500 text-sm">({category.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 