"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Plus, CheckCircle2, SlidersHorizontal, Loader2 } from "lucide-react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { StocksApiResponse } from "@/types/screener";

export interface StockOption {
  ticker: string;
  name: string;
  industry: string;
}

interface StockSearchPanelProps {
  /** When provided, renders a +Add button per row. Omit for navigation mode. */
  onAddStock?: (stock: StockOption) => void;
  /** Tickers already in the model — shown with checkmark, button disabled. */
  addedTickers?: string[];
  /** "screener" = standalone on screener home, "panel" = compact card on model-builder */
  variant?: "screener" | "panel";
}

export function StockSearchPanel({
  onAddStock,
  addedTickers = [],
  variant = "screener",
}: StockSearchPanelProps) {
  const router = useRouter();
  const [stocks, setStocks] = useState<StockOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    apiCall<StocksApiResponse>(`${BACKEND_URL}/api/transcript/stocks`, {
      onStart: () => setLoading(true),
      onSuccess: (response) => {
        setStocks(
          response.data.map((s) => ({
            ticker: s.company,
            name: s.company_name,
            industry: s.basic_industry,
          }))
        );
      },
      onError: (err) => console.error("StockSearchPanel: failed to fetch stocks", err),
      onComplete: () => setLoading(false),
    });
  }, []);

  const filtered = query.trim()
    ? stocks.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.ticker.toLowerCase().includes(query.toLowerCase()) ||
          s.industry.toLowerCase().includes(query.toLowerCase())
      )
    : stocks;

  const handleRowClick = (stock: StockOption) => {
    if (onAddStock) return; // panel mode: click handled by + button only
    router.push(`/screener/overview?symbol=${encodeURIComponent(stock.ticker)}`);
  };

  if (variant === "panel") {
    return (
      <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
        <div className="px-2 pt-1 pb-3 flex items-center justify-between">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1.5"
            style={{ color: "rgba(18,18,18,0.50)" }}
          >
            <SlidersHorizontal className="h-3 w-3" />
            Asset Screener
          </p>
          <span className="text-xs font-bold" style={{ color: "#0F172B" }}>
            {loading ? "…" : filtered.length}
          </span>
        </div>

        <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] overflow-hidden">
          {/* Search bar */}
          <div
            className="border-b border-[#E2E2E2] px-3 py-2.5 flex items-center gap-2"
          >
            <Search className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#888888" }} />
            <input
              type="text"
              placeholder="Search assets…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-zinc-400"
              style={{ color: "#0F172B" }}
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2" style={{ color: "#888888" }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading stocks…</span>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: "#888888" }}>
              No assets match your search.
            </p>
          )}

          {/* Rows */}
          {!loading && (
            <div className="divide-y divide-[#E2E2E2] max-h-[400px] overflow-y-auto">
              {filtered.map((stock) => {
                const isAdded = addedTickers.includes(stock.ticker);
                return (
                  <div key={stock.ticker} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#0F172B" }}>
                        {stock.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono" style={{ color: "#888888" }}>
                          {stock.ticker}
                        </span>
                        <span
                          className="text-[10px] font-medium uppercase tracking-wide rounded-sm px-1.5 py-0.5"
                          style={{ background: "#F5F5F5", color: "#888888" }}
                        >
                          {stock.industry}
                        </span>
                      </div>
                    </div>
                    {onAddStock && (
                      <button
                        onClick={() => !isAdded && onAddStock(stock)}
                        disabled={isAdded}
                        className="flex-shrink-0 h-7 w-7 rounded-md border flex items-center justify-center transition-colors"
                        style={{
                          background: isAdded ? "#F5F5F5" : "#0F172B",
                          borderColor: isAdded ? "#E2E2E2" : "#0F172B",
                          cursor: isAdded ? "default" : "pointer",
                        }}
                        title={isAdded ? "Already added" : "Add to portfolio"}
                      >
                        {isAdded ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Plus className="h-3.5 w-3.5 text-white" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // variant === "screener"
  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex items-center gap-2 rounded-xl border border-[#E2E2E2] bg-white px-4 py-3">
        <Search className="h-4 w-4 flex-shrink-0" style={{ color: "#888888" }} />
        <input
          type="text"
          placeholder="Filter stocks by name, ticker, or industry…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-zinc-400"
          style={{ color: "#0F172B" }}
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#888888" }} />}
        {!loading && (
          <span className="text-xs font-medium" style={{ color: "#888888" }}>
            {filtered.length} stocks
          </span>
        )}
      </div>

      {/* Results */}
      {!loading && filtered.length === 0 && (
        <p className="text-sm text-center py-4" style={{ color: "#888888" }}>
          No stocks match &ldquo;{query}&rdquo;.
        </p>
      )}

      <div className="divide-y divide-[#E2E2E2] rounded-xl border border-[#E2E2E2] bg-white overflow-hidden">
        {filtered.map((stock) => (
          <button
            key={stock.ticker}
            onClick={() => handleRowClick(stock)}
            className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[#F5F5F5] transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "#0F172B" }}>
                {stock.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono" style={{ color: "#888888" }}>
                  {stock.ticker}
                </span>
                <span
                  className="text-[10px] font-medium uppercase tracking-wide rounded-sm px-1.5 py-0.5"
                  style={{ background: "#F5F5F5", color: "#888888" }}
                >
                  {stock.industry}
                </span>
              </div>
            </div>
            <ArrowRight
              className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "#0F172B" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
