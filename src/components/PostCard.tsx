'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaEye, FaHeart, FaComment, FaUser } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../lib/env'

interface PostCardProps {
  title: string
  excerpt: string
  date: string
  views: number
  likes: number
  comments: number
  author: string
  category: string
  categorySlug?: string
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
  categorySlug,
  slug,
}: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [currentLikes, setCurrentLikes] = useState(likes)

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}')
    setLiked(!!likedPosts[slug])
  }, [slug])

  const handleLike = async () => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}')
    const isLiked = !!likedPosts[slug]

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/posts/${slug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isLiked })
      })

      if (!res.ok) {
        throw new Error('点赞失败')
      }

      if (isLiked) {
        likedPosts[slug] = false
        setCurrentLikes(currentLikes - 1)
      } else {
        likedPosts[slug] = true
        setCurrentLikes(currentLikes + 1)
      }
      setLiked(!isLiked)
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
    } catch (error) {
      console.error('点赞错误:', error)
      alert('点赞失败，请稍后再试')
    }
  }

  return (
    <article className="bg-white rounded-lg overflow-hidden flex">
      <div className="w-64 relative bg-gray-200">
        <Image
          src="/images/placeholder.jpg"
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 p-6">
        <div className="flex flex-col h-full">
          <Link
            href={`/category/${categorySlug || category.toLowerCase()}`}
            className="bg-blue-500 text-white text-sm px-4 py-1 rounded-full self-start mb-3 hover:bg-blue-600 transition-colors"
          >
            {category}
          </Link>
          <Link
            href={`/posts/${slug}`}
            className="text-xl font-bold hover:text-blue-600 mb-3 line-clamp-2"
          >
            {title}
          </Link>
          <p className="text-gray-600 mb-auto line-clamp-2">{excerpt}</p>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <FaUser className="text-gray-400" />
              <Link
                href={`/author/${author.toLowerCase()}`}
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                {author}
              </Link>
              <span className="text-gray-300 mx-2">|</span>
              <span className="text-sm text-gray-500">{date}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FaEye className="text-gray-400" />
                <span>{views}</span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer" onClick={handleLike}>
                <FaHeart className={liked ? 'text-red-500' : 'text-gray-400'} />
                <span>{currentLikes}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaComment className="text-gray-400" />
                <span>{comments}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}