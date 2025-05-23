'use client'

import Link from 'next/link'
import Banner from '@/components/Banner'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-gray-100">
      <Banner />
      <div className="h-[calc(100vh-180px)] relative">
        <div className="absolute top-[calc(40%-100px)] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-3">404</h1>
              <p className="text-lg text-gray-600 mb-6">抱歉，您访问的页面不存在</p>
              <Link
                href="/"
                className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 