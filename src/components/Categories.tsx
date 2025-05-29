'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Category {
  id: number
  name: string
  slug: string
  count: number
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8787/api/categories');
        if (!res.ok) throw new Error('网络请求失败');
        const data = await res.json() as Record<string, any>;
        setCategories(data.results || data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([
          {
            id: 1,
            name: 'Uncategorized',
            slug: 'uncategorized',
            count: 2
          }
        ]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold mb-4">分类</h2>
      <div className="space-y-2">
        {categories.map(category => (
          <div key={category.slug} className="flex justify-between items-center">
            <Link
              href={`/category/${category.slug}`}
              className="text-gray-700 hover:text-blue-600"
            >
              {category.name}
            </Link>
            <span className="text-gray-500 text-sm">({category.count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}