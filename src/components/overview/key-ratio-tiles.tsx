"use client";

import { formatPrice, formatINR } from "@/lib/utils";
import type { ScreenerData } from "@/types/screener";

interface StatCellProps {
  label: string;
  value: string;
  sublabel?: string | null;
  sublabelColor?: "up" | "down" | "muted";
  isRange?: boolean;
  rangePosition?: number | null; /* 0–100 % position of current price in 52w range */
}

function StatCell({ label, value, sublabel, sublabelColor = "muted", isRange, rangePosition }: StatCellProps) {
  const sublabelStyle: React.CSSProperties =
    sublabelColor === "up"
      ? { background: "var(--qc-up-soft)", color: "var(--qc-up)" }
      : sublabelColor === "down"
      ? { background: "var(--qc-down-soft)", color: "var(--qc-down)" }
      : { color: "var(--qc-text-muted)" };

  const isDeltaChip = sublabelColor === "up" || sublabelColor === "down";

  return (
    <div className="stat relative min-w-0 flex flex-col justify-between px-5 py-4">
      {/* Vertical divider via CSS pseudo — simulated with border-left on non-first */}
      <div
        className="stat-k mb-2.5 flex items-center gap-1.5"
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "var(--qc-text-muted)", textTransform: "uppercase" }}
      >
        {label}
      </div>

      {isRange ? (
        /* 52W range layout */
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[13px] font-medium" style={{ letterSpacing: "-0.005em", color: "var(--qc-text-heading)" }}>
            {value}
          </div>
          {rangePosition != null && (
            <div className="relative h-[3px] rounded-full" style={{ background: "var(--qc-border-default)" }}>
              <div
                className="absolute top-0 bottom-0 left-0 rounded-full"
                style={{ width: `${rangePosition}%`, background: "var(--qc-accent-primary)" }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2"
                style={{
                  left: `calc(${rangePosition}% - 5px)`,
                  background: "var(--qc-accent-primary)",
                  borderColor: "var(--qc-surface-white)",
                  boxShadow: "0 0 0 1px var(--qc-border-default)",
                }}
              />
            </div>
          )}
          {sublabel && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "var(--qc-text-muted)", letterSpacing: "0.04em" }}>
              {sublabel}
            </div>
          )}
        </div>
      ) : (
        <>
          <div
            className="stat-v flex items-baseline gap-2 leading-none whitespace-nowrap"
            style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--qc-text-heading)", fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </div>
          {sublabel && (
            isDeltaChip ? (
              <div
                className="mt-2 inline-flex items-center self-start rounded"
                style={{
                  ...sublabelStyle,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "3px 7px",
                  borderRadius: 6,
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}
              >
                {sublabel}
              </div>
            ) : (
              <div
                className="mt-2"
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "var(--qc-text-muted)", letterSpacing: "0.04em" }}
              >
                {sublabel}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

interface Props {
  data: ScreenerData;
}

export function KeyRatioTiles({ data }: Props) {
  const qt = data.quote;
  const ps = data.perShare;
  const fin = data.financials;
  const ks = data.keyStats;

  // CMP
  const priceDisplay = qt.price != null ? formatPrice(qt.price, 0) : "—";
  const priceChange = qt.changePercent;
  const priceChangeSublabel = priceChange != null
    ? `${priceChange >= 0 ? "▲ +" : "▼ "}${(priceChange * 100).toFixed(1)}% today`
    : null;

  // Market Cap
  const marketCapDisplay = qt.marketCap != null ? formatINR(qt.marketCap) : "—";
  const marketCapLabel = qt.marketCapLabel ?? null;

  // 52W Range
  const week52Low = qt.week52Low;
  const week52High = qt.week52High;
  const week52Display = week52Low != null && week52High != null
    ? `${formatPrice(week52Low, 0)}–${formatPrice(week52High, 0)}`
    : "—";
  const week52Spread = week52Low != null && week52High != null && week52Low > 0
    ? `±${Math.round(((week52High - week52Low) / week52Low) * 100)}%`
    : null;
  const week52Position = week52Low != null && week52High != null && qt.price != null && week52High !== week52Low
    ? Math.round(((qt.price - week52Low) / (week52High - week52Low)) * 100)
    : null;

  // EPS CAGR 3Y
  const epsCagrRaw = fin.eps_cagr_3y;
  const epsCagrDisplay = epsCagrRaw != null
    ? `${epsCagrRaw >= 0 ? "+" : ""}${(epsCagrRaw * 100).toFixed(1)}%`
    : ks.earningsQuarterlyGrowth != null
      ? `${ks.earningsQuarterlyGrowth >= 0 ? "+" : ""}${(ks.earningsQuarterlyGrowth * 100).toFixed(1)}%`
      : "—";
  const epsCagrIsPositive = epsCagrDisplay !== "—" && !epsCagrDisplay.startsWith("-");
  const epsCagrLabel = fin.eps_cagr_3y_label ?? null;

  // Dividend Yield
  const divYield = ps.dividendYield != null ? `${(ps.dividendYield * 100).toFixed(1)}%` : "—";

  return (
    <div className="px-4 pt-4 pb-2">
      {/* stats-plank: single bordered card, dividers between cells */}
      <div
        className="grid grid-cols-5 overflow-hidden"
        style={{
          background: "var(--qc-surface-white)",
          border: "1px solid var(--qc-border-default)",
          borderRadius: 16,
          boxShadow: "0 1px 0 var(--qc-border-subtle)",
        }}
      >
        {/* Each cell gets a left border except the first, simulating the dividers */}
        {[
          <StatCell
            key="cmp"
            label="CMP"
            value={priceDisplay}
            sublabel={priceChangeSublabel}
            sublabelColor={(priceChange ?? 0) >= 0 ? "up" : "down"}
          />,
          <StatCell
            key="mktcap"
            label="Market Cap"
            value={marketCapDisplay}
            sublabel={marketCapLabel}
          />,
          <StatCell
            key="52w"
            label="52W Range"
            value={week52Display}
            sublabel={week52Spread}
            isRange
            rangePosition={week52Position}
          />,
          <StatCell
            key="eps"
            label="EPS CAGR 3Y"
            value={epsCagrDisplay}
            sublabel={epsCagrLabel}
            sublabelColor={epsCagrDisplay !== "—" ? (epsCagrIsPositive ? "up" : "down") : "muted"}
          />,
          <StatCell
            key="div"
            label="Dividend Yield"
            value={divYield}
            sublabel="Annual"
          />,
        ].map((cell, i) => (
          <div
            key={i}
            style={i > 0 ? { borderLeft: "1px solid var(--qc-border-inner)" } : undefined}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
}
