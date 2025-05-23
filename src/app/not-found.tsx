'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="text-[200px] leading-none relative flex items-center">
        <span className="text-gray-800">4</span>
        <div className="w-[160px] h-[160px] mx-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-6xl">
          0
        </div>
        <span className="text-gray-800">4</span>
      </div>
      <h1 className="text-2xl font-bold mt-8 mb-4">很抱歉，你访问的页面不存在</h1>
      <p className="text-gray-600 mb-8">可能是输入地址有误或该地址已被删除</p>
      <div className="space-x-4">
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          返回主页
        </Link>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.history.back()
          }}
          className="inline-block px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          返回上页
        </Link>
      </div>
    </div>
  )
} 