'use client'

import { FaComment } from 'react-icons/fa'
import Link from 'next/link'

interface CommentSectionProps {
  comments: any[];
  postSlug: string;
}

export default function CommentSection({ comments, postSlug }: CommentSectionProps) {
  return (
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
          <div className="flex flex-col gap-4 md:flex-row">
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
  )
}