import { articles } from '@/lib/articles'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { User } from 'lucide-react'
import { ConstructionNotice } from "@/components/ui/construction-notice"
import { Spotlight } from "@/components/ui/spotlight"
import { getChessNews } from '@/lib/newsApi'

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find(a => a.slug === params.slug)
  const news = await getChessNews()
  
  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <article className="max-w-4xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center text-sm text-gray-400">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <span>{article.author.name}</span>
            </div>
            <span className="mx-2">•</span>
            <span>{article.date}</span>
            <span className="mx-2">•</span>
            <span>{article.readingTime} read</span>
          </div>
        </header>

        <div className="prose prose-invert prose-lg mx-auto mb-16">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>,
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
              li: ({ children }) => <li className="text-gray-300">{children}</li>,
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Related Chess News Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Spotlight className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Latest Chess News</h2>
            <div className="grid gap-4">
              {news.slice(0, 5).map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {item.urlToImage && (
                      <img
                        src={item.urlToImage}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-lg text-amber-400 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date(item.publishedAt).toLocaleDateString()} • {item.source.name}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </Spotlight>
        </div>
      </article>

      <div className="container mx-auto px-4">
        <ConstructionNotice />
      </div>
    </div>
  )
} 