'use client'

import { ApiBaseUrl, getApiBaseUrl } from '../lib/env';
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Comment {
  id: number
  author_name: string
  post_title: string
  post_slug: string
}

export default function RecentComments() {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/comments?limit=5`);
        if (!res.ok) throw new Error('网络请求失败');
        const data = await res.json() as Record<string, any>;
        setComments(data.results || data || []);
      } catch (error) {
        console.error('Error fetching recent comments:', error);
        setComments([
          {
            id: 1,
            author_name: 'admin',
            post_title: 'Hello world!',
            post_slug: 'hello-world'
          },
          {
            id: 2,
            author_name: 'A WordPress Commenter',
            post_title: 'Hello world!',
            post_slug: 'hello-world'
          }
        ]);
      }
    };

    fetchComments();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold mb-4">最新评论</h2>
      <div className="space-y-3">
        {comments.map(comment => (
          <div key={comment.id}>
            <Link
              href={`/posts/${comment.post_slug}#comments`}
              className="text-gray-700 hover:text-blue-600 line-clamp-2"
            >
              {comment.author_name} 发表在 {comment.post_title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}