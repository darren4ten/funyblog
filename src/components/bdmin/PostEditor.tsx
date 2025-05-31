"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getApiBaseUrl } from '../../lib/env';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface PostEditorProps {
  postId?: number;
  onClose?: () => void;
}

interface Post {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export default function PostEditor({ postId, onClose }: PostEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    } else {
      setLoading(false);
    }
  }, [postId]);

  const fetchPost = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${getApiBaseUrl()}/api/bdmin/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        console.error(`Failed to fetch post: ${res.status} ${res.statusText}`);
        throw new Error('网络请求失败');
      }
      const data = await res.json() as Post;
      setTitle(data.title || '');
      setContent(data.content || '');
      setCategory(data.category || '');
      setTags(Array.isArray(data.tags) ? data.tags.join(', ') : (typeof data.tags === 'string' ? data.tags : ''));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('无法加载文章内容，请检查网络或稍后再试。');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const method = postId ? 'PUT' : 'POST';
      const url = postId ? `${getApiBaseUrl()}/api/bdmin/posts/${postId}` : `${getApiBaseUrl()}/api/bdmin/posts`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          title,
          content,
          category,
          tags: tags.split(',').map(tag => tag.trim())
        })
      });
      if (!res.ok) throw new Error('网络请求失败');
      alert(postId ? '文章已更新' : '文章已创建');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('保存文章时出错');
    }
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{postId ? '编辑文章' : '新建文章'}</h2>
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">标题</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">分类</label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">标签 (逗号分隔)</label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">内容</label>
        <ReactQuill
          value={content}
          onChange={setContent}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          theme="snow"
        />
      </div>
      <div className="flex justify-end space-x-2">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            取消
          </button>
        )}
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          保存
        </button>
      </div>
    </div>
  );
}