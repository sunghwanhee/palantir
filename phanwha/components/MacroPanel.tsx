"use client";

import { MacroData } from "@/lib/types";

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-gray-800 last:border-0">
      <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      <div className="text-right">
        <span className="text-sm text-white font-mono">{value}</span>
        {sub && <span className="text-xs text-gray-500 ml-1">{sub}</span>}
      </div>
    </div>
  );
}

function VixBadge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    "Extreme Greed": "bg-green-800 text-green-300",
    "Greed": "bg-green-900 text-green-400",
    "Neutral": "bg-gray-700 text-gray-300",
    "Fear": "bg-red-900 text-red-400",
    "Extreme Fear": "bg-red-800 text-red-300",
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${colors[label] ?? "bg-gray-700 text-gray-400"}`}>
      {label}
    </span>
  );
}

function fmt(n: number, dec = 2) {
  return n.toLocaleString("en-US", { maximumFractionDigits: dec, minimumFractionDigits: dec });
}

function changeStr(n: number, unit = "") {
  const sign = n > 0 ? "+" : "";
  const color = n > 0 ? "text-green-400" : n < 0 ? "text-red-400" : "text-gray-400";
  return <span className={`text-xs ${color}`}>{sign}{fmt(n)}{unit}</span>;
}

export default function MacroPanel({ macro }: { macro: MacroData }) {
  const { vix, fx, rates, commodities } = macro;
  return (
    <div className="rounded-lg border border-gray-700 p-4 bg-gray-900 space-y-4">
      {/* VIX */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Fear &amp; Greed (VIX)
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white font-mono">{fmt(vix.value)}</span>
          <div className="flex items-center gap-2">
            {changeStr(vix.change)}
            <VixBadge label={vix.label} />
          </div>
        </div>
      </div>

      {/* FX */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">FX</h2>
        <Row label="USD/KRW" value={`₩${fx.usdKrw > 0 ? fmt(fx.usdKrw, 0) : "—"}`} />
        <Row label="EUR/USD" value={fx.eurUsd > 0 ? fmt(fx.eurUsd) : "—"} />
        <Row label="USD/JPY" value={fx.usdJpy > 0 ? fmt(fx.usdJpy) : "—"} />
      </div>

      {/* Rates */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Rates</h2>
        <Row
          label="US 10Y Yield"
          value={rates.us10y > 0 ? `${fmt(rates.us10y)}%` : "—"}
          sub={rates.asOf ? `as of ${rates.asOf}` : undefined}
        />
      </div>

      {/* Commodities */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Commodities</h2>
        <Row
          label="Gold (XAU)"
          value={commodities.gold > 0 ? `$${fmt(commodities.gold, 0)}` : "—"}
          sub={commodities.gold > 0 ? undefined : undefined}
        />
        {commodities.gold > 0 && (
          <div className="flex justify-end -mt-1 mb-1">
            {changeStr(commodities.goldChange, "%")}
          </div>
        )}
        <Row
          label="WTI Oil"
          value={commodities.wti > 0 ? `$${fmt(commodities.wti)}` : "—"}
        />
        {commodities.wti > 0 && (
          <div className="flex justify-end -mt-1">
            {changeStr(commodities.wtiChange, "%")}
          </div>
        )}
      </div>
    </div>
  );
}
