import { NewsItem } from "./types";

const NEWS_API_KEY = process.env.NEWS_API_KEY ?? "";
const NEWS_BASE = "https://newsapi.org/v2/everything";

function detectLang(title: string): "ko" | "en" {
  return /[\uAC00-\uD7AF]/.test(title) ? "ko" : "en";
}

export async function getNews(lang?: string): Promise<NewsItem[]> {
  let articles: NewsItem[] = [];

  if (NEWS_API_KEY) {
    const queries = [
      "stock market OR S&P500 OR NASDAQ OR economy",
      "Federal Reserve OR interest rate OR inflation",
      "KOSPI OR Korean stock",
    ];

    for (const q of queries) {
      try {
        const params = new URLSearchParams({
          q,
          language: lang === "ko" ? "ko" : "en",
          sortBy: "publishedAt",
          pageSize: "10",
          apiKey: NEWS_API_KEY,
        });
        const res = await fetch(`${NEWS_BASE}?${params}`, { next: { revalidate: 900 } });
        if (!res.ok) continue;
        const json = await res.json();
        const items: NewsItem[] = (json.articles ?? []).map(
          (a: { title: string; source: { name: string }; publishedAt: string; url: string }) => ({
            title: a.title,
            source: a.source?.name ?? "",
            publishedAt: a.publishedAt,
            url: a.url,
            lang: detectLang(a.title),
          })
        );
        articles.push(...items);
      } catch { continue; }
    }

    const seen = new Set<string>();
    articles = articles
      .filter((a) => { if (seen.has(a.url)) return false; seen.add(a.url); return true; })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 30);
  }

  if (articles.length === 0) {
    articles = getMockNews();
  }

  if (lang && lang !== "ALL") {
    articles = articles.filter((n) => n.lang === lang.toLowerCase());
  }

  return articles;
}

function getMockNews(): NewsItem[] {
  const now = Date.now();
  return [
    { title: "Markets steady as Fed signals rate hold into summer", source: "Reuters", publishedAt: new Date(now).toISOString(), url: "#", lang: "en" },
    { title: "S&P 500 edges higher amid tech rally", source: "Bloomberg", publishedAt: new Date(now - 3600000).toISOString(), url: "#", lang: "en" },
    { title: "코스피, 외국인 순매수에 상승 마감", source: "연합뉴스", publishedAt: new Date(now - 7200000).toISOString(), url: "#", lang: "ko" },
    { title: "Gold holds gains as dollar weakens", source: "CNBC", publishedAt: new Date(now - 10800000).toISOString(), url: "#", lang: "en" },
    { title: "Bitcoin crosses key resistance level", source: "CoinDesk", publishedAt: new Date(now - 14400000).toISOString(), url: "#", lang: "en" },
    { title: "한국은행, 기준금리 동결 결정", source: "한국경제", publishedAt: new Date(now - 18000000).toISOString(), url: "#", lang: "ko" },
    { title: "Oil prices slip on demand concerns", source: "Reuters", publishedAt: new Date(now - 21600000).toISOString(), url: "#", lang: "en" },
    { title: "Tech sector leads gains on strong earnings", source: "WSJ", publishedAt: new Date(now - 25200000).toISOString(), url: "#", lang: "en" },
  ];
}
