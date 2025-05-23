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
    <aside className="lg:w-1/3">
      {/* 搜索框 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">搜索</h2>
        <form className="flex" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="搜索..."
            className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 最近文章 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
        <ul className="space-y-4">
          {recentPosts.map(post => (
            <li key={post.id}>
              <Link href={`/posts/${post.slug}`} className="text-blue-600 hover:text-blue-700">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 最近评论 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Comments</h2>
        <ul className="space-y-4">
          <li>
            <Link href="/posts/hello-world#comments" className="text-gray-600 hover:text-blue-600">
              admin 发表在 Hello world!
            </Link>
          </li>
          <li>
            <Link href="/posts/hello-world#comments" className="text-gray-600 hover:text-blue-600">
              A WordPress Commenter 发表在 Hello world!
            </Link>
          </li>
        </ul>
      </div>

      {/* 归档 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Archives</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/archives/2025/05" className="text-gray-600 hover:text-blue-600">
              2025 年 5 月
            </Link>
          </li>
        </ul>
      </div>

      {/* 分类 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <ul className="space-y-2">
          {categories.map(category => (
            <li key={category.slug}>
              <Link href={`/category/${category.slug}`} className="text-gray-600 hover:text-blue-600">
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
} 