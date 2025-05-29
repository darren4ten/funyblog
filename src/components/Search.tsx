'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SearchResult {
  id: number
  title: string
  slug: string
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const fetchResults = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`http://127.0.0.1:8787/api/search?query=${encodeURIComponent(query)}&limit=5`)
        if (!res.ok) throw new Error('网络请求失败')
        const data = await res.json() as Record<string, any>
        setResults(data.results || data || [])
      } catch (error) {
        console.error('Error fetching search results:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchResults, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索文章..."
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
      />
      {query.trim() && (
        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
          {isLoading ? (
            <div className="p-3 text-gray-500">搜索中...</div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <Link
                key={result.id}
                href={`/posts/${result.slug}`}
                className="block p-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
              >
                {result.title}
              </Link>
            ))
          ) : (
            <div className="p-3 text-gray-500">未找到匹配的文章</div>
          )}
        </div>
      )}
    </div>
  )
}