export interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  closed: boolean;
  asOf?: string;
}

export interface SectorData {
  name: string;
  changePercent: number;
  symbol: string;
}

export interface MacroData {
  vix: {
    value: number;
    change: number;
    label: string;
  };
  fx: {
    usdKrw: number;
    eurUsd: number;
    usdJpy: number;
  };
  rates: {
    us10y: number;
    change: number;
    asOf: string;
  };
  commodities: {
    gold: number;
    goldChange: number;
    wti: number;
    wtiChange: number;
  };
}

export interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export interface NewsItem {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  lang: "ko" | "en";
}

export interface MarketData {
  indices: IndexData[];
  sectors: SectorData[];
  macro: MacroData;
  crypto: CryptoData[];
  updatedAt: string;
}
