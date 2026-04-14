"use client";

import { CryptoData } from "@/lib/types";

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function CryptoPanel({ crypto }: { crypto: CryptoData[] }) {
  return (
    <div className="rounded-lg border border-gray-700 p-4 bg-gray-900">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Crypto
      </h2>
      <div className="flex gap-4">
        {crypto.map((c) => {
          const up = c.change24h > 0;
          const down = c.change24h < 0;
          const color = up ? "text-green-400" : down ? "text-red-400" : "text-gray-400";
          const sign = up ? "+" : "";
          return (
            <div
              key={c.symbol}
              className="flex-1 rounded-md bg-gray-800 border border-gray-700 p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-300 uppercase">{c.symbol}</span>
                <span className={`text-xs font-medium ${color}`}>
                  {sign}{c.change24h.toFixed(2)}%
                </span>
              </div>
              <div className="text-lg font-mono font-bold text-white">
                ${c.price > 0 ? fmt(c.price) : "—"}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">24h</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
