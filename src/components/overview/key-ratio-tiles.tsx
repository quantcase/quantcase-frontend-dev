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
      : { color: "var(--qc-ink-2)" };

  const isDeltaChip = sublabelColor === "up" || sublabelColor === "down";

  return (
    <div className="stat relative min-w-0 flex flex-col gap-1.5 px-5 py-3.5">
      {/* Top row: label + sublabel/status chip */}
      <div className="flex items-center justify-between gap-2">
        <div
          className="stat-k flex items-center gap-1.5"
          style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-ink-2)", textTransform: "uppercase" }}
        >
          {label}
        </div>
        {sublabel && (
          isDeltaChip ? (
            <div
              style={{
                ...sublabelStyle,
                fontFamily: "var(--qc-font-mono)",
                fontSize: "var(--qc-fz-10)",
                fontWeight: "var(--qc-w-medium)",
                padding: "2px 6px",
                borderRadius: 5,
                letterSpacing: "0.02em",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {sublabel}
            </div>
          ) : (
            <div
              style={{
                fontFamily: "var(--qc-font-mono)",
                fontSize: "var(--qc-fz-10)",
                color: "var(--qc-ink-2)",
                letterSpacing: "var(--qc-track-pill)",
                whiteSpace: "nowrap",
                background: "var(--qc-chip, #F2F1EC)",
                border: "1px solid var(--qc-hair)",
                padding: "2px 6px",
                borderRadius: 5,
                lineHeight: 1,
              }}
            >
              {sublabel}
            </div>
          )
        )}
      </div>

      {/* Bottom row: value (+ range bar for 52W) */}
      {isRange ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[13px] font-medium" style={{ letterSpacing: "-0.005em", color: "var(--qc-ink)" }}>
            {value}
          </div>
          {rangePosition != null && (
            <div className="relative h-[3px] rounded-full" style={{ background: "var(--qc-hair)" }}>
              <div
                className="absolute top-0 bottom-0 left-0 rounded-full"
                style={{ width: `${rangePosition}%`, background: "var(--qc-ink)" }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2"
                style={{
                  left: `calc(${rangePosition}% - 5px)`,
                  background: "var(--qc-ink)",
                  borderColor: "var(--qc-card)",
                  boxShadow: "0 0 0 1px var(--qc-hair)",
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div
          className="stat-v flex items-baseline gap-2 leading-none whitespace-nowrap"
          style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-22)", fontWeight: "var(--qc-w-medium)", letterSpacing: "-0.02em", color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </div>
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
    ? `${epsCagrRaw >= 0 ? "+" : ""}${epsCagrRaw.toFixed(1)}%`
    : "—";
  const epsCagrIsPositive = epsCagrDisplay !== "—" && !epsCagrDisplay.startsWith("-");
  const epsCagrLabel = fin.eps_cagr_3y_label ?? null;

  // Dividend Yield — backend sends value already in % (e.g. 0.98 means 0.98%)
  const divYieldRaw = ps.dividendYield;
  const divYield = divYieldRaw != null && divYieldRaw > 0 ? `${divYieldRaw.toFixed(2)}%` : "—";

  return (
    <div className="px-4">
      {/* stats-plank: single bordered card, dividers between cells */}
      <div
        className="grid grid-cols-5 overflow-hidden"
        style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 16,
          boxShadow: "0 1px 0 var(--qc-hair-2)",
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
            style={i > 0 ? { borderLeft: "1px solid var(--qc-hair-2)" } : undefined}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
}
