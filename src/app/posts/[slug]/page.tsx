import Image from 'next/image'
import Link from 'next/link'
import { FaEye, FaHeart, FaComment, FaUser, FaCalendarAlt } from 'react-icons/fa'
import Banner from '@/components/Banner'
import Sidebar from '@/components/Sidebar'

interface PostPageProps {
  params: {
    slug: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const getPost = async (slug: string): Promise<any> => {
    try {
      const res = await fetch(`http://127.0.0.1:8787/api/posts/${slug}`);
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
      const res = await fetch(`http://127.0.0.1:8787/api/posts/${slug}/comments`);
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
                  <Link href={`/author/${post.author ? post.author.toLowerCase() : 'anonymous'}`} className="hover:text-blue-600">
                    {post.author || 'Anonymous'}
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
                  {post.tags && post.tags.map((tag: string, index: number) => (
                    <Link
                      key={index}
                      href={`/tag/${tag}`}
                      className="bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  最后更新：{post.updated_at || '未知日期'}
                </div>
              </div>
            </div>

            {/* 评论区 */}
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
                <form className="space-y-4">
                  <textarea
                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    rows={4}
                    placeholder="写下你的评论..."
                  />
                  <div className="flex gap-4">
                    <input
                      type="text"
                      className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="昵称"
                    />
                    <input
                      type="email"
                      className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="邮箱"
                    />
                    <input
                      type="url"
                      className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="网站"
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
          </article>
          <div className="lg:w-[320px] flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  )
} 