'use client'

import { useState } from 'react';
import { FaComment } from 'react-icons/fa'
import Link from 'next/link'
import { getApiBaseUrl } from '../lib/env';

interface CommentSectionProps {
  comments: any[];
  postSlug: string;
}

export default function CommentSection({ comments, postSlug }: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证
    if (!content.trim()) {
      setError('评论内容不能为空');
      return;
    }
    if (!authorName.trim()) {
      setError('昵称不能为空');
      return;
    }
    if (content.length > 500) {
      setError('评论内容不能超过500个字符');
      return;
    }
    if (authorName.length > 10) {
      setError('昵称不能超过10个字符');
      return;
    }
    
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          author_name: authorName,
          author_email: email,
          author_website: website
        })
      });
      
      if (!res.ok) {
        throw new Error('提交评论失败');
      }
      
      // 重置表单
      setContent('');
      setAuthorName('');
      setEmail('');
      setWebsite('');
      setError('');
      alert('评论已提交');
      // 刷新页面或更新评论列表
      window.location.reload();
    } catch (err) {
      setError('提交评论时出错，请稍后再试');
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">评论</h2>
      <div className="space-y-6">
        {comments && comments.length > 0 ? (
          comments.map((comment: any, index: number) => (
            <div key={index} className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{comment.author_name || 'Anonymous'}</div>
                    <div className="text-sm text-gray-500">{comment.created_at || '未知日期'}</div>
                  </div>
                  <p className="text-gray-600">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">暂无评论</p>
        )}
      </div>

      {/* 评论表单 */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">发表评论</h3>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <textarea
            className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            rows={4}
            placeholder="写下你的评论..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="昵称"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
            <input
              type="email"
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="url"
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="网站"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            发表评论
          </button>
        </form>
      </div>
    </div>
  )
}