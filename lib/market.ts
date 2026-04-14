import { MarketData, IndexData, SectorData, MacroData, CryptoData } from "./types";

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";
const FRED_KEY = process.env.FRED_API_KEY ?? "";
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

function fetchWithTimeout(url: string, ms = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, {
    signal: controller.signal,
    headers: { "User-Agent": "Mozilla/5.0" },
    cache: "no-store",
  }).finally(() => clearTimeout(id));
}

async function yahooFetch(symbol: string) {
  try {
    const url = `${YAHOO_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
    const res = await fetchWithTimeout(url, 5000);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.chart?.result?.[0]?.meta ?? null;
  } catch {
    return null;
  }
}

// 병렬 요청을 청크로 나눠서 처리 (Vercel 과부하 방지)
async function fetchInChunks<T>(
  items: { symbol: string; name: string }[],
  fn: (symbol: string, name: string) => Promise<T>,
  chunkSize = 4
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.allSettled(
      chunk.map((item) => fn(item.symbol, item.name))
    );
    for (const r of chunkResults) {
      if (r.status === "fulfilled") results.push(r.value);
    }
  }
  return results;
}

const INDEX_LIST = [
  { symbol: "^KS11", name: "KOSPI" },
  { symbol: "^KQ11", name: "KOSDAQ" },
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "NASDAQ" },
  { symbol: "^DJI", name: "DOW" },
  { symbol: "^N225", name: "NIKKEI" },
  { symbol: "^GDAXI", name: "DAX" },
  { symbol: "^FTSE", name: "FTSE 100" },
  { symbol: "^HSI", name: "HANG SENG" },
  { symbol: "000001.SS", name: "SHANGHAI" },
];

const SECTOR_LIST = [
  { symbol: "XLK", name: "Technology" },
  { symbol: "XLE", name: "Energy" },
  { symbol: "XLF", name: "Financials" },
  { symbol: "XLV", name: "Healthcare" },
  { symbol: "XLY", name: "Cons. Disc." },
  { symbol: "XLI", name: "Industrials" },
  { symbol: "XLB", name: "Materials" },
  { symbol: "XLU", name: "Utilities" },
  { symbol: "XLRE", name: "Real Estate" },
  { symbol: "XLC", name: "Comm. Svcs" },
  { symbol: "XLP", name: "Cons. Staples" },
];

function vixLabel(value: number): string {
  if (value < 12) return "Extreme Greed";
  if (value < 20) return "Greed";
  if (value < 25) return "Neutral";
  if (value < 35) return "Fear";
  return "Extreme Fear";
}

function getPrice(m: Record<string, number> | null): number {
  return m?.regularMarketPrice ?? m?.previousClose ?? 0;
}
function getPrev(m: Record<string, number> | null): number {
  return m?.previousClose ?? getPrice(m);
}

async function fetchIndices(): Promise<IndexData[]> {
  return fetchInChunks(
    INDEX_LIST,
    async (symbol, name): Promise<IndexData> => {
      const meta = await yahooFetch(symbol);
      if (!meta) return { symbol, name, price: 0, change: 0, changePercent: 0, closed: true };
      const price = getPrice(meta);
      const prev = getPrev(meta);
      const change = price - prev;
      const changePercent = prev ? (change / prev) * 100 : 0;
      const closed = (meta.marketState ?? "CLOSED") === "CLOSED";
      return { symbol, name, price, change, changePercent, closed };
    },
    4
  );
}

async function fetchSectors(): Promise<SectorData[]> {
  return fetchInChunks(
    SECTOR_LIST,
    async (symbol, name): Promise<SectorData> => {
      const meta = await yahooFetch(symbol);
      const price = getPrice(meta);
      const prev = getPrev(meta);
      const changePercent = prev ? ((price - prev) / prev) * 100 : 0;
      return { symbol, name, changePercent };
    },
    4
  );
}

async function fetchMacro(): Promise<MacroData> {
  const macroSymbols = [
    { symbol: "^VIX", name: "vix" },
    { symbol: "KRW=X", name: "krw" },
    { symbol: "EURUSD=X", name: "eur" },
    { symbol: "JPY=X", name: "jpy" },
    { symbol: "GC=F", name: "gold" },
    { symbol: "CL=F", name: "wti" },
  ];

  const [vixMeta, usdKrwMeta, eurUsdMeta, usdJpyMeta, goldMeta, wtiMeta] =
    await Promise.all(macroSymbols.map((s) => yahooFetch(s.symbol)));

  const vixVal = getPrice(vixMeta) || 20;
  const vixPrev = getPrev(vixMeta) || vixVal;

  let us10y = 0;
  if (FRED_KEY) {
    try {
      const url = `${FRED_BASE}?series_id=DGS10&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`;
      const res = await fetchWithTimeout(url, 5000);
      if (res.ok) {
        const json = await res.json();
        us10y = parseFloat(json?.observations?.[0]?.value ?? "0") || 0;
      }
    } catch { /* ignore */ }
  }

  const goldPrice = getPrice(goldMeta);
  const wtiPrice = getPrice(wtiMeta);

  return {
    vix: { value: vixVal, change: vixVal - vixPrev, label: vixLabel(vixVal) },
    fx: {
      usdKrw: getPrice(usdKrwMeta),
      eurUsd: getPrice(eurUsdMeta),
      usdJpy: getPrice(usdJpyMeta),
    },
    rates: { us10y, change: 0, asOf: new Date().toISOString().split("T")[0] },
    commodities: {
      gold: goldPrice,
      goldChange: goldPrice && getPrev(goldMeta)
        ? ((goldPrice - getPrev(goldMeta)) / getPrev(goldMeta)) * 100 : 0,
      wti: wtiPrice,
      wtiChange: wtiPrice && getPrev(wtiMeta)
        ? ((wtiPrice - getPrev(wtiMeta)) / getPrev(wtiMeta)) * 100 : 0,
    },
  };
}

async function fetchCrypto(): Promise<CryptoData[]> {
  try {
    const url = `${COINGECKO_BASE}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetchWithTimeout(url, 5000);
    if (!res.ok) throw new Error();
    const json = await res.json();
    return [
      { symbol: "BTC", name: "Bitcoin", price: json.bitcoin?.usd ?? 0, change24h: json.bitcoin?.usd_24h_change ?? 0 },
      { symbol: "ETH", name: "Ethereum", price: json.ethereum?.usd ?? 0, change24h: json.ethereum?.usd_24h_change ?? 0 },
    ];
  } catch {
    return [
      { symbol: "BTC", name: "Bitcoin", price: 0, change24h: 0 },
      { symbol: "ETH", name: "Ethereum", price: 0, change24h: 0 },
    ];
  }
}

export async function getMarketData(): Promise<MarketData> {
  try {
    // indices와 sectors는 순차 처리 (각 4개씩 청크)
    // macro와 crypto는 병렬 처리
    const [indices, sectors, macro, crypto] = await Promise.all([
      fetchIndices(),
      fetchSectors(),
      fetchMacro(),
      fetchCrypto(),
    ]);

    const kstTime = new Date(Date.now() + 9 * 3600 * 1000);
    const updatedAt = kstTime.toISOString().replace("T", " ").slice(0, 16) + " KST";

    return { indices, sectors, macro, crypto, updatedAt };
  } catch {
    const kstTime = new Date(Date.now() + 9 * 3600 * 1000);
    const updatedAt = kstTime.toISOString().replace("T", " ").slice(0, 16) + " KST";
    return {
      indices: [],
      sectors: [],
      macro: {
        vix: { value: 0, change: 0, label: "Neutral" },
        fx: { usdKrw: 0, eurUsd: 0, usdJpy: 0 },
        rates: { us10y: 0, change: 0, asOf: "" },
        commodities: { gold: 0, goldChange: 0, wti: 0, wtiChange: 0 },
      },
      crypto: [],
      updatedAt,
    };
  }
}
