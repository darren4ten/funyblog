"use client";

import { ApiBaseUrl, getApiBaseUrl } from '../../../lib/env';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../../lib/api';
import Posts from '../../../components/bdmin/Posts';

export default function ConsolePage() {
  const [siteName, setSiteName] = useState("我的博客");
  const [currentUser, setCurrentUser] = useState("未知用户");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("console");
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
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setIsAuthenticated(false);
          alert('未登录，3秒后跳转到登录页面');
          setTimeout(() => {
            router.push('/bdmin/login');
          }, 3000);
          return;
        }
        
        const res = await fetchWithAuth(`${getApiBaseUrl()}/api/bdmin/current-user`, {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        if (res.ok) {
          const data = await res.json() as { username?: string };
          setCurrentUser(data.username || "未知用户");
          setIsAuthenticated(true);
          setLoading(false);
        } else {
          setIsAuthenticated(false);
          alert('登录已过期，3秒后跳转到登录页面');
          localStorage.removeItem('auth_token');
          setTimeout(() => {
            router.push('/bdmin/login');
          }, 3000);
        }
      } catch (error) {
        console.error('校验权限出错:', error);
        setIsAuthenticated(false);
        setLoading(false);
        alert('发生错误，3秒后跳转到登录页面');
        setTimeout(() => {
          router.push('/bdmin/login');
        }, 3000);
      }
    };

    fetchSiteName();
    checkAuth();
  }, [router]);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      setActiveTab(hash);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    router.push('/bdmin/login');
  };

  const handleMenuClick = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">加载中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">未登录或登录已过期，即将跳转到登录页面...</p>
      </div>
    );
  }

  // 动态内容区域
  const renderContent = () => {
    if (activeTab === "console") {
      return (
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">控制台概览</h2>
          <p className="text-gray-500">这里是管理后台的控制台，您可以管理文章、分类、标签、评论等内容。</p>
          
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 卡片：文章管理 */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">文章管理</h3>
              <p className="text-gray-500 mb-4">创建、编辑和删除文章，管理文章分类和标签。</p>
              <button onClick={() => handleMenuClick('posts')} className="text-indigo-600 hover:text-indigo-500 font-medium">管理文章 &rarr;</button>
            </div>
            
            {/* 卡片：评论管理 */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">评论管理</h3>
              <p className="text-gray-500 mb-4">查看、审核和回复用户评论。</p>
              <button onClick={() => handleMenuClick('comments')} className="text-indigo-600 hover:text-indigo-500 font-medium">管理评论 &rarr;</button>
            </div>
            
            {/* 卡片：站点设置 */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">站点设置</h3>
              <p className="text-gray-500 mb-4">配置站点标题、描述和其他设置。</p>
              <button onClick={() => handleMenuClick('settings')} className="text-indigo-600 hover:text-indigo-500 font-medium">配置设置 &rarr;</button>
            </div>
          </div>
        </div>
      );
    } else if (activeTab === "posts") {
      return <Posts />;
    } else if (activeTab === "comments") {
      return (
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">评论管理</h2>
          <p className="text-gray-500">这里是评论管理的内容。</p>
        </div>
      );
    } else if (activeTab === "settings") {
      return (
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">站点设置</h2>
          <p className="text-gray-500">这里是站点设置的内容。</p>
        </div>
      );
    } else if (activeTab === "plugins") {
      return (
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">插件管理</h2>
          <p className="text-gray-500">这里是插件管理的内容。</p>
        </div>
      );
    } else {
      return (
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">未知页面</h2>
          <p className="text-gray-500">未找到对应的内容页面。</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow w-full">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              <Link href="/" className="hover:text-indigo-700 transition-colors">
                {siteName} 管理后台
              </Link>
            </h1>
            <p className="mt-1 text-sm text-gray-500">欢迎, {currentUser}</p>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            退出登录
          </button>
        </div>
      </header>

      {/* 主内容区域 */}
      <div className="flex flex-1">
        {/* 左侧菜单 */}
        <aside className="w-[214px] bg-white shadow">
          <nav className="px-4 py-5 space-y-1">
            <button onClick={() => handleMenuClick('console')} className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'console' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-700'}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              控制台
            </button>
            <button onClick={() => handleMenuClick('posts')} className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'posts' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-700'}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              文章管理
            </button>
            <button onClick={() => handleMenuClick('comments')} className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'comments' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-700'}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16L5 12a2 2 0 01-1-1.732l.043-4.527a2 2 0 011.401-1.916l4.182-1.045a2 2 0 011.148 0l4.178 1.045a2 2 0 011.4 1.916l.044 4.527A2 2 0 0115 12l-4 4m-2.5-7.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
              评论管理
            </button>
            <button onClick={() => handleMenuClick('settings')} className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'settings' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-700'}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 00.955.74c1.956.331 3.091 2.251 2.76 4.207a1.724 1.724 0 00.74.955c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-.74.955c-.331 1.956-2.251 3.091-4.207 2.76a1.724 1.724 0 00-.955.74c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-.955-.74c-1.956-.331-3.091-2.251-2.76-4.207a1.724 1.724 0 00-.74-.955c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00.74-.955c.331-1.956 2.251-3.091 4.207-2.76a1.724 1.724 0 00.955-.74z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              站点设置
            </button>
            <button onClick={() => handleMenuClick('plugins')} className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'plugins' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-700'}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V15h5.488" /></svg>
              插件管理
            </button>
          </nav>
        </aside>
        
        {/* 右侧内容区域 */}
        <div className="flex-1 p-2">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}