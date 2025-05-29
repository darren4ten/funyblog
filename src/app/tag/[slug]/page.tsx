import Banner from '@/components/Banner'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'

interface TagPageProps {
  params: {
    slug: string
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const getPostsByTag = async (tagSlug: string): Promise<any> => {
    try {
      const res = await fetch(`http://127.0.0.1:8787/api/tags/${tagSlug}/posts`);
      if (!res.ok) throw new Error('网络请求失败');
      const data = await res.json() as Record<string, any>;
      console.log('Fetched posts by tag:', data); // 调试信息
      return data.results || data || [];
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
      return [];
    }
  };

  const posts = await getPostsByTag(params.slug);

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-[calc(100%-320px)]">
            <h1 className="text-3xl font-bold mb-6">标签: {params.slug}</h1>
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post: any) => (
                  <div key={post.slug}>
                    <PostCard
                      title={post.title}
                      excerpt={post.summary || (post.content ? post.content.substring(0, 200) + '...' : '')}
                      date={new Date(post.created_at).toLocaleDateString('zh-CN')}
                      views={post.views}
                      likes={post.likes}
                      comments={post.comments_count}
                      author={post.author_name}
                      category={post.category || "Uncategorized"}
                      categorySlug={post.category_slug || "uncategorized"}
                      slug={post.slug}
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-500">没有找到与标签 {params.slug} 相关的文章。</p>
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