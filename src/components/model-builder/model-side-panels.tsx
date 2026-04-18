"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Users, TrendingUp, ChevronDown } from "lucide-react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthClient } from "@/types/wealthos";
import type { ModelHolding } from "@/types/portfolio";
import type { StocksApiResponse } from "@/types/screener";

// ── Shared sub-components ────────────────────────────────────────────────────

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      <div className="px-2 pt-1 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(18,18,18,0.50)" }}>
          {title}
        </p>
      </div>
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4">
        {children}
      </div>
    </div>
  );
}

// ── Linked Clients Panel ─────────────────────────────────────────────────────

interface LinkedClientsPanelProps {
  linkedClientIds: string[];
  onChange: (ids: string[]) => void;
}

export function LinkedClientsPanel({ linkedClientIds, onChange }: LinkedClientsPanelProps) {
  const [allClients, setAllClients] = useState<WealthClient[]>([]);
  const [search, setSearch]         = useState("");
  const [open, setOpen]             = useState(false);
  const dropRef                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiCall<{ data: WealthClient[]; pagination: unknown }>(`${BACKEND_URL}/api/wealthos/clients`, {
      onSuccess: (res) => setAllClients(res.data ?? []),
      onError: (err) => console.error("LinkedClientsPanel fetch failed:", err),
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const linked   = allClients.filter((c) => linkedClientIds.includes(c.id));
  const filtered = allClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.segment?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    onChange(
      linkedClientIds.includes(id)
        ? linkedClientIds.filter((x) => x !== id)
        : [...linkedClientIds, id]
    );
  };

  return (
    <PanelShell title="Client Context">
      {/* Linked clients list */}
      {linked.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#F5F5F5" }}>
            <Users className="w-4 h-4" style={{ color: "#888888" }} />
          </div>
          <p className="text-xs text-center" style={{ color: "#888888" }}>
            No clients linked yet.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5 mb-3">
          {linked.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: "#F5F5F5" }}
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate" style={{ color: "#0F172B" }}>{c.name}</p>
                <p className="text-[11px]" style={{ color: "#888888" }}>{c.segment}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(c.id)}
                className="ml-2 p-1 rounded hover:bg-red-50 transition-colors shrink-0"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" style={{ color: "#888888" }} />
              </button>
            </div>
          ))}
        </ul>
      )}

      {/* Multi-select dropdown */}
      <div ref={dropRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between rounded-lg border border-[#E2E2E2] px-3 py-2 text-xs transition-colors hover:border-[#0F172B]"
          style={{ color: "#888888", background: "#fff" }}
        >
          <span>{linked.length > 0 ? "Link more clients…" : "Link clients…"}</span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        </button>

        {open && (
          <div
            className="absolute z-50 left-0 right-0 mt-1 rounded-[10px] border border-[#E2E2E2] bg-white shadow-lg"
            style={{ maxHeight: 240, overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E2E2E2]">
              <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "#888888" }} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients…"
                className="flex-1 text-xs bg-transparent focus:outline-none"
                style={{ color: "#0F172B" }}
              />
            </div>
            <ul className="overflow-y-auto list-none pt-3" style={{ maxHeight: 180 }}>
              {filtered.length === 0 ? (
                <li className="px-3 py-3 text-xs text-center" style={{ color: "#888888" }}>
                  {allClients.length === 0 ? "Loading…" : "No results"}
                </li>
              ) : (
                filtered.map((c) => {
                  const isLinked = linkedClientIds.includes(c.id);
                  return (
                    <div key={c.id} className="px-3">
                      <button
                        type="button"
                        onClick={() => { toggle(c.id); setSearch(""); }}
                        className="w-full text-left pr-3 hover:bg-[#F5F5F5] transition-colors flex items-center gap-2.5"
                      >
                        <div
                          className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                          style={{
                            border: isLinked ? "none" : "1.5px solid #D1D5DB",
                            background: isLinked ? "#0F172B" : "transparent",
                          }}
                        >
                          {isLinked && (
                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                              <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: "#0F172B" }}>{c.name}</p>
                          <p className="text-[11px]" style={{ color: "#888888" }}>{c.segment}</p>
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </PanelShell>
  );
}

// ── Model Holdings Panel ─────────────────────────────────────────────────────

interface ModelHoldingsPanelProps {
  holdings: ModelHolding[];
  onChange: (h: ModelHolding[]) => void;
}

interface StockOption {
  ticker: string;
  companyName: string;
  industry: string;
}

function rebalance(holdings: ModelHolding[], changedTicker: string, newWeight: number): ModelHolding[] {
  const others = holdings.filter((h) => h.ticker !== changedTicker);
  const othersTotal = others.reduce((s, h) => s + h.weight, 0);
  const remaining = 100 - newWeight;

  let rebalanced: ModelHolding[];
  if (othersTotal === 0) {
    const even = others.length > 0 ? Math.round(remaining / others.length) : 0;
    rebalanced = others.map((h, i) =>
      i === others.length - 1 ? { ...h, weight: remaining - even * (others.length - 1) } : { ...h, weight: even }
    );
  } else {
    let distributed = 0;
    rebalanced = others.map((h, i) => {
      if (i === others.length - 1) {
        return { ...h, weight: Math.max(0, remaining - distributed) };
      }
      const w = Math.round((h.weight / othersTotal) * remaining);
      distributed += w;
      return { ...h, weight: w };
    });
  }

  return [
    ...rebalanced.filter((h) => h.ticker !== changedTicker),
    { ...holdings.find((h) => h.ticker === changedTicker)!, weight: newWeight },
  ].sort((a, b) => holdings.findIndex((h) => h.ticker === a.ticker) - holdings.findIndex((h) => h.ticker === b.ticker));
}

export function ModelHoldingsPanel({ holdings, onChange }: ModelHoldingsPanelProps) {
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [search, setSearch]             = useState("");
  const [open, setOpen]                 = useState(false);
  const dropRef                         = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiCall<StocksApiResponse>(`${BACKEND_URL}/api/transcript/stocks`, {
      onSuccess: (res) => {
        setStockOptions(
          (res.data ?? []).map((s) => ({
            ticker: s.company,
            companyName: s.company_name,
            industry: s.basic_industry,
          }))
        );
      },
      onError: () => {},
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addedTickers = new Set(holdings.map((h) => h.ticker));

  const filtered = stockOptions.filter(
    (s) =>
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.ticker.toLowerCase().includes(search.toLowerCase()) ||
      s.industry.toLowerCase().includes(search.toLowerCase())
  );

  const addHolding = (stock: StockOption) => {
    if (addedTickers.has(stock.ticker)) { removeHolding(stock.ticker); return; }
    const n = holdings.length + 1;
    const even = Math.floor(100 / n);
    const remainder = 100 - even * n;
    const next: ModelHolding[] = [
      ...holdings.map((h, i) => ({ ...h, weight: even + (i === 0 ? remainder : 0) })),
      { ticker: stock.ticker, companyName: stock.companyName, industry: stock.industry, weight: even },
    ];
    onChange(next);
    setSearch("");
    setOpen(false);
  };

  const removeHolding = (ticker: string) => {
    const next = holdings.filter((h) => h.ticker !== ticker);
    if (next.length === 0) { onChange([]); return; }
    const total = next.reduce((s, h) => s + h.weight, 0);
    if (total === 0) {
      const even = Math.floor(100 / next.length);
      onChange(next.map((h, i) => ({ ...h, weight: even + (i === 0 ? 100 - even * next.length : 0) })));
    } else {
      // scale up to 100
      let acc = 0;
      onChange(
        next.map((h, i) => {
          if (i === next.length - 1) return { ...h, weight: 100 - acc };
          const w = Math.round((h.weight / total) * 100);
          acc += w;
          return { ...h, weight: w };
        })
      );
    }
  };

  const setWeight = (ticker: string, newWeight: number) => {
    if (holdings.length === 1) {
      onChange([{ ...holdings[0], weight: 100 }]);
      return;
    }
    onChange(rebalance(holdings, ticker, newWeight));
  };

  const totalWeight = holdings.reduce((s, h) => s + h.weight, 0);

  return (
    <PanelShell title="Model Holdings">
      {/* Holdings list */}
      {holdings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#F5F5F5" }}>
            <TrendingUp className="w-4 h-4" style={{ color: "#888888" }} />
          </div>
          <p className="text-xs text-center" style={{ color: "#888888" }}>
            No holdings added yet.
          </p>
        </div>
      ) : (
        <ul className="space-y-3 mb-3">
          {holdings.map((h) => (
            <li key={h.ticker} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-sm" style={{ background: "#F5F5F5", color: "#0F172B" }}>
                      {h.ticker}
                    </span>
                    <span className="text-[12px] font-medium truncate" style={{ color: "#0F172B" }}>{h.companyName}</span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: "#888888" }}>{h.industry}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[13px] font-semibold tabular-nums" style={{ color: "#0F172B" }}>{h.weight}%</span>
                  <button
                    type="button"
                    onClick={() => removeHolding(h.ticker)}
                    className="p-1 rounded hover:bg-red-50 transition-colors"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" style={{ color: "#888888" }} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={h.weight}
                disabled={holdings.length === 1}
                onChange={(e) => setWeight(h.ticker, Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: "#0F172B" }}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Weight sum indicator */}
      {holdings.length > 0 && (
        <div
          className="flex items-center justify-between rounded-lg px-3 py-1.5 mb-3 text-xs"
          style={{
            background: totalWeight === 100 ? "#F0FDF4" : "#FFF7F0",
            color:      totalWeight === 100 ? "#166534" : "#92400E",
            border:     `1px solid ${totalWeight === 100 ? "#BBF7D0" : "#FED7AA"}`,
          }}
        >
          <span>Total weight</span>
          <span className="font-semibold">{totalWeight}%</span>
        </div>
      )}

      {/* Stock search dropdown */}
      <div ref={dropRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between rounded-lg border border-[#E2E2E2] px-3 py-2 text-xs transition-colors hover:border-[#0F172B]"
          style={{ color: "#888888", background: "#fff" }}
        >
          <span>{holdings.length > 0 ? "Add another stock…" : "Search & add stocks…"}</span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        </button>

        {open && (
          <div
            className="absolute z-50 left-0 right-0 mt-1 rounded-[10px] border border-[#E2E2E2] bg-white shadow-lg"
            style={{ maxHeight: 260, overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E2E2E2]">
              <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "#888888" }} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or ticker…"
                className="flex-1 text-xs bg-transparent focus:outline-none"
                style={{ color: "#0F172B" }}
              />
            </div>
            <ul className="overflow-y-auto list-none pt-3" style={{ maxHeight: 200 }}>
              {filtered.length === 0 ? (
                <li className="px-3 py-3 text-xs text-center" style={{ color: "#888888" }}>
                  {stockOptions.length === 0 ? "Loading…" : "No results"}
                </li>
              ) : (
                filtered.slice(0, 30).map((s) => {
                  const isAdded = addedTickers.has(s.ticker);
                  return (
                    <div key={s.ticker} className="px-3">
                      <button
                        type="button"
                        onClick={() => addHolding(s)}
                        className="w-full text-left hover:bg-[#F5F5F5] transition-colors flex items-center gap-2.5"
                      >
                        <div
                          className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                          style={{
                            border: isAdded ? "none" : "1.5px solid #D1D5DB",
                            background: isAdded ? "#0F172B" : "transparent",
                          }}
                        >
                          {isAdded && (
                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                              <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm shrink-0" style={{ background: "#F5F5F5", color: "#0F172B" }}>
                              {s.ticker}
                            </span>
                            <p className="text-[13px] font-medium truncate" style={{ color: "#0F172B" }}>{s.companyName}</p>
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: "#888888" }}>{s.industry}</p>
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </PanelShell>
  );
}
