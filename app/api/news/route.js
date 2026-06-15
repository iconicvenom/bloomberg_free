import { getNews } from '@/lib/newsApi';
import { getMarketNews } from '@/lib/finnhub';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'all';
  const q = searchParams.get('q') || '';

  let articles = await getNews({ category, q });

  // Fallback to Finnhub general news if NewsAPI returns nothing (e.g. rate limit).
  if (!articles || articles.length === 0) {
    const fh = await getMarketNews('general');
    articles = (fh || []).map((a) => ({
      id: String(a.id),
      headline: a.headline,
      summary: a.summary,
      source: a.source,
      url: a.url,
      image: a.image,
      publishedAt: a.datetime ? new Date(a.datetime * 1000).toISOString() : null,
      category,
    }));
  }

  return jsonResponse({ category, count: articles.length, articles, stale: articles.length === 0 });
}
