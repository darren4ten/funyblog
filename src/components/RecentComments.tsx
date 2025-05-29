'use client'

import Link from 'next/link'

interface Comment {
  id: number
  author: string
  postTitle: string
  postSlug: string
}

interface RecentCommentsProps {
  comments?: Comment[]
}

const defaultComments: Comment[] = [
  {
    id: 1,
    author: 'admin',
    postTitle: 'Hello world!',
    postSlug: 'hello-world'
  },
  {
    id: 2,
    author: 'A WordPress Commenter',
    postTitle: 'Hello world!',
    postSlug: 'hello-world'
  }
]

export default function RecentComments({ comments = defaultComments }: RecentCommentsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold mb-4">Recent Comments</h2>
      <div className="space-y-3">
        {comments.map(comment => (
          <div key={comment.id}>
            <Link 
              href={`/posts/${comment.postSlug}#comments`} 
              className="text-gray-700 hover:text-blue-600 line-clamp-2"
            >
              {comment.author} 发表在 {comment.postTitle}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}