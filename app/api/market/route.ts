import { NextResponse } from "next/server";
import { getMarketData } from "@/lib/market";

export async function GET() {
  const data = await getMarketData();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
  });
}
