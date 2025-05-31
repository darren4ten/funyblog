"use client";

import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../../lib/env';

export default function Comments() {
  const [comments, setComments] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [currentPage, refreshKey]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${getApiBaseUrl()}/api/bdmin/comments?page=${currentPage}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!res.ok) throw new Error('网络请求失败');
      const response = await res.json() as { comments: any[], pagination: { totalPages: number, currentPage: number, totalCount: number, limit: number } };
      console.log('API Response:', response); // 调试输出
      const commentsData = Array.isArray(response.comments) ? response.comments : [];
      setComments(commentsData);
      setTotalPages(response.pagination ? response.pagination.totalPages : 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = async (commentId: number, status: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/bdmin/comments/${commentId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('网络请求失败');
      setRefreshKey(prevKey => prevKey + 1);
      alert(`评论状态已更新为：${status}`);
    } catch (error) {
      console.error('Error updating comment status:', error);
      alert('更新评论状态失败，请稍后再试');
    }
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">评论管理</h2>

      <div className="shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">内容</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作者</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文章</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comments.map((comment) => (
              <tr key={comment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{comment.content}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.author_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.post_title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.created_at}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button onClick={() => handleStatusChange(comment.id, 'approved')} className="text-green-600 hover:text-green-900">同意</button>
                  <button onClick={() => handleStatusChange(comment.id, 'rejected')} className="ml-2 text-red-600 hover:text-red-900">拒绝</button>
                  <button onClick={() => handleStatusChange(comment.id, 'pending')} className="ml-2 text-yellow-600 hover:text-yellow-900">搁置</button>
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
    </div>
  );
}