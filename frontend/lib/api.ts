import { MarketData, NewsItem } from "./types";

export async function fetchMarketData(): Promise<MarketData> {
  const res = await fetch("/api/market", { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch market data");
  return res.json();
}

export async function fetchNews(lang?: string): Promise<NewsItem[]> {
  const url = lang && lang !== "ALL" ? `/api/news?lang=${lang}` : "/api/news";
  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}
