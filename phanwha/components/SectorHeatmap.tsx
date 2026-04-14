"use client";

import { SectorData } from "@/lib/types";

function getColor(pct: number): string {
  const abs = Math.min(Math.abs(pct), 3);
  const intensity = abs / 3;

  if (pct > 0) {
    const g = Math.round(80 + intensity * 100);
    return `rgba(22, ${g}, 74, ${0.4 + intensity * 0.6})`;
  } else if (pct < 0) {
    const r = Math.round(150 + intensity * 75);
    return `rgba(${r}, 20, 20, ${0.4 + intensity * 0.6})`;
  }
  return "rgba(75, 85, 99, 0.4)";
}

function getTextColor(pct: number): string {
  if (pct > 0) return "#4ade80";
  if (pct < 0) return "#f87171";
  return "#9ca3af";
}

export default function SectorHeatmap({ sectors }: { sectors: SectorData[] }) {
  return (
    <div className="rounded-lg border border-gray-700 p-4 bg-gray-900">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        US Sector Heatmap
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {sectors.map((s) => (
          <div
            key={s.symbol}
            className="rounded-md p-2 flex flex-col items-center justify-center text-center"
            style={{ background: getColor(s.changePercent) }}
          >
            <span className="text-[11px] text-gray-200 font-medium leading-tight">
              {s.name}
            </span>
            <span
              className="text-sm font-bold mt-1"
              style={{ color: getTextColor(s.changePercent) }}
            >
              {s.changePercent > 0 ? "+" : ""}
              {s.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
