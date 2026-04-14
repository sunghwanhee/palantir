"use client";

import { useState, useEffect } from "react";
import { NewsItem } from "@/lib/types";

type LangFilter = "ALL" | "EN" | "KO";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NewsFeed({ initialNews }: { initialNews: NewsItem[] }) {
  const [lang, setLang] = useState<LangFilter>("ALL");
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = lang === "ALL" ? "/api/news" : `/api/news?lang=${lang.toLowerCase()}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lang]);

  const filters: LangFilter[] = ["ALL", "EN", "KO"];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          News Feed
        </h2>
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setLang(f)}
              className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                lang === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="text-center text-gray-500 text-xs py-8">Loading...</div>
        ) : news.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-8">No articles found</div>
        ) : (
          news.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md bg-gray-800 border border-gray-700 p-3 hover:border-gray-500 hover:bg-gray-750 transition-colors group"
            >
              <div className="text-sm text-gray-200 group-hover:text-white leading-snug line-clamp-2">
                {item.title}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-gray-500">{item.source}</span>
                <span className="text-[10px] text-gray-600">·</span>
                <span className="text-[10px] text-gray-500">{timeAgo(item.publishedAt)}</span>
                {item.lang === "ko" && (
                  <>
                    <span className="text-[10px] text-gray-600">·</span>
                    <span className="text-[10px] bg-gray-700 text-gray-400 px-1 rounded">KO</span>
                  </>
                )}
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
