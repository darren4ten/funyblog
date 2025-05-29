'use client'

import Link from 'next/link'

interface Archive {
  year: string
  month: string
  url: string
}

interface ArchivesProps {
  archives?: Archive[]
}

const defaultArchives: Archive[] = [
  {
    year: '2025',
    month: '5',
    url: '/archives/2025/05'
  }
]

export default function Archives({ archives = defaultArchives }: ArchivesProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold mb-4">Archives</h2>
      <div className="space-y-2">
        {archives.map((archive, index) => (
          <div key={index}>
            <Link 
              href={archive.url} 
              className="text-gray-700 hover:text-blue-600"
            >
              {archive.year} 年 {archive.month} 月
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}