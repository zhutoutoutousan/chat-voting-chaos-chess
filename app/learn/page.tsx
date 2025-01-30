import { articles } from '@/lib/articles'
import { getChessNews } from '@/lib/newsApi'
import { Spotlight } from "@/components/ui/spotlight"
import { ConstructionNotice } from "@/components/ui/construction-notice"
import Link from 'next/link'
import { IconBook, IconNews } from "@tabler/icons-react"

interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

export default async function LearnPage() {
  let news: NewsArticle[] = [];
  try {
    news = await getChessNews();
  } catch (error) {
    console.error('Failed to fetch news:', error);
    // The function will return mock data in case of error
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Learn Chess
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Master the game with our comprehensive guides and stay updated with the latest chess news
          </p>
        </div>

        {/* Articles Section */}
        <Spotlight className="p-6 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <IconBook className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-white">Featured Articles</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Link 
                key={article.slug}
                href={`/learn/${article.slug}`}
                className="block p-6 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                <h3 className="text-xl font-semibold text-amber-400 mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-300 mb-4 line-clamp-2">
                  {article.description}
                </p>
                <div className="flex items-center text-sm text-gray-400">
                  <span>{article.author.name}</span>
                  <span className="mx-2">•</span>
                  <span>{article.date}</span>
                  <span className="mx-2">•</span>
                  <span>{article.readingTime} read</span>
                </div>
              </Link>
            ))}
          </div>
        </Spotlight>

        {/* News Section */}
        {news.length > 0 && (
          <Spotlight className="p-6 mb-12">
            <div className="flex items-center gap-3 mb-8">
              <IconNews className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-white">Latest Chess News</h2>
            </div>
            <div className="grid gap-6">
              {news.slice(0, 5).map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex items-start gap-6">
                    {item.urlToImage && (
                      <img
                        src={item.urlToImage}
                        alt={item.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-amber-400 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-300 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-400">
                        <span>{item.source.name}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </Spotlight>
        )}

        <ConstructionNotice />
      </div>
    </div>
  )
} 