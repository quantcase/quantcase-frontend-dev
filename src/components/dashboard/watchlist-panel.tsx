"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  ChevronDown,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useWatchlists } from "@/hooks/useWatchlists";
import { useWatchlistQuotes } from "@/hooks/useWatchlistQuotes";
import type { Watchlist, WatchlistAsset } from "@/types/screener";
import type { WatchlistQuote } from "@/hooks/useWatchlistQuotes";

// ── Formatters ────────────────────────────────────────────────────────────────

function relDate(dateStr: string): string {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function fmtPrice(v: number): string {
  return `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtCap(v: number): string {
  if (v >= 1e12) return `₹${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `₹${(v / 1e9).toFixed(1)}B`;
  return `₹${(v / 1e6).toFixed(0)}M`;
}

function week52Pos(price: number, low: number, high: number): number {
  if (high === low) return 50;
  return Math.round(Math.max(0, Math.min(100, ((price - low) / (high - low)) * 100)));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryTile({ label, value, sub, upDown }: {
  label: string;
  value: string;
  sub?: string;
  upDown?: "up" | "down" | null;
}) {
  const subColor = upDown === "up" ? "#059669" : upDown === "down" ? "#dc2626" : "#888888";
  return (
    <div className="flex flex-col gap-1 px-4 py-3 border-r border-[#E2E2E2] last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#888888" }}>
        {label}
      </p>
      <p className="text-[20px] font-semibold leading-none" style={{ color: "#0F172B" }}>
        {value}
      </p>
      {sub && (
        <p className="text-[11px] font-medium" style={{ color: subColor }}>{sub}</p>
      )}
    </div>
  );
}

function AssetRow({
  asset,
  quote,
  isLast,
  onNavigate,
}: {
  asset: WatchlistAsset;
  quote: WatchlistQuote | undefined;
  isLast: boolean;
  onNavigate: (symbol: string) => void;
}) {
  const pct = quote?.changePercent ?? null;
  const isUp = pct != null && pct > 0;
  const isDown = pct != null && pct < 0;
  const changeColor = isUp ? "#059669" : isDown ? "#dc2626" : "#888888";
  const pos = quote ? week52Pos(quote.price, quote.week52Low, quote.week52High) : null;

  return (
    <tr
      onClick={() => onNavigate(asset.symbol)}
      className="cursor-pointer hover:bg-[#F5F5F5] transition-colors group"
      style={{ borderBottom: isLast ? undefined : "1px solid #E2E2E2" }}
    >
      {/* Symbol */}
      <td className="px-4 py-3">
        <span className="font-mono text-[12px] font-semibold" style={{ color: "#0F172B" }}>
          {asset.symbol}
        </span>
      </td>

      {/* Company + sector */}
      <td className="px-4 py-3 max-w-[160px]">
        <p className="text-[12px] truncate" style={{ color: "#0F172B", fontWeight: 500 }}>
          {quote?.name ?? "—"}
        </p>
        {quote?.sector && (
          <p className="text-[10px] truncate" style={{ color: "rgba(18,18,18,0.40)" }}>
            {quote.sector}
          </p>
        )}
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-right">
        <span className="text-[13px] font-semibold" style={{ color: "#0F172B" }}>
          {quote ? fmtPrice(quote.price) : "—"}
        </span>
      </td>

      {/* Day chg */}
      <td className="px-4 py-3 text-right">
        {pct != null ? (
          <span className="inline-flex items-center gap-0.5 text-[12px] font-medium" style={{ color: changeColor }}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : isDown ? <TrendingDown className="h-3 w-3" /> : null}
            {isUp ? "+" : ""}{(pct * 100).toFixed(2)}%
          </span>
        ) : <span style={{ color: "#888888" }}>—</span>}
      </td>

      {/* 52W position */}
      <td className="px-4 py-3 text-right">
        {pos != null ? (
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] w-6 text-right tabular-nums" style={{ color: "#888888" }}>
              {pos}%
            </span>
            <div className="w-16 h-1.5 rounded-full bg-[#E2E2E2] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pos}%`,
                  background: pos > 70 ? "#059669" : pos < 30 ? "#dc2626" : "#0F172B",
                }}
              />
            </div>
          </div>
        ) : <span style={{ color: "#888888" }}>—</span>}
      </td>

      {/* P/E */}
      <td className="px-4 py-3 text-right">
        <span className="text-[12px]" style={{ color: "#888888" }}>
          {quote?.pe != null ? quote.pe.toFixed(1) : "—"}
        </span>
      </td>

      {/* Mkt Cap */}
      <td className="px-4 py-3 text-right">
        <p className="text-[12px]" style={{ color: "#888888" }}>
          {quote ? fmtCap(quote.marketCap) : "—"}
        </p>
        {quote?.marketCapLabel && (
          <p className="text-[10px]" style={{ color: "rgba(18,18,18,0.40)" }}>
            {quote.marketCapLabel}
          </p>
        )}
      </td>

      {/* Added */}
      <td className="px-4 py-3 text-right">
        <span className="text-[11px]" style={{ color: "#888888" }}>
          {relDate(asset.added_on)}
        </span>
      </td>

      {/* Arrow */}
      <td className="px-3 py-3 w-8">
        <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#0F172B" }} />
      </td>
    </tr>
  );
}

function WatchlistAccordion({
  watchlist,
  quotes,
  quotesLoading,
  expanded,
  onToggle,
  onNavigate,
}: {
  watchlist: Watchlist;
  quotes: Record<string, WatchlistQuote>;
  quotesLoading: boolean;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: (sym: string) => void;
}) {
  const symbols = watchlist.assets.map((a) => a.symbol);
  const preview = symbols.slice(0, 5);
  const overflow = symbols.length - preview.length;

  const gainers = symbols.filter((s) => (quotes[s]?.changePercent ?? 0) > 0).length;
  const losers = symbols.filter((s) => (quotes[s]?.changePercent ?? 0) < 0).length;

  return (
    <div className="last:border-b-0" style={{ borderBottom: "1px solid #E2E2E2" }}>
      {/* Row header */}
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center gap-0 transition-colors group/header"
        style={{ background: expanded ? "#F9FAFB" : "#F5F5F5" }}
      >
        {/* Expand indicator strip */}
        <div
          className="self-stretch w-1 flex-shrink-0 transition-colors"
          style={{ background: expanded ? "#0F172B" : "#D1D5DB" }}
        />

        <div className="flex-1 flex items-center gap-3 px-4 py-3.5 group-hover/header:bg-[#ECECEC] transition-colors min-w-0">
          {/* Chevron */}
          <div
            className="flex-shrink-0 rounded-full p-0.5 transition-colors"
            style={{ background: expanded ? "#0F172B" : "#0F172B" }}
          >
            <ChevronDown
              className="h-3 w-3 transition-transform duration-200"
              style={{
                color: "#FFFFFF",
                transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: "#0F172B" }}>
              {watchlist.name}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "#888888" }}>
              {relDate(watchlist.updated_at)}
              {!quotesLoading && symbols.length > 0 && (
                <>
                  <span className="mx-1.5" style={{ color: "#E2E2E2" }}>·</span>
                  <span style={{ color: "#059669" }}>{gainers}↑</span>
                  <span className="mx-1" style={{ color: "#888888" }}>·</span>
                  <span style={{ color: "#dc2626" }}>{losers}↓</span>
                </>
              )}
            </p>
          </div>

          {/* Symbol chips */}
          <div className="hidden sm:flex items-center gap-1 flex-wrap justify-end max-w-[280px]">
            {preview.map((sym) => (
              <span
                key={sym}
                className="font-mono text-[10px] rounded-sm px-1.5 py-0.5"
                style={{ background: "#F5F5F5", color: "#0F172B", border: "1px solid #E2E2E2" }}
              >
                {sym}
              </span>
            ))}
            {overflow > 0 && (
              <span
                className="text-[10px] rounded-sm px-1.5 py-0.5"
                style={{ background: "#F5F5F5", color: "#90A1B9", border: "1px solid #E2E2E2" }}
              >
                +{overflow}
              </span>
            )}
          </div>

          <span
            className="flex-shrink-0 text-[11px] font-semibold rounded-sm px-2 py-0.5"
            style={{ background: "#0F172B", color: "#FFFFFF" }}
          >
            {watchlist.total_assets}
          </span>
        </div>
      </button>

      {/* Expanded table */}
      {expanded && (
        <div style={{ borderTop: "1px solid #E2E2E2" }}>
          {quotesLoading ? (
            <div className="flex items-center justify-center gap-2 py-6" style={{ color: "#888888" }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[12px]">Fetching quotes…</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F5F5F5", borderBottom: "1px solid #E2E2E2" }}>
                    {[
                      { h: "Symbol",       align: "left"  },
                      { h: "Company",      align: "left"  },
                      { h: "Price",        align: "right" },
                      { h: "Day Chg",      align: "right" },
                      { h: "52W Range",    align: "right" },
                      { h: "P/E",          align: "right" },
                      { h: "Mkt Cap",      align: "right" },
                      { h: "Added",        align: "right" },
                    ].map(({ h, align }) => (
                      <th
                        key={h}
                        className={`px-4 py-2 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap text-${align}`}
                        style={{ color: "#888888" }}
                      >
                        {h}
                      </th>
                    ))}
                    <th className="px-3 py-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {watchlist.assets.map((asset, i) => (
                    <AssetRow
                      key={asset.id}
                      asset={asset}
                      quote={quotes[asset.symbol]}
                      isLast={i === watchlist.assets.length - 1}
                      onNavigate={onNavigate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function WatchlistPanel({ className }: { className?: string }) {
  const router = useRouter();
  const { watchlists, loading: wlLoading, error, refresh } = useWatchlists();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [didAutoExpand, setDidAutoExpand] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-expand the first watchlist once data loads
  if (!didAutoExpand && watchlists.length > 0) {
    setExpandedId(watchlists[0].id);
    setDidAutoExpand(true);
  }

  const allSymbols = useMemo(() => {
    const seen = new Set<string>();
    watchlists.forEach((wl) => wl.assets.forEach((a) => seen.add(a.symbol)));
    return Array.from(seen);
  }, [watchlists]);

  const { quotes, loading: quotesLoading } = useWatchlistQuotes(allSymbols);

  // Aggregate stats
  const totalSymbols = watchlists.reduce((s, w) => s + w.total_assets, 0);
  const gainers = allSymbols.filter((s) => (quotes[s]?.changePercent ?? 0) > 0).length;
  const losers  = allSymbols.filter((s) => (quotes[s]?.changePercent ?? 0) < 0).length;
  const peVals  = allSymbols.map((s) => quotes[s]?.pe).filter((v): v is number => v != null && v > 0 && v < 200);
  const avgPE   = peVals.length > 0 ? peVals.reduce((a, b) => a + b, 0) / peVals.length : null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <div className={`rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 flex flex-col ${className ?? ""}`}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            My Watchlists
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || wlLoading}
          className="flex items-center gap-1.5 text-[11px] font-medium rounded-md px-2 py-1 border border-[#E2E2E2] bg-white hover:bg-[#F5F5F5] transition-colors disabled:opacity-40"
          style={{ color: "#888888" }}
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] flex-1 flex flex-col overflow-hidden">

        {/* ── Loading skeleton ── */}
        {wlLoading && watchlists.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-10" style={{ color: "#888888" }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-[12px]">Loading watchlists…</span>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 m-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="text-[12px] text-red-600">{error}</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!wlLoading && !error && watchlists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <Bookmark className="h-6 w-6 mb-3" style={{ color: "#888888" }} />
            <p className="text-[13px] font-medium" style={{ color: "#0F172B" }}>No watchlists yet</p>
            <p className="text-[12px] mt-1" style={{ color: "#888888" }}>
              Select stocks from a research basket to create your first watchlist.
            </p>
          </div>
        )}

        {/* ── Content ── */}
        {!error && watchlists.length > 0 && (
          <>
            {/* Summary stat bar */}
            <div className="grid grid-cols-4 border-b border-[#E2E2E2]">
              <SummaryTile label="Watchlists" value={String(watchlists.length)} />
              <SummaryTile label="Tracked" value={String(totalSymbols)} sub="symbols" />
              <SummaryTile
                label="Gainers"
                value={quotesLoading ? "—" : String(gainers)}
                sub={quotesLoading ? undefined : `${losers} declining`}
                upDown={gainers > losers ? "up" : gainers < losers ? "down" : null}
              />
              <SummaryTile
                label="Avg P/E"
                value={quotesLoading || avgPE == null ? "—" : `${avgPE.toFixed(1)}x`}
                sub={peVals.length > 0 ? `${peVals.length} stocks` : undefined}
              />
            </div>

            {/* Accordion list */}
            <div className="flex-1 overflow-y-auto">
              {watchlists.map((wl) => (
                <WatchlistAccordion
                  key={wl.id}
                  watchlist={wl}
                  quotes={quotes}
                  quotesLoading={quotesLoading}
                  expanded={expandedId === wl.id}
                  onToggle={() => setExpandedId((p) => (p === wl.id ? null : wl.id))}
                  onNavigate={(sym) => router.push(`/screener/overview?symbol=${encodeURIComponent(sym)}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
