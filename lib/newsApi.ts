import { Chess } from 'chess.js'

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY
const LLM_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

export interface NewsEffect {
  type: 'piece_swap' | 'random_move' | 'piece_multiply' | 'piece_vanish'
  description: string
  // News article fields
  source: {
    id: string | null
    name: string
  }
  author: string
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  content: string
}

interface OpenRouterResponse {
  choices: [{
    message: {
      content: string
    }
  }]
}

async function analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LLM_API_KEY}`,
      "HTTP-Referer": "https://chess.com",
      "X-Title": "Chess News Analysis",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "openai/gpt-3.5-turbo",
      "messages": [
        {
          "role": "system",
          "content": "You are analyzing news sentiment. Respond with only one word: 'positive', 'negative', or 'neutral'."
        },
        {
          "role": "user",
          "content": `Analyze the sentiment of this news: "${text}"`
        }
      ]
    })
  })

  const data = await response.json() as OpenRouterResponse
  const sentiment = data.choices[0]?.message?.content?.toLowerCase().trim() || 'neutral'
  return sentiment as 'positive' | 'negative' | 'neutral'
}

export async function generateEffectsFromNews(articles: any[]): Promise<NewsEffect[]> {
  const effects: NewsEffect[] = []

  for (const article of articles) {
    const text = `${article.title} ${article.description}`
    const sentiment = await analyzeSentiment(text)
    
    effects.push({
      type: sentiment === 'positive' ? 'piece_multiply' :
            sentiment === 'negative' ? 'piece_vanish' : 'random_move',
      description: `${sentiment} news effect: "${article.title}"`,
      // Include all article fields
      ...article
    })
  }

  return effects
}

export async function fetchNewsForPlayers(player1: string, player2: string) {
  const response = await fetch(
    `https://newsapi.org/v2/everything?` +
    `q=${encodeURIComponent(`"${player1}" AND "${player2}"`)}&` +
    `sortBy=relevancy&` +
    `apiKey=${NEWS_API_KEY}`
  )
  
  const data = await response.json()
  return data.articles || []
}

export function applyNewsEffect(game: Chess, effect: NewsEffect) {
  switch (effect.type) {
    case 'piece_swap':
      // Implement piece swapping logic
      break
    case 'random_move':
      // Implement random move logic
      break
    case 'piece_multiply':
      // Implement piece multiplication logic
      break
    case 'piece_vanish':
      // Implement piece vanishing logic
      break
  }
}

const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY

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

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export async function getChessNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=chess&sortBy=relevancy&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    
    // Map and sanitize the response
    return data.articles.map(article => ({
      ...article,
      // Ensure required fields exist
      title: article.title || 'Untitled',
      description: article.description || 'No description available',
      url: article.url || '#',
      urlToImage: article.urlToImage || null,
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: {
        id: article.source?.id || null,
        name: article.source?.name || 'Unknown Source'
      }
    }));
  } catch (error) {
    console.error('Error fetching chess news:', error);
    // Return mock data in case of error
    return [
      {
        source: { id: null, name: 'Chess.com' },
        author: 'Chess.com Staff',
        title: 'Magnus Carlsen Wins Another Tournament',
        description: 'The World Champion continues his dominance in competitive chess.',
        url: 'https://chess.com',
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        content: 'Full article content...'
      },
      {
        source: { id: null, name: 'FIDE' },
        author: 'FIDE Press',
        title: 'Upcoming Chess Championship Announced',
        description: 'FIDE announces dates for the next World Chess Championship cycle.',
        url: 'https://fide.com',
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        content: 'Full article content...'
      },
      // Add more mock articles as needed
    ];
  }
} 