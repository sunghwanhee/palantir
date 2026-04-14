"use client";

import { IndexData } from "@/lib/types";

function fmt(n: number, dec = 2) {
  return n.toLocaleString("en-US", { maximumFractionDigits: dec });
}

function ChangeLabel({ pct }: { pct: number }) {
  const color =
    pct > 0 ? "text-green-400" : pct < 0 ? "text-red-400" : "text-gray-400";
  const sign = pct > 0 ? "+" : "";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {sign}{fmt(pct)}%
    </span>
  );
}

export default function IndicesBar({ indices }: { indices: IndexData[] }) {
  return (
    <div className="w-full bg-gray-900 border-b border-gray-700">
      <div className="flex flex-wrap gap-x-6 gap-y-2 px-4 py-3">
        {indices.map((idx) => (
          <div key={idx.symbol} className="flex items-center gap-2 min-w-[120px]">
            <span className="text-gray-300 text-xs font-semibold tracking-wide uppercase">
              {idx.name}
            </span>
            <span className="text-white text-sm font-mono">
              {idx.price > 0 ? fmt(idx.price) : "—"}
            </span>
            {idx.price > 0 && <ChangeLabel pct={idx.changePercent} />}
            {idx.closed && (
              <span className="text-[10px] bg-gray-700 text-gray-400 px-1 rounded">
                CLOSED
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
