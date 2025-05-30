import { ApiBaseUrl, getApiBaseUrl } from '../../../lib/env';
import Link from 'next/link'
import { FaEye, FaHeart, FaComment, FaUser, FaCalendarAlt } from 'react-icons/fa'
import Banner from '@/components/Banner'
import Sidebar from '@/components/Sidebar'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const getCategoryPosts = async (slug: string): Promise<any> => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/categories/${slug}/posts`);
      if (!res.ok) throw new Error('网络请求失败');
      const data = await res.json() as Record<string, any>;
      console.log('Fetched category posts:', data); // 调试信息
      return data.results || [];
    } catch (error) {
      console.error('Error fetching category posts:', error);
      return [];
    }
  };

  const getCategoryInfo = async (slug: string): Promise<any> => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/categories`);
      if (!res.ok) throw new Error('网络请求失败');
      const data = await res.json() as Record<string, any>;
      const categories = data.results || data || [];
      return categories.find((cat: any) => cat.slug === slug) || { name: '未知分类' };
    } catch (error) {
      console.error('Error fetching category info:', error);
      return { name: '未知分类' };
    }
  };

  const posts = await getCategoryPosts(params.slug);
  const category = await getCategoryInfo(params.slug);

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-[calc(100%-320px)]">
            <h1 className="text-3xl font-bold mb-6">分类: {category.name}</h1>
            <div className="space-y-8">
              {posts.length > 0 ? (
                posts.map((post: any) => (
                  <div key={post.id} className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-2">
                      <Link href={`/posts/${post.slug}`} className="text-gray-900 hover:text-blue-600">
                        {post.title}
                      </Link>
                    </h2>
                    <div className="flex items-center gap-6 text-gray-500 text-sm mb-4">
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
                        <span>{post.comments_count !== undefined ? post.comments_count : 0} 评论</span>
                      </div>
                    </div>
                    <p className="text-gray-600">{post.content.slice(0, 200)}...</p>
                    <Link href={`/posts/${post.slug}`} className="text-blue-600 hover:underline mt-4 block">
                      阅读更多
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">该分类下暂无文章</p>
              )}
            </div>
          </div>
          <div className="lg:w-[320px] flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  )
}