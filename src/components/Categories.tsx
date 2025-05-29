'use client'

import Link from 'next/link'

interface Category {
  name: string
  slug: string
  count: number
}

interface CategoriesProps {
  categories?: Category[]
}

const defaultCategories: Category[] = [
  {
    name: 'Uncategorized',
    slug: 'uncategorized',
    count: 2
  }
]

export default function Categories({ categories = defaultCategories }: CategoriesProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold mb-4">Categories</h2>
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