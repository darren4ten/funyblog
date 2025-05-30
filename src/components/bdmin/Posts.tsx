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
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  const handlePostSaved = () => {
    setEditingPostId(null);
    setRefreshKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, refreshKey]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/posts?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('网络请求失败');
      const data = await res.json() as { results: any[], total: number };
      setPosts(data.results || []);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddPost = () => {
    router.push('/bdmin/posts/edit');
  };

  if (editingPostId) {
    return (
      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
        <PostEditor postId={editingPostId} onClose={() => handlePostSaved()} />
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
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.created_at}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button onClick={() => setEditingPostId(post.id)} className="text-indigo-600 hover:text-indigo-900">编辑</button>
                  <button className="ml-2 text-red-600 hover:text-red-900">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            上一页
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === page ? 'text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            下一页
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