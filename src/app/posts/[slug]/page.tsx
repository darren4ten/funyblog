import Image from 'next/image'
import Link from 'next/link'
import { FaEye, FaHeart, FaComment, FaUser, FaCalendarAlt } from 'react-icons/fa'
import Banner from '@/components/Banner'
import Sidebar from '@/components/Sidebar'

interface PostPageProps {
  params: {
    slug: string
  }
}

export default function PostPage({ params }: PostPageProps) {
  // 模拟文章数据
  const post = {
    title: "cowabi.com申请首年免域名和主机",
    content: "访问Cowabi.com，开启首年免费域名和主机，注意需要绑定信用卡。第一步，访问网站注册 第二步，添加WordPress站点 注意,不要切中文，切中文看不到控制面板，...",
    date: "18 5 月, 2025",
    views: 0,
    likes: 0,
    comments: 0,
    author: "admin",
    category: "Uncategorized"
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <article className="lg:w-[calc(100%-320px)]">
            <div className="bg-white rounded-lg p-8 mb-8">
              <div className="mb-6">
                <Link 
                  href={`/category/${post.category.toLowerCase()}`}
                  className="bg-blue-500 text-white text-sm px-4 py-1 rounded-full hover:bg-blue-600 transition-colors"
                >
                  {post.category}
                </Link>
              </div>
              <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
              <div className="flex items-center gap-6 text-gray-500 text-sm mb-8">
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  <Link href={`/author/${post.author.toLowerCase()}`} className="hover:text-blue-600">
                    {post.author}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaEye className="text-gray-400" />
                  <span>{post.views} 浏览</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaHeart className="text-gray-400" />
                  <span>{post.likes} 点赞</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaComment className="text-gray-400" />
                  <span>{post.comments} 评论</span>
                </div>
              </div>
              <div className="aspect-[21/9] relative mb-8">
                <Image
                  src="/images/placeholder.jpg"
                  alt={post.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="prose max-w-none">
                <p>{post.content}</p>
              </div>
            </div>

            {/* 评论区 */}
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">评论</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">A WordPress Commenter</div>
                        <div className="text-sm text-gray-500">18 5 月, 2025</div>
                      </div>
                      <p className="text-gray-600">Hi, this is a comment. To get started with moderating, editing, and deleting comments, please visit the Comments screen in the dashboard.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 评论表单 */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">发表评论</h3>
                <form className="space-y-4">
                  <textarea
                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    rows={4}
                    placeholder="写下你的评论..."
                  />
                  <div className="flex gap-4">
                    <input
                      type="text"
                      className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="昵称"
                    />
                    <input
                      type="email"
                      className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="邮箱"
                    />
                    <input
                      type="url"
                      className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="网站"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    发表评论
                  </button>
                </form>
              </div>
            </div>
          </article>
          <div className="lg:w-[320px] flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  )
} 