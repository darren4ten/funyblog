'use client'

import { useState } from 'react'
import Avatar from './Avatar'

interface Comment {
  id: number
  author: {
    name: string
  }
  content: string
  created_at: string
}

interface CommentSectionProps {
  comments: Comment[]
  postSlug: string
}

export default function CommentSection({ comments, postSlug }: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit comment')
      }

      // 清空评论框并刷新页面以显示新评论
      setContent('')
      window.location.reload()
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('提交评论失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-4">评论 ({comments.length})</h2>
      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar name={comment.author.name} size={32} />
              <div>
                <div className="font-medium">{comment.author.name}</div>
                <div className="text-sm text-gray-500">{comment.created_at}</div>
              </div>
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">发表评论</h3>
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
          rows={4}
          placeholder="写下你的评论..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? '提交中...' : '提交评论'}
        </button>
      </form>
    </section>
  )
} 