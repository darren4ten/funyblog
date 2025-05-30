import { ApiBaseUrl, getApiBaseUrl } from '../../../lib/env';
import Image from 'next/image'
import Link from 'next/link'
import { FaEye, FaHeart, FaComment, FaUser, FaCalendarAlt } from 'react-icons/fa'
import Banner from '@/components/Banner'
import CommentSection from '@/components/CommentSection'
import Sidebar from '@/components/Sidebar'

interface PostPageProps {
  params: {
    slug: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const getPost = async (slug: string): Promise<any> => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/posts/${slug}`);
      if (!res.ok) throw new Error('网络请求失败');
      const data = await res.json() as Record<string, any>;
      console.log('Fetched post data:', data); // 调试信息
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      return {
        title: "Hello world!",
        content: "Welcome to WordPress. This is your first post. Edit or delete it, then start writing!",
        created_at: "18 5 月, 2025",
        views: 12,
        likes: 2,
        author: "admin",
        category: "Uncategorized",
        tags: ["暂无"],
        updated_at: "18 5 月, 2025"
      };
    }
  };

  const getComments = async (slug: string): Promise<any> => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/posts/${slug}/comments`);
      if (!res.ok) throw new Error('网络请求失败');
      const data = await res.json() as Record<string, any>;
      console.log('Fetched comments data:', data); // 调试信息
      return data.results || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const post = await getPost(params.slug);
  const comments = await getComments(params.slug);

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
                <div className="flex items-center gap-2">
                  <FaHeart className="text-gray-400" />
                  <span>{post.likes !== undefined ? post.likes : 0} 点赞</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaComment className="text-gray-400" />
                  <span>{comments !== undefined ? comments.length : 0} 评论</span>
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
                <p>{post.content}</p>
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
            <CommentSection comments={comments} postSlug={params.slug} />
          </article>
          <div className="lg:w-[320px] flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  )
} 