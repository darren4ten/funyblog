import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export async function getSiteSettings() {
  try {
    const res = await fetch('http://127.0.0.1:8787/api/site-settings');
    if (!res.ok) throw new Error('网络请求失败');
    const data = await res.json() as Record<string, any>;
    return data;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return {
      site_title: '潘离在线',
      site_subtitle: '专注于用户阅读体验的响应式博客主题',
      footer_main_content: 'COPYRIGHT © 2025 潘离在线. ALL RIGHTS RESERVED.',
      footer_subtitle: 'THEME KRATOS MADE BY SEATON JIANG'
    };
  }
}

export async function metadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.site_title,
    description: settings.site_subtitle,
  };
}

export default async function RootLayout({
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
            <p>{(await getSiteSettings()).footer_main_content}</p>
            <p>{(await getSiteSettings()).footer_subtitle}</p>
          </div>
        </footer>
      </body>
    </html>
  )
} 