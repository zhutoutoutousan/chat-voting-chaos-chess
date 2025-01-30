import { X } from "lucide-react"

interface NewsArticle {
  source?: { id: string | null; name: string }
  author?: string
  title?: string
  description?: string
  url?: string
  urlToImage?: string
  publishedAt?: string
  content?: string
}

interface NewsDrawerProps {
  news: NewsArticle
  isOpen: boolean
  onClose: () => void
}

export function NewsDrawer({ news, isOpen, onClose }: NewsDrawerProps) {
  return (
    <div className={`
      fixed inset-y-0 right-0 w-96 bg-gray-800 shadow-xl transform transition-transform duration-300
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">News Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {news.urlToImage && (
          <img 
            src={news.urlToImage} 
            alt={news.title || 'News image'}
            className="w-full h-48 object-cover rounded mb-4"
          />
        )}

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">{news.title}</h4>
          <p className="text-gray-300 text-sm">{news.description}</p>
          
          <div className="text-sm text-gray-400">
            <p>Source: {news.source?.name || 'Unknown'}</p>
            <p>Author: {news.author || 'Unknown'}</p>
            <p>Published: {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString() : 'Unknown'}</p>
          </div>

          <div className="text-sm text-gray-300">{news.content}</div>

          {news.url && (
            <a 
              href={news.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Read Full Article
            </a>
          )}
        </div>
      </div>
    </div>
  )
} 