import { Chess } from 'chess.js'

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY
const LLM_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

export interface NewsEffect {
  // Chaos effect type
  type: 'piece_swap' | 'random_move' | 'piece_multiply' | 'piece_vanish'
  // News API fields
  uuid: string
  title: string
  description: string
  keywords: string
  snippet: string
  url: string
  image_url: string | null
  language: string
  published_at: string
  source: string
  categories: string[]
  relevance_score: number | null
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

  // Take only the first 3 articles for effects
  for (const article of articles.slice(0, 3)) {
    const text = `${article.title} ${article.description}`
    const sentiment = await analyzeSentiment(text)
    
    effects.push({
      type: sentiment === 'positive' ? 'piece_multiply' :
            sentiment === 'negative' ? 'piece_vanish' : 'random_move',
      // Map all API fields
      uuid: article.uuid,
      title: article.title,
      description: article.description || '',
      keywords: article.keywords || '',
      snippet: article.snippet || '',
      url: article.url,
      image_url: article.image_url,
      language: article.language || 'en',
      published_at: article.published_at,
      source: article.source,
      categories: article.categories || [],
      relevance_score: article.relevance_score
    })
  }

  return effects
}

export async function fetchNewsForPlayers(player1: string, player2: string, page: number = 1) {
  try {
    const searchQuery = `"${player1}" + 'and' + "${player2}"`;
    const categories = 'sports,general';
    const searchFields = 'title,description,keywords';
    const sort = 'relevance_score';
    const limit = '3';

    const url = new URL('https://api.thenewsapi.com/v1/news/all');
    url.searchParams.append('api_token', NEWS_API_KEY || '');
    url.searchParams.append('search', searchQuery);
    url.searchParams.append('categories', categories);
    url.searchParams.append('search_fields', searchFields);
    url.searchParams.append('sort', sort);
    url.searchParams.append('limit', limit);
    url.searchParams.append('language', 'en');
    url.searchParams.append('page', page.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    
    // Return both the news data and meta information
    return {
      news: data.data.map(article => ({
        type: 'random_move' as const,
        uuid: article.uuid,
        title: article.title,
        description: article.description || '',
        keywords: article.keywords || '',
        snippet: article.snippet || '',
        url: article.url,
        image_url: article.image_url,
        language: article.language || 'en',
        published_at: article.published_at,
        source: article.source,
        categories: article.categories || [],
        relevance_score: article.relevance_score
      })),
      meta: data.meta
    };
  } catch (error) {
    console.error('Error fetching player news:', error);
    return { news: [], meta: { found: 0, returned: 0, limit: 3, page } };
  }
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

const API_KEY = process.env.NEXT_PUBLIC_THENEWSAPI_KEY

interface NewsArticle {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url: string | null;
  published_at: string;
  source: string;
  categories: string[];
}

interface NewsResponse {
  meta: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
  data: NewsArticle[];
}

export async function getChessNews(): Promise<NewsArticle[]> {
  try {
    // Build search query with URL encoding
    const searchQuery = encodeURIComponent('chess + (tournament | championship | grandmaster)');
    const categories = 'sports,general';
    const searchFields = 'title,description,keywords';
    const sort = 'relevance_score';
    const limit = '5';

    const url = new URL('https://api.thenewsapi.com/v1/news/all');
    url.searchParams.append('api_token', NEWS_API_KEY || '');
    url.searchParams.append('search', searchQuery);
    url.searchParams.append('categories', categories);
    url.searchParams.append('search_fields', searchFields);
    url.searchParams.append('sort', sort);
    url.searchParams.append('limit', limit);
    url.searchParams.append('language', 'en');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    
    // Map and sanitize the response
    return data.data.map(article => ({
      ...article,
      // Ensure required fields exist
      title: article.title || 'Untitled',
      description: article.description || article.snippet || 'No description available',
      url: article.url || '#',
      image_url: article.image_url || null,
      published_at: article.published_at || new Date().toISOString(),
      source: article.source || 'Unknown Source',
      categories: article.categories || []
    }));
  } catch (error) {
    console.error('Error fetching chess news:', error);
    // Return mock data in case of error
    return [
      {
        uuid: '1',
        title: 'Magnus Carlsen Wins Another Tournament',
        description: 'The World Champion continues his dominance in competitive chess.',
        snippet: 'Full coverage of the tournament...',
        url: 'https://chess.com',
        image_url: null,
        published_at: new Date().toISOString(),
        source: 'Chess.com',
        categories: ['sports', 'chess']
      },
      {
        uuid: '2',
        title: 'Upcoming Chess Championship Announced',
        description: 'FIDE announces dates for the next World Chess Championship cycle.',
        snippet: 'Details about the championship...',
        url: 'https://fide.com',
        image_url: null,
        published_at: new Date().toISOString(),
        source: 'FIDE',
        categories: ['sports', 'chess']
      },
      {
        uuid: '3',
        title: 'Chess AI Makes Breakthrough',
        description: 'New developments in chess artificial intelligence.',
        snippet: 'Latest in chess technology...',
        url: 'https://chess.com/news',
        image_url: null,
        published_at: new Date().toISOString(),
        source: 'Chess.com',
        categories: ['tech', 'chess']
      }
    ];
  }
} 