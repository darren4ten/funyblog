import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            潘离在线
          </Link>
          
          <div className="flex space-x-4">
            <Link href="/" className="hover:text-blue-600">
              首页
            </Link>
            <Link href="/category/technology" className="hover:text-blue-600">
              技术
            </Link>
            <Link href="/category/life" className="hover:text-blue-600">
              生活
            </Link>
            <Link href="/category/tutorial" className="hover:text-blue-600">
              教程
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 