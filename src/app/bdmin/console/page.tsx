"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ConsolePage() {
  const [siteName, setSiteName] = useState("我的博客");
  const [currentUser, setCurrentUser] = useState("未知用户");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 获取站点名称
    const fetchSiteName = async () => {
      try {
        const res = await fetch('/api/site-settings');
        if (res.ok) {
          const data = await res.json() as { site_title?: string };
          setSiteName(data.site_title || "我的博客");
        }
      } catch (error) {
        console.error('获取站点名称出错:', error);
      }
    };

    // 获取当前用户信息并校验权限
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/current-user');
        if (res.ok) {
          const data = await res.json() as { username?: string };
          setCurrentUser(data.username || "未知用户");
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          alert('未登录，3秒后跳转到登录页面');
          setTimeout(() => {
            router.push('/bdmin/login');
          }, 3000);
        }
      } catch (error) {
        console.error('获取用户信息出错:', error);
        setIsAuthenticated(false);
        // 不在catch中重复显示提示信息，因为else分支已经处理了
        // 确保只在else分支中显示提示
      } finally {
        setLoading(false);
      }
    };

    fetchSiteName();
    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">正在验证权限，请稍候...</div>;
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">未登录，请登录后访问</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-blue-800 text-white p-3 flex justify-between items-center shadow-md">
        <Link href="/" className="text-xl font-bold">{siteName}</Link>
        <div className="text-sm">您好，{currentUser}</div>
      </div>
      
      <div className="mt-12 flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <div className="p-4 text-xl font-bold border-b">后台管理</div>
          <nav className="mt-4">
            <ul className="space-y-1">
              <li>
                <Link href="/bdmin/console" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">首页</Link>
              </li>
              <li>
                <Link href="/bdmin/posts" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">文章</Link>
              </li>
              <li>
                <Link href="/bdmin/comments" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">评论</Link>
              </li>
              <li>
                <Link href="/bdmin/appearance" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">外观</Link>
              </li>
              <li>
                <Link href="/bdmin/plugins" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">插件</Link>
              </li>
              <li>
                <Link href="/bdmin/users" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">用户</Link>
              </li>
              <li>
                <Link href="/bdmin/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">设置</Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">欢迎使用后台管理</h1>
          <p className="text-gray-600">在这里，您可以管理您的文章、评论、用户等内容。</p>
        </div>
      </div>
    </div>
  );
}