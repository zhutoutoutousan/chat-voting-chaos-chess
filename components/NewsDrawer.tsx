import { NewsEffect, NewsArticle } from '@/lib/newsApi'
import { IconX } from '@tabler/icons-react'

interface NewsDrawerProps {
  isOpen: boolean
  onClose: () => void
  effects?: NewsEffect[]
  news?: NewsArticle
}

export function NewsDrawer({ isOpen, onClose, effects = [], news }: NewsDrawerProps) {
  return (
    <div 
      className={`fixed right-0 top-0 bottom-0 w-[400px] bg-neutral-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4 h-full overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Latest News</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-lg">
            <IconX className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* News Section */}
        {news && (
          <div className="space-y-6 mb-8">
            <div className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors">
              <div className="flex flex-col gap-4">
                {news.image_url && (
                  <img 
                    src={news.image_url} 
                    alt={news.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                )}
                <div>
                  <h3 className="font-medium text-amber-400 mb-2">
                    {news.title}
                  </h3>
                  <p className="text-sm text-neutral-300 mb-2 line-clamp-3">
                    {news.description || news.snippet}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <span>{news.source}</span>
                    <span>•</span>
                    <span>{new Date(news.published_at).toLocaleDateString()}</span>
                  </div>
                  <a 
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-amber-500 hover:text-amber-400"
                  >
                    Read full article →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Effects Section */}
        {effects.length > 0 && (
          <div className="space-y-6">
            {effects.map((effect) => (
              <div key={effect.uuid} className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors">
                <div className="flex flex-col gap-4">
                  {effect.image_url && (
                    <img 
                      src={effect.image_url} 
                      alt={effect.title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        effect.type === 'piece_multiply' ? 'bg-green-900 text-green-200' :
                        effect.type === 'piece_vanish' ? 'bg-red-900 text-red-200' :
                        'bg-blue-900 text-blue-200'
                      }`}>
                        {effect.type.split('_').join(' ')}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(effect.published_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-medium text-amber-400 mb-2">
                      {effect.title}
                    </h3>
                    
                    <p className="text-sm text-neutral-300 mb-2 line-clamp-3">
                      {effect.description || effect.snippet}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      <span>{effect.source}</span>
                      {effect.categories.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{effect.categories.join(', ')}</span>
                        </>
                      )}
                    </div>

                    <a 
                      href={effect.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm text-amber-500 hover:text-amber-400"
                    >
                      Read full article →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!news && effects.length === 0 && (
          <div className="text-center text-neutral-400 py-8">
            No news available
          </div>
        )}
      </div>
    </div>
  )
} 