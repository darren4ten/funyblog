'use client'

import Link from 'next/link'

export default function Banner() {
  return (
    <div className="relative h-[300px] w-full overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
        <Link href="/" className="text-2xl mb-2 hover:text-gray-200">
          潘离在线
        </Link>
        <h2 className="text-4xl font-bold mb-4">Kratos</h2>
        <p className="text-lg">专注于用户阅读体验的响应式博客主题</p>
      </div>
    </div>
  )
} 