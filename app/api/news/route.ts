import { NextRequest, NextResponse } from "next/server";
import { getNews } from "@/lib/news";

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? undefined;
  const news = await getNews(lang);
  return NextResponse.json(news, {
    headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" },
  });
}
