'use client'

import RecentPosts from './RecentPosts'
import RecentComments from './RecentComments'
import Archives from './Archives'
import Categories from './Categories'

interface Post {
  id: number
  title: string
  slug: string
}

interface Comment {
  id: number
  author: string
  postTitle: string
  postSlug: string
}

interface Archive {
  year: string
  month: string
  url: string
}

interface Category {
  name: string
  slug: string
  count: number
}

interface SidebarProps {
  recentPosts?: Post[]
  recentComments?: Comment[]
  archives?: Archive[]
  categories?: Category[]
}

const defaultPosts: Post[] = [
  {
    id: 1,
    title: 'cowabi.com申请首年免费域名和主机',
    slug: 'cowabi-free-domain'
  },
  {
    id: 2,
    title: 'Hello world!',
    slug: 'hello-world'
  }
]

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

const defaultArchives: Archive[] = [
  {
    year: '2025',
    month: '5',
    url: '/archives/2025/05'
  }
]

const defaultCategories: Category[] = [
  {
    name: 'Uncategorized',
    slug: 'uncategorized',
    count: 2
  }
]

export default function Sidebar({
  recentPosts = defaultPosts,
  recentComments = defaultComments,
  archives = defaultArchives,
  categories = defaultCategories
}: SidebarProps) {
  return (
    <div className="space-y-6">
      <RecentPosts />
      <RecentComments comments={recentComments} />
      <Archives archives={archives} />
      <Categories categories={categories} />
    </div>
  )
}