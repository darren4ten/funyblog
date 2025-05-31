"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiBaseUrl } from '../../lib/env';
import PostEditor from './PostEditor';

export default function Posts() {
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const savedPageSize = localStorage.getItem('postsPerPage');
    return savedPageSize ? parseInt(savedPageSize, 10) : 10;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  const handlePostSaved = () => {
    setEditingPostId(null);
    setRefreshKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, pageSize, refreshKey]);

  useEffect(() => {
    localStorage.setItem('postsPerPage', pageSize.toString());
  }, [pageSize]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/posts?page=${currentPage}&limit=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('网络请求失败');
      const data = await res.json() as { results: any[], total: number };
      console.log("API Data:", data); // 调试信息
      const fetchedPosts = Array.isArray(data.results) ? data.results : [];
      setPosts(fetchedPosts);
      setTotalPages(Math.ceil(data.total / pageSize));
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddPost = () => {
    setEditingPostId(-1); // 使用 -1 表示新增文章
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('未登录或登录已过期，请重新登录');
        return;
      }
      const res = await fetch(`${getApiBaseUrl()}/api/bdmin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          alert('登录已过期，请重新登录');
          localStorage.removeItem('auth_token');
          window.location.href = '/bdmin/login';
        } else {
          throw new Error('网络请求失败');
        }
      } else {
        setRefreshKey(prevKey => prevKey + 1);
        alert('文章已成功删除');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('删除文章失败，请稍后再试');
    }
  };

  if (editingPostId !== null) {
    return (
      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
        <PostEditor postId={editingPostId > 0 ? editingPostId : undefined} onClose={() => handlePostSaved()} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">文章管理</h2>
      <div className="flex justify-between mb-4">
        <button onClick={handleAddPost} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          新增文章
        </button>
        <div className="text-sm text-gray-500">总文章数: {totalCount}</div>
      </div>

      <div className="shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作者</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    <Link href={`/posts/${post.slug}`} className="text-indigo-600 hover:text-indigo-900">
                      {post.title}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.created_at}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button onClick={() => setEditingPostId(post.id)} className="text-indigo-600 hover:text-indigo-900">编辑</button>
                  <button onClick={() => {
                    if (confirm('您确定要删除这篇文章吗？此操作无法撤销。')) {
                      handleDeletePost(post.id);
                    }
                  }} className="ml-2 text-red-600 hover:text-red-900">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="mr-4 relative inline-flex items-center">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // 重置到第一页
            }}
            className="px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-md"
          >
            <option value={5}>5 每页</option>
            <option value={10}>10 每页</option>
            <option value={20}>20 每页</option>
            <option value={50}>50 每页</option>
          </select>
        </div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            首页
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            上一页
          </button>
          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            {currentPage}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            下一页
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            最后一页
          </button>
        </nav>
      </div>
      {editingPostId ? (
        <div className="mt-6">
          <PostEditor postId={editingPostId} onClose={() => setEditingPostId(null)} />
        </div>
      ) : null}
    </div>
  );
}