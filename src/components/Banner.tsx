'use client'

import Link from 'next/link'

export default function Banner() {
  return (
    <div className="h-[150px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between">
          <div className="flex flex-col">
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-100">
              藩篱在线
            </Link>
            <p className="text-[18px] text-white mt-2">专注于用户阅读体验的响应式博客主题</p>
          </div>
          
          {/* 搜索框 */}
          <form className="flex" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="搜索..."
              className="w-64 px-4 py-2 text-sm border border-transparent rounded-l focus:outline-none focus:border-white bg-white/10 text-white placeholder-white/60"
            />
            <button
              type="submit"
              className="px-6 py-2 text-sm bg-white/10 text-white rounded-r border border-transparent hover:bg-white/20 transition-colors"
            >
              搜索
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 