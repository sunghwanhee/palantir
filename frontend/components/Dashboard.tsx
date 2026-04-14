"use client";

import { useEffect, useState, useCallback } from "react";
import IndicesBar from "./IndicesBar";
import SectorHeatmap from "./SectorHeatmap";
import MacroPanel from "./MacroPanel";
import CryptoPanel from "./CryptoPanel";
import NewsFeed from "./NewsFeed";
import RefreshButton from "./RefreshButton";
import { MarketData, NewsItem } from "@/lib/types";

const FALLBACK_MARKET: MarketData = {
  indices: [],
  sectors: [],
  macro: {
    vix: { value: 0, change: 0, label: "Neutral" },
    fx: { usdKrw: 0, eurUsd: 0, usdJpy: 0 },
    rates: { us10y: 0, change: 0, asOf: "" },
    commodities: { gold: 0, goldChange: 0, wti: 0, wtiChange: 0 },
  },
  crypto: [],
  updatedAt: "—",
};

export default function Dashboard() {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [mRes, nRes] = await Promise.all([
        fetch("/api/market"),
        fetch("/api/news"),
      ]);
      if (!mRes.ok) throw new Error("market fetch failed");
      const [mData, nData] = await Promise.all([mRes.json(), nRes.json()]);
      setMarket(mData);
      setNews(nData);
    } catch {
      setError(true);
      setMarket(FALLBACK_MARKET);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const data = market ?? FALLBACK_MARKET;

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <IndicesBar indices={data.indices} />

      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <span className="text-[11px] text-gray-500">
          {loading ? "Loading..." : error ? "Data unavailable" : `Updated ${data.updatedAt}`}
        </span>
        <RefreshButton onRefresh={loadData} />
      </div>

      {loading ? (
        <div className="flex flex-col lg:flex-row flex-1 gap-4 p-4">
          <div className="flex flex-col gap-4 lg:flex-1">
            <Skeleton h="h-48" />
            <Skeleton h="h-64" />
            <Skeleton h="h-24" />
          </div>
          <div className="lg:w-80 xl:w-96">
            <Skeleton h="h-full min-h-[400px]" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row flex-1 gap-4 p-4">
          <div className="flex flex-col gap-4 lg:flex-1">
            <SectorHeatmap sectors={data.sectors} />
            <MacroPanel macro={data.macro} />
            <CryptoPanel crypto={data.crypto} />
          </div>
          <div className="lg:w-80 xl:w-96 flex flex-col min-h-[400px] lg:min-h-0 rounded-lg border border-gray-700 bg-gray-900 p-4">
            <NewsFeed initialNews={news} />
          </div>
        </div>
      )}
    </div>
  );
}

function Skeleton({ h }: { h: string }) {
  return (
    <div className={`rounded-lg border border-gray-800 bg-gray-900 animate-pulse ${h}`} />
  );
}
