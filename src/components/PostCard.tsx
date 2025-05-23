'use client'

import Link from 'next/link'
import { FaEye, FaHeart, FaComment } from 'react-icons/fa'
import Avatar from './Avatar'

interface PostCardProps {
  title: string
  excerpt: string
  date: string
  views: number
  likes: number
  comments: number
  author: string
  category: string
  slug: string
}

export default function PostCard({
  title,
  excerpt,
  date,
  views,
  likes,
  comments,
  author,
  category,
  slug,
}: PostCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar name={author} size={40} />
          <div>
            <Link
              href={`/author/${author.toLowerCase()}`}
              className="font-medium hover:text-blue-600"
            >
              {author}
            </Link>
            <div className="text-sm text-gray-500">{date}</div>
          </div>
        </div>
        <Link
          href={`/posts/${slug}`}
          className="text-xl font-bold hover:text-blue-600 block mb-2"
        >
          {title}
        </Link>
        <Link 
          href={`/category/${category.toLowerCase()}`} 
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          {category}
        </Link>
      </div>
      <p className="text-gray-700 mb-4">{excerpt}</p>
      <div className="flex items-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <FaEye className="text-gray-400" />
          <span>{views}点热度</span>
        </div>
        <div className="flex items-center gap-1">
          <FaHeart className="text-gray-400" />
          <span>{likes}人点赞</span>
        </div>
        <div className="flex items-center gap-1">
          <FaComment className="text-gray-400" />
          <span>{comments}条评论</span>
        </div>
      </div>
    </article>
  )
} 