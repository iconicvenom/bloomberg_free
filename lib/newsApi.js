// NewsAPI server-side client.
import { serverFetch } from './serverFetch';

const BASE = 'https://newsapi.org/v2';
const KEY = () => process.env.NEWS_API_KEY || '';

const CATEGORY_QUERIES = {
  all: 'stock market OR economy OR finance OR earnings',
  equities: 'stocks OR equities OR shares OR Nasdaq OR "S&P 500"',
  economy: 'economy OR GDP OR inflation OR unemployment OR CPI',
  'central banks': 'Federal Reserve OR ECB OR "interest rates" OR central bank',
  crypto: 'cryptocurrency OR bitcoin OR ethereum OR crypto',
  commodities: 'oil OR gold OR commodities OR "crude oil" OR natural gas',
  'm&a': 'merger OR acquisition OR takeover OR "M&A"',
  earnings: 'earnings OR quarterly results OR profit OR revenue',
  ipo: 'IPO OR "initial public offering" OR listing',
};

export async function getNews({ category = 'all', q, pageSize = 40 } = {}) {
  const query = q || CATEGORY_QUERIES[category] || CATEGORY_QUERIES.all;
  const params = new URLSearchParams({
    q: query,
    sortBy: 'publishedAt',
    language: 'en',
    pageSize: String(pageSize),
    apiKey: KEY(),
  });
  const { ok, data } = await serverFetch(`${BASE}/everything?${params.toString()}`, { ttl: 120000 });
  if (!ok || !data || data.status !== 'ok') return [];
  return (data.articles || []).map((a, i) => ({
    id: `${a.publishedAt}-${i}`,
    headline: a.title,
    summary: a.description,
    source: a.source?.name || 'Unknown',
    url: a.url,
    image: a.urlToImage,
    publishedAt: a.publishedAt,
    content: a.content,
    category,
  }));
}
