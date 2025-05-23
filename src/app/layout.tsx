import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '潘离在线',
  description: '专注于用户阅读体验的响应式博客主题',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div suppressHydrationWarning>
          {children}
        </div>
        <footer className="bg-gray-800 text-white py-6">
          <div className="container mx-auto px-4 text-center">
            <p>COPYRIGHT © 2025 潘离在线. ALL RIGHTS RESERVED.</p>
            <p>THEME KRATOS MADE BY SEATON JIANG</p>
          </div>
        </footer>
      </body>
    </html>
  )
} 