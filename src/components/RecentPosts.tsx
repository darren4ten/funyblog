'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Post {
  id: number
  title: string
  slug: string
}

export default function RecentPosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8787/api/posts?limit=5');
        if (!res.ok) throw new Error('网络请求失败');
        const data = await res.json() as Record<string, any>;
        setPosts(data.results || data || []);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
        setPosts([
          {
            id: 1,
            title: 'cowabi.com申请首年免费域名和主机',
            slug: 'cowabi-free-domain'
          },
          {
            id: 2,
            title: 'Hello world!',
            slug: 'hello-world'
          }
        ]);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold mb-4">最近文章</h2>
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id}>
            <Link
              href={`/posts/${post.slug}`}
              className="text-gray-700 hover:text-blue-600 line-clamp-2"
            >
              {post.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}