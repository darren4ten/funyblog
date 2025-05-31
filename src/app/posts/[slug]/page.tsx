"use client";

import { ApiBaseUrl, getApiBaseUrl } from '../../../lib/env';
import Image from 'next/image'
import Link from 'next/link'
import { FaEye, FaHeart, FaComment, FaUser, FaCalendarAlt } from 'react-icons/fa'
import Banner from '@/components/Banner'
import CommentSection from '@/components/CommentSection'
import Sidebar from '@/components/Sidebar'
import { useState, useEffect } from 'react'

interface PostPageProps {
  params: {
    slug: string
  }
}

export default function PostPage({ params }: PostPageProps) {
  const { slug } = params;
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 获取文章数据
      const res = await fetch(`${getApiBaseUrl()}/api/posts/${slug}`);
      if (!res.ok) {
        console.error('Error fetching post');
        return;
      }
      const postData = await res.json() as any;
      setPost(postData);
      setLikes(postData.likes || 0);

      // 获取评论数据
      const commentsRes = await fetch(`${getApiBaseUrl()}/api/posts/${slug}/comments`);
      const commentsData = commentsRes.ok ? await commentsRes.json() as any : { results: [] };
      setComments(commentsData.results || []);

      // 检查是否已点赞
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      setLiked(!!likedPosts[slug]);

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  const handleLike = async () => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    const isLiked = !!likedPosts[slug];

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/posts/${slug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isLiked })
      });

      if (!res.ok) {
        throw new Error('点赞失败');
      }

      if (isLiked) {
        likedPosts[slug] = false;
        setLikes(likes - 1);
      } else {
        likedPosts[slug] = true;
        setLikes(likes + 1);
      }
      setLiked(!isLiked);
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } catch (error) {
      console.error('点赞错误:', error);
      alert('点赞失败，请稍后再试');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <article className="lg:w-[calc(100%-320px)]">
            <div className="bg-white rounded-lg p-8 mb-8">
              {/* 面包屑导航 */}
              <div className="flex items-center gap-2 text-sm mb-6">
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  首页
                </Link>
                <span className="text-gray-400">/</span>
                <Link
                  href={`/category/${post.category ? post.category.toLowerCase() : 'uncategorized'}`}
                  className="text-gray-600 hover:text-blue-600"
                >
                  {post.category || 'Uncategorized'}
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900">正文</span>
              </div>
              <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
              <div className="flex items-center gap-6 text-gray-500 text-sm mb-8">
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  <Link href={`/author/${post.author_name ? post.author_name.toLowerCase() : 'anonymous'}`} className="hover:text-blue-600">
                    {post.author_name || 'Anonymous'}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <span>{post.created_at || '未知日期'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaEye className="text-gray-400" />
                  <span>{post.views !== undefined ? post.views : 0} 浏览</span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onClick={handleLike}>
                  <FaHeart className={liked ? 'text-red-500' : 'text-gray-400'} />
                  <span>{likes} 点赞</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaComment className="text-gray-400" />
                  <span>{comments.length} 评论</span>
                </div>
              </div>
              <div className="aspect-[21/9] relative mb-8">
                <Image
                  src="/images/placeholder.jpg"
                  alt={post.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>

              {/* 文章底部信息 */}
              <div className="flex flex-wrap items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>标签：</span>
                  {post.tags ? (
                    post.tags.split(',').map((tag: string, index: number) => (
                      <Link
                        key={index}
                        href={`/tag/${tag}`}
                        className="bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))
                  ) : (
                    <span className="text-gray-500">暂无标签</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  最后更新：{post.updated_at || '未知日期'}
                </div>
              </div>
            </div>

            {/* 评论区 */}
            <CommentSection comments={comments} postSlug={slug} />
          </article>
          <div className="lg:w-[320px] flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
