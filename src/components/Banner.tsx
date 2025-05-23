'use client'

import Link from 'next/link'

export default function Banner() {
  return (
    <div className="h-[150px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center">
          <div className="flex flex-col">
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-100">
              藩篱在线
            </Link>
            <p className="text-[18px] text-white mt-2">专注于用户阅读体验的响应式博客主题</p>
          </div>
        </div>
      </div>
    </div>
  )
} 