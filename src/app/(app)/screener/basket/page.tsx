"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Search,
  X,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useBaskets } from "@/hooks/useBaskets";
import { useBasketStocks } from "@/hooks/useBasketStocks";
import { useWatchlists } from "@/hooks/useWatchlists";
import { useIndustryBaskets } from "@/hooks/useIndustryBaskets";
import { useIndustryBasketStocks } from "@/hooks/useIndustryBasketStocks";
import type { IndustryBasketStock } from "@/hooks/useIndustryBasketStocks";
import type { BasketCondition, BasketStock } from "@/types/screener";

// ── Formatters ────────────────────────────────────────────────────────────────

function pct(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v.toFixed(1)}%`;
}

function cr(v: number | null | undefined): string {
  if (v == null) return "—";
  if (Math.abs(v) >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L Cr`;
  if (Math.abs(v) >= 1_000) return `₹${(v / 1_000).toFixed(1)}K Cr`;
  return `₹${v.toFixed(0)} Cr`;
}

function num(v: number | null | undefined, dp = 1): string {
  if (v == null) return "—";
  return v.toFixed(dp);
}

// ── Column registry ───────────────────────────────────────────────────────────

interface ColMeta {
  label: string;
  align: "left" | "right";
  format?: (v: number | null | undefined) => string;
}

const COL_META: Record<string, ColMeta> = {
  companyName:    { label: "Company",     align: "left" },
  symbol:         { label: "Symbol",      align: "left" },
  pe:             { label: "P/E",         align: "right", format: (v) => num(v) },
  pb:             { label: "P/B",         align: "right", format: (v) => num(v) },
  adjEps:         { label: "Adj EPS",     align: "right", format: (v) => num(v) },
  epsGrowth:      { label: "EPS Growth",  align: "right", format: pct },
  dividendYield:  { label: "Div Yield",   align: "right", format: pct },
  totalIncomeCr:  { label: "Revenue",     align: "right", format: cr },
  netProfitCr:    { label: "Net Profit",  align: "right", format: cr },
  marketCapCr:    { label: "Mkt Cap",     align: "right", format: cr },
  promoterPct:    { label: "Promoter %",  align: "right", format: pct },
  promoterChange: { label: "Promoter Δ",  align: "right", format: pct },
  roce:           { label: "ROCE %",      align: "right", format: pct },
  roe:            { label: "ROE %",       align: "right", format: pct },
  debtToEquity:   { label: "D/E",         align: "right", format: (v) => num(v) },
  cagr3y:         { label: "3Y CAGR",     align: "right", format: pct },
  pbRatio:        { label: "P/B",         align: "right", format: (v) => num(v) },
  payoutRatio:    { label: "Payout %",    align: "right", format: pct },
  priceToBook:    { label: "P/B",         align: "right", format: (v) => num(v) },
  evToEbitda:     { label: "EV/EBITDA",   align: "right", format: (v) => num(v) },
  fcfYield:       { label: "FCF Yield",   align: "right", format: pct },
  revenueGrowth:  { label: "Rev Growth",  align: "right", format: pct },
};

function cellStr(stock: BasketStock, key: string): string {
  const meta = COL_META[key];
  const raw = stock[key];
  if (meta?.format && (typeof raw === "number" || raw == null)) {
    return meta.format(raw as number | null | undefined);
  }
  if (raw == null) return "—";
  return String(raw);
}

// ── Condition pill ────────────────────────────────────────────────────────────

function ConditionPill({ condition }: { condition: BasketCondition }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1.5"
      style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
    >
      <span className="text-[11px] font-medium" style={{ color: "var(--qc-ink)" }}>
        {condition.label}
      </span>
      <span className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>
        {condition.operator} {condition.value}
      </span>
    </div>
  );
}

// ── Category icon map ─────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  "Value Investing": "◈",
  "Income Investing": "◉",
  "Contrarian Signals": "◎",
  "Crisis Opportunity": "△",
  "Recovery Plays": "▷",
  "Momentum & Quality": "◆",
  "Growth Investing": "◇",
  "Event-Driven": "◻",
};

// ── Add to Watchlist modal ────────────────────────────────────────────────────

interface AddToWatchlistModalProps {
  symbols: string[];
  onClose: () => void;
  onSuccess: () => void;
}

function AddToWatchlistModal({ symbols, onClose, onSuccess }: AddToWatchlistModalProps) {
  const { watchlists, loading, addSymbols } = useWatchlists();
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedId, setSelectedId] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = useCallback(async () => {
    setErr(null);
    if (mode === "existing" && !selectedId) { setErr("Select a watchlist."); return; }
    if (mode === "new" && !newName.trim()) { setErr("Enter a watchlist name."); return; }

    setSubmitting(true);
    try {
      if (mode === "existing") {
        await addSymbols(symbols, { watchlistId: selectedId });
      } else {
        await addSymbols(symbols, { watchlistName: newName.trim() });
      }
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }, [mode, selectedId, newName, symbols, addSymbols, onSuccess, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-sm rounded-[12px] shadow-xl"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: "1px solid var(--qc-hair)" }}>
          <div>
            <p className="text-[14px] font-semibold" style={{ color: "var(--qc-ink)" }}>Add to Watchlist</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--qc-ink-2)" }}>
              {symbols.length} stock{symbols.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 transition-colors"
            onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-section)")}
            onMouseLeave={e => (e.currentTarget.style.background = "")}
          >
            <X className="h-4 w-4" style={{ color: "var(--qc-ink-2)" }} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Success state */}
          {done && (
            <div className="flex items-center gap-2 rounded-[8px] px-3 py-2.5" style={{ background: "var(--qc-up-soft)", border: "1px solid var(--qc-up-soft)" }}>
              <BookmarkCheck className="h-4 w-4 flex-shrink-0" style={{ color: "var(--qc-up)" }} />
              <span className="text-[12px] font-medium" style={{ color: "var(--qc-up)" }}>Added successfully!</span>
            </div>
          )}

          {/* Mode toggle */}
          {!done && (
            <>
              <div
                className="flex rounded-[8px] p-0.5"
                style={{ background: "var(--qc-section)", border: "1px solid var(--qc-hair)" }}
              >
                {(["existing", "new"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="flex-1 rounded-[6px] py-1.5 text-[11px] font-medium transition-all"
                    style={{
                      background: mode === m ? "var(--qc-ink)" : "transparent",
                      color: mode === m ? "var(--qc-card)" : "var(--qc-ink-2)",
                    }}
                  >
                    {m === "existing" ? "Existing" : "New list"}
                  </button>
                ))}
              </div>

              {mode === "existing" ? (
                loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--qc-ink-2)" }} />
                  </div>
                ) : watchlists.length === 0 ? (
                  <p className="text-[12px] text-center py-3" style={{ color: "var(--qc-ink-2)" }}>
                    No watchlists yet. Create a new one.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto">
                    {watchlists.map((wl) => (
                      <button
                        key={wl.id}
                        onClick={() => setSelectedId(wl.id)}
                        className="w-full flex items-center justify-between rounded-[8px] px-3 py-2.5 text-left transition-colors"
                        style={{
                          background: selectedId === wl.id ? "var(--qc-ink)" : "var(--qc-section)",
                          border: `1px solid ${selectedId === wl.id ? "var(--qc-ink)" : "var(--qc-hair)"}`,
                        }}
                      >
                        <span
                          className="text-[12px] font-medium"
                          style={{ color: selectedId === wl.id ? "var(--qc-card)" : "var(--qc-ink)" }}
                        >
                          {wl.name}
                        </span>
                        <span
                          className="text-[10px] font-mono"
                          style={{ color: selectedId === wl.id ? "rgba(255,255,255,0.6)" : "var(--qc-ink-2)" }}
                        >
                          {wl.total_assets} stocks
                        </span>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--qc-ink-2)" }}>
                    Watchlist name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Value Picks"
                    className="w-full rounded-[8px] px-3 py-2 text-[13px] outline-none"
                    style={{
                      border: "1px solid var(--qc-hair)",
                      background: "var(--qc-section)",
                      color: "var(--qc-ink)",
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>
              )}

              {/* Selected symbols preview */}
              <div className="flex flex-wrap gap-1">
                {symbols.slice(0, 8).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-mono rounded-sm px-1.5 py-0.5"
                    style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)", border: "1px solid var(--qc-hair)" }}
                  >
                    {s}
                  </span>
                ))}
                {symbols.length > 8 && (
                  <span className="text-[10px] rounded-sm px-1.5 py-0.5" style={{ color: "var(--qc-ink-2)" }}>
                    +{symbols.length - 8} more
                  </span>
                )}
              </div>

              {err && (
                <div className="flex items-center gap-1.5" style={{ color: "var(--qc-down)" }}>
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-[11px]">{err}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-[8px] py-2 text-[12px] font-medium transition-colors"
                  style={{ border: "1px solid var(--qc-hair)", color: "var(--qc-ink-2)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 rounded-[8px] py-2 text-[12px] font-medium transition-opacity disabled:opacity-60"
                  style={{ background: "var(--qc-ink)", color: "var(--qc-card)" }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Adding…
                    </span>
                  ) : (
                    "Add to watchlist"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sortable header cell ──────────────────────────────────────────────────────

function SortIcon({ dir }: { dir: false | "asc" | "desc" }) {
  if (dir === "asc") return <ArrowUp className="h-3 w-3 inline-block ml-1" />;
  if (dir === "desc") return <ArrowDown className="h-3 w-3 inline-block ml-1" />;
  return <ChevronsUpDown className="h-3 w-3 inline-block ml-1 opacity-30" />;
}

// ── Industry basket signal badge ──────────────────────────────────────────────

const SIGNAL_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  BUY:   { bg: "var(--qc-up-soft)",   border: "var(--qc-up-soft)",   color: "var(--qc-up)" },
  WAIT:  { bg: "var(--qc-warn-soft)", border: "var(--qc-warn-soft)", color: "var(--qc-warn)" },
  AVOID: { bg: "var(--qc-down-soft)", border: "var(--qc-down-soft)", color: "var(--qc-down)" },
};

// ── Industry basket detail view ───────────────────────────────────────────────

function IndustryBasketView({ basketId }: { basketId: string }) {
  const router = useRouter();
  const { data: listData } = useIndustryBaskets();
  const { data, loading, error } = useIndustryBasketStocks(basketId);

  const basketMeta = listData?.baskets.find((b) => b.id === basketId);
  const basket = data?.basket ?? (basketMeta ? { ...basketMeta } : null);
  const stocks: IndustryBasketStock[] = data?.stocks ?? [];
  const pagination = data?.pagination;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pageSize, setPageSize] = useState(20);
  const [columnFilters] = useState<ColumnFiltersState>([]);

  // Derive factor columns from first stock
  const factorKeys: string[] = useMemo(() => {
    if (!stocks.length) return [];
    return Object.keys(stocks[0].factors ?? {});
  }, [stocks]);

  const columns = useMemo<ColumnDef<IndustryBasketStock>[]>(() => {
    const cols: ColumnDef<IndustryBasketStock>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => { if (el) el.indeterminate = table.getIsSomePageRowsSelected(); }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="accent-[var(--qc-ink)] h-3.5 w-3.5 rounded cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            className="accent-[var(--qc-ink)] h-3.5 w-3.5 rounded cursor-pointer"
          />
        ),
        size: 40,
        enableSorting: false,
      },
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-[11px] tabular-nums" style={{ color: "var(--qc-ink-2)" }}>{row.index + 1}</span>
        ),
        size: 40,
        enableSorting: false,
      },
      {
        id: "ticker",
        accessorKey: "ticker",
        header: "Ticker",
        cell: ({ getValue }) => (
          <span className="font-mono text-[12px] font-semibold" style={{ color: "var(--qc-ink)" }}>
            {getValue() as string}
          </span>
        ),
        sortingFn: (a, b) => a.original.ticker.localeCompare(b.original.ticker),
        filterFn: "includesString",
      },
      {
        id: "composite_score",
        accessorKey: "composite_score",
        header: "QC Score",
        cell: ({ getValue }) => {
          const v = getValue() as number;
          const color = v >= 70 ? "var(--qc-up)" : v >= 50 ? "var(--qc-warn)" : "var(--qc-down)";
          return (
            <span className="text-[13px] font-semibold tabular-nums" style={{ color }}>
              {v.toFixed(1)}
            </span>
          );
        },
        sortingFn: (a, b) => a.original.composite_score - b.original.composite_score,
      },
    ];

    for (const key of factorKeys) {
      cols.push({
        id: `factor_${key}`,
        header: key.charAt(0).toUpperCase() + key.slice(1),
        cell: ({ row }) => {
          const v = row.original.factors[key];
          if (v == null) return <span style={{ color: "var(--qc-ink-2)" }}>—</span>;
          return (
            <span className="text-[12px] tabular-nums" style={{ color: "var(--qc-ink-2)" }}>
              {v.toFixed(1)}
            </span>
          );
        },
        sortingFn: (a, b) => {
          const av = a.original.factors[key] ?? 0;
          const bv = b.original.factors[key] ?? 0;
          return av - bv;
        },
        accessorFn: (row) => row.factors[key],
      });
    }

    cols.push({
      id: "arrow",
      header: "",
      cell: () => (
        <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--qc-ink)" }} />
      ),
      size: 40,
      enableSorting: false,
    });

    return cols;
  }, [factorKeys]);

  const table = useReactTable({
    data: stocks,
    columns,
    state: { sorting, columnFilters, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize }, sorting: [{ id: "composite_score", desc: true }] },
    enableRowSelection: true,
    getRowId: (row) => row.ticker,
  });

  const currentPageSize = table.getState().pagination.pageSize;
  if (currentPageSize !== pageSize) table.setPageSize(pageSize);

  const selectedSymbols = Object.keys(rowSelection);
  const selectedCount = selectedSymbols.length;
  const signal = (basket?.signal ?? "WAIT") as string;
  const sigStyle = SIGNAL_STYLE[signal] ?? SIGNAL_STYLE.WAIT;
  const metrics = basket && "metrics" in basket ? (basket as { metrics: { composite_score: number; velocity_3w: number; breadth_pct: number; stock_count: number } }).metrics : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--qc-bg)" }}>
      {/* Hero */}
      <div className="relative" style={{ background: "var(--qc-bg)" }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 100% at 50% 0%, var(--qc-lime) 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-8 pt-10 pb-8">
          {loading && !basket && (
            <div className="flex items-center gap-2 py-16 justify-center" style={{ color: "var(--qc-ink-2)" }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading basket…</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-down-soft bg-down-soft px-4 py-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--qc-down)" }} />
              <p className="text-sm" style={{ color: "var(--qc-down)" }}>{error}</p>
            </div>
          )}

          {basket && (
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="space-y-2 flex-1 min-w-0">
                <button
                  onClick={() => router.push("/screener/home")}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium mb-1 transition-opacity hover:opacity-60"
                  style={{ color: "var(--qc-ink-2)" }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Industry Signals
                </button>

                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{ background: sigStyle.bg, borderColor: sigStyle.border, color: sigStyle.color }}
                  >
                    {signal}
                  </div>
                  {"etfTicker" in basket && basket.etfTicker && (
                    <span className="text-[11px] font-mono" style={{ color: "var(--qc-ink-2)" }}>
                      {basket.etfTicker}
                    </span>
                  )}
                </div>

                <h1 className="text-[22px] sm:text-[32px] font-medium leading-tight" style={{ color: "var(--qc-ink)" }}>
                  {"title" in basket && basket.title ? basket.title : basketId}
                </h1>
                <p className="text-[13px]" style={{ color: "var(--qc-ink-2)" }}>
                  Constituent stocks · scored by QC composite framework
                </p>
              </div>

              {metrics && (
                <div className="flex items-center gap-3 flex-wrap pt-2 sm:pt-6">
                  {[
                    { label: "Composite", value: metrics.composite_score.toFixed(1) },
                    { label: "3W Velocity", value: `${metrics.velocity_3w > 0 ? "+" : ""}${metrics.velocity_3w}` },
                    { label: "Breadth", value: `${metrics.breadth_pct.toFixed(0)}%` },
                    { label: "Stocks", value: String(pagination?.total ?? metrics.stock_count) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col items-center gap-0.5 px-4 py-3 rounded-[10px] border"
                      style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--qc-ink-2)" }}>{label}</span>
                      <span className="text-[15px] font-semibold" style={{ color: "var(--qc-ink)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
        <div className="rounded-[10px] border p-2" style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }}>
          {/* Toolbar */}
          <div className="px-2 pt-1 pb-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[10px] font-bold uppercase tracking-[0.10em]" style={{ color: "var(--qc-ink)" }}>
              Constituent Stocks
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5"
                style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
              >
                <Search className="h-3 w-3 flex-shrink-0" style={{ color: "var(--qc-ink-2)" }} />
                <input
                  type="text"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search…"
                  className="w-32 text-[12px] outline-none bg-transparent"
                  style={{ color: "var(--qc-ink)" }}
                />
                {globalFilter && (
                  <button onClick={() => setGlobalFilter("")}>
                    <X className="h-3 w-3" style={{ color: "var(--qc-ink-2)" }} />
                  </button>
                )}
              </div>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); table.setPageSize(Number(e.target.value)); }}
                className="rounded-[8px] px-2 py-1.5 text-[11px] outline-none cursor-pointer"
                style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", color: "var(--qc-ink-2)" }}
              >
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
              </select>
              {selectedCount > 0 && (
                <span className="text-[11px] font-semibold" style={{ color: "var(--qc-ink)" }}>
                  {selectedCount} selected
                </span>
              )}
            </div>
          </div>

          <div className="rounded-[10px] overflow-hidden" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)" }}>
            {loading && (
              <div className="flex items-center justify-center py-16 gap-2" style={{ color: "var(--qc-ink-2)" }}>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading stocks…</span>
              </div>
            )}
            {!loading && error && (
              <div className="flex items-center justify-center py-16 gap-2" style={{ color: "var(--qc-down)" }}>
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {!loading && !error && stocks.length === 0 && (
              <p className="text-sm text-center py-14" style={{ color: "var(--qc-ink-2)" }}>No stocks found.</p>
            )}
            {!loading && !error && stocks.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id} style={{ borderBottom: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}>
                          {hg.headers.map((header) => (
                            <th
                              key={header.id}
                              onClick={header.column.getToggleSortingHandler()}
                              className={`px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap select-none text-right first:text-left ${
                                header.column.getCanSort() ? "cursor-pointer hover:opacity-70" : ""
                              }`}
                              style={{ color: "var(--qc-ink-2)" }}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getCanSort() && <SortIcon dir={header.column.getIsSorted()} />}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row, i) => {
                        const isLast = i === table.getRowModel().rows.length - 1;
                        return (
                          <tr
                            key={row.id}
                            onClick={() => router.push(`/screener/management?symbol=${encodeURIComponent(row.original.ticker)}`)}
                            className="cursor-pointer transition-colors group"
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-section)")}
                            onMouseLeave={e => (e.currentTarget.style.background = row.getIsSelected() ? "var(--qc-lime)" : "")}
                            style={{ borderBottom: !isLast ? "1px solid var(--qc-hair-2)" : undefined, background: row.getIsSelected() ? "var(--qc-lime)" : undefined }}
                          >
                            {row.getVisibleCells().map((cell) => {
                              const isLeft = cell.column.id === "select" || cell.column.id === "index" || cell.column.id === "ticker" || cell.column.id === "arrow";
                              return (
                                <td
                                  key={cell.id}
                                  className={`px-4 py-3 text-sm whitespace-nowrap ${isLeft ? "text-left" : "text-right"}`}
                                  style={{ color: "var(--qc-ink-2)" }}
                                >
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3" style={{ borderTop: "1px solid var(--qc-hair)" }}>
                  <p className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>
                    {table.getFilteredRowModel().rows.length} stocks
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="rounded-[6px] p-1 disabled:opacity-30 transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-section)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "")}
                    >
                      <ChevronLeft className="h-4 w-4" style={{ color: "var(--qc-ink)" }} />
                    </button>
                    <span className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>
                      {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                    </span>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="rounded-[6px] p-1 disabled:opacity-30 transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-section)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "")}
                    >
                      <ChevronRight className="h-4 w-4" style={{ color: "var(--qc-ink)" }} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────

function BasketContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const basketId = searchParams.get("id");

  // Detect whether this is an industry basket ID by checking the industry baskets list.
  // Pass null to the regular hooks until the industry list resolves, to avoid a spurious 404.
  const { data: industryList, loading: industryListLoading } = useIndustryBaskets();
  const industryResolved = !industryListLoading;
  const isIndustryBasket = !!(basketId && industryList?.baskets.some((b) => b.id === basketId));

  const { data: basketsData, loading: basketsLoading, error: basketsError } = useBaskets();
  const { data: stocksData, loading: stocksLoading, error: stocksError } = useBasketStocks(
    industryResolved && !isIndustryBasket ? basketId : null
  );

  // ── Basket metadata ───────────────────────────────────────────────────────
  const basketMeta = basketsData?.baskets.find((b) => b.id === basketId) ?? null;
  const basket = stocksData?.basket ?? basketMeta;
  const rawConditions = stocksData?.basket?.conditions ?? basketMeta?.conditions;
  const conditions: BasketCondition[] = Array.isArray(rawConditions) ? rawConditions : [];
  const rawColumns: string[] = Array.isArray(basket?.columns ?? basketMeta?.columns)
    ? (basket?.columns ?? basketMeta?.columns ?? [])
    : [];

  const stocks = useMemo(() => stocksData?.stocks ?? [], [stocksData]);
  const pagination = stocksData?.pagination;
  const latestQuarter = stocksData?.latestQuarter;
  const icon = basket ? (CATEGORY_ICONS[basket.category] ?? "◈") : "";

  // ── Table state ───────────────────────────────────────────────────────────
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pageSize, setPageSize] = useState(20);

  // ── Watchlist modal state ─────────────────────────────────────────────────
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  // ── Build TanStack columns ────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<BasketStock>[]>(() => {
    const keysToShow: string[] = ["companyName", ...rawColumns.filter((k) => k !== "companyName")];

    const cols: ColumnDef<BasketStock>[] = [
      // Checkbox column
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomePageRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="accent-[var(--qc-ink)] h-3.5 w-3.5 rounded cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            className="accent-[var(--qc-ink)] h-3.5 w-3.5 rounded cursor-pointer"
          />
        ),
        size: 40,
        enableSorting: false,
      },
      // Row index
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-[11px] tabular-nums" style={{ color: "var(--qc-ink-2)" }}>
            {row.index + 1}
          </span>
        ),
        size: 40,
        enableSorting: false,
      },
    ];

    for (const key of keysToShow) {
      const meta = COL_META[key] ?? {
        label: key.replace(/([A-Z])/g, " $1").trim(),
        align: "right" as const,
        format: (v: number | null | undefined) => num(v),
      };

      cols.push({
        id: key,
        accessorKey: key,
        header: meta.label,
        cell: ({ row }) => {
          const val = cellStr(row.original, key);
          if (key === "symbol") {
            return <span className="font-mono text-[11px]">{val}</span>;
          }
          return val;
        },
        sortingFn: (a, b) => {
          const av = a.original[key];
          const bv = b.original[key];
          if (typeof av === "number" && typeof bv === "number") return av - bv;
          if (av == null) return 1;
          if (bv == null) return -1;
          return String(av).localeCompare(String(bv));
        },
        filterFn: "includesString",
      });
    }

    // Arrow column
    cols.push({
      id: "arrow",
      header: "",
      cell: () => (
        <ArrowRight
          className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--qc-ink)" }}
        />
      ),
      size: 40,
      enableSorting: false,
    });

    return cols;
  }, [rawColumns]);

  const table = useReactTable({
    data: stocks,
    columns,
    state: { sorting, columnFilters, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    enableRowSelection: true,
    getRowId: (row) => row.symbol,
  });

  // Sync external pageSize state → table
  const currentPageSize = table.getState().pagination.pageSize;
  if (currentPageSize !== pageSize) {
    table.setPageSize(pageSize);
  }

  const selectedSymbols = Object.keys(rowSelection);
  const selectedCount = selectedSymbols.length;

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!basketId) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>No basket selected.</p>
      </div>
    );
  }

  // Wait for industry list before deciding which path to take
  if (industryListLoading) {
    return (
      <div className="flex items-center justify-center py-32 gap-2" style={{ color: "var(--qc-ink-2)" }}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (isIndustryBasket) {
    return <IndustryBasketView basketId={basketId} />;
  }

  const isLoading = basketsLoading || (!basket && stocksLoading);
  const topError = basketsError || (!basket && stocksError);

  return (
    <>
      {/* Watchlist modal */}
      {showWatchlistModal && (
        <AddToWatchlistModal
          symbols={selectedSymbols}
          onClose={() => setShowWatchlistModal(false)}
          onSuccess={() => setRowSelection({})}
        />
      )}

      <div className="min-h-screen" style={{ background: "var(--qc-bg)" }}>

        {/* ── Hero header ── */}
        <div className="relative" style={{ background: "var(--qc-bg)" }}>
          {/* Lime radial bloom */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 60% 100% at 50% 0%, var(--qc-lime) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-8 pt-10 pb-8">

            {/* Loading state */}
            {isLoading && !basket && (
              <div className="flex items-center gap-2 py-16 justify-center" style={{ color: "var(--qc-ink-2)" }}>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading basket…</span>
              </div>
            )}

            {/* Top-level error */}
            {topError && (
              <div className="flex items-center gap-2 rounded-xl border border-down-soft bg-down-soft px-4 py-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--qc-down)" }} />
                <p className="text-sm" style={{ color: "var(--qc-down)" }}>{topError}</p>
              </div>
            )}

            {basket && (
              <div className="flex items-start justify-between gap-6 flex-wrap">
                {/* Left: back + title + description */}
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Back button */}
                  <button
                    onClick={() => router.push("/screener/home")}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium mb-1 transition-opacity hover:opacity-60"
                    style={{ color: "var(--qc-ink-2)" }}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Research Baskets
                  </button>

                  {/* Category tag */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border"
                    style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }}
                  >
                    <span className="text-[11px] font-mono" style={{ color: "var(--qc-ink-2)" }}>{icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.10em]" style={{ color: "var(--qc-ink-2)" }}>
                      {basket.category}
                    </span>
                  </div>

                  <h1 className="text-[22px] sm:text-[32px] font-medium leading-tight" style={{ color: "var(--qc-ink)" }}>
                    {basket.title}
                  </h1>
                  <p className="text-[14px] max-w-2xl leading-relaxed" style={{ color: "var(--qc-ink-2)" }}>
                    {basket.description}
                  </p>
                </div>

                {/* Right: stat pills */}
                <div className="flex items-center gap-3 flex-wrap pt-2 sm:pt-6">
                  {latestQuarter && (
                    <div
                      className="flex flex-col items-center gap-0.5 px-4 py-3 rounded-[10px] border"
                      style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--qc-ink-2)" }}>Quarter</span>
                      <span className="text-[15px] font-semibold" style={{ color: "var(--qc-ink)" }}>{latestQuarter}</span>
                    </div>
                  )}
                  {pagination && (
                    <div
                      className="flex flex-col items-center gap-0.5 px-4 py-3 rounded-[10px] border"
                      style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--qc-ink-2)" }}>Stocks</span>
                      <span className="text-[15px] font-semibold" style={{ color: "var(--qc-ink)" }}>{pagination.total}</span>
                    </div>
                  )}
                  {conditions.length > 0 && (
                    <div
                      className="flex flex-col items-center gap-0.5 px-4 py-3 rounded-[10px] border"
                      style={{ borderColor: "var(--qc-hair)", background: "var(--qc-lime)" }}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--qc-ink)" }}>Conditions</span>
                      <span className="text-[15px] font-semibold" style={{ color: "var(--qc-ink)" }}>{conditions.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Body content ── */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 space-y-4">

        {basket && (
          <>
            {/* Conditions panel */}
            {conditions.length > 0 && (
              <div
                className="rounded-[10px] border p-4 space-y-3"
                style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.10em]"
                  style={{ color: "var(--qc-ink)" }}
                >
                  Screening Conditions
                </p>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((c, i) => (
                    <ConditionPill key={i} condition={c} />
                  ))}
                </div>
              </div>
            )}

            {/* Stocks table panel */}
            <div
              className="rounded-[10px] border p-2"
              style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }}
            >
              {/* Toolbar */}
              <div className="px-2 pt-1 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.10em]"
                  style={{ color: "var(--qc-ink)" }}
                >
                  Matching Stocks
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Global search */}
                  <div
                    className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5"
                    style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
                  >
                    <Search className="h-3 w-3 flex-shrink-0" style={{ color: "var(--qc-ink-2)" }} />
                    <input
                      type="text"
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      placeholder="Search stocks…"
                      className="w-36 text-[12px] outline-none bg-transparent"
                      style={{ color: "var(--qc-ink)" }}
                    />
                    {globalFilter && (
                      <button onClick={() => setGlobalFilter("")}>
                        <X className="h-3 w-3" style={{ color: "var(--qc-ink-2)" }} />
                      </button>
                    )}
                  </div>

                  {/* Page size */}
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      table.setPageSize(Number(e.target.value));
                    }}
                    className="rounded-[8px] px-2 py-1.5 text-[11px] outline-none cursor-pointer"
                    style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", color: "var(--qc-ink-2)" }}
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>{n} / page</option>
                    ))}
                  </select>

                  {/* Add to watchlist CTA */}
                  {selectedCount > 0 ? (
                    <button
                      onClick={() => setShowWatchlistModal(true)}
                      className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[11px] font-semibold transition-opacity hover:opacity-80"
                      style={{ background: "var(--qc-ink)", color: "var(--qc-card)" }}
                    >
                      <Bookmark className="h-3 w-3" />
                      Add {selectedCount} to watchlist
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[11px] font-medium opacity-40"
                      style={{ background: "var(--qc-card)", color: "var(--qc-ink-2)", border: "1px solid var(--qc-hair)" }}
                    >
                      <Bookmark className="h-3 w-3" />
                      Watchlist
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div
                className="rounded-[10px] overflow-hidden"
                style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)" }}
              >
                {stocksLoading && (
                  <div className="flex items-center justify-center py-16 gap-2" style={{ color: "var(--qc-ink-2)" }}>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading stocks…</span>
                  </div>
                )}

                {!stocksLoading && stocksError && (
                  <div className="flex items-center justify-center py-16 gap-2" style={{ color: "var(--qc-down)" }}>
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{stocksError}</span>
                  </div>
                )}

                {!stocksLoading && !stocksError && stocks.length === 0 && (
                  <p className="text-sm text-center py-14" style={{ color: "var(--qc-ink-2)" }}>
                    No stocks matched this basket&apos;s criteria.
                  </p>
                )}

                {!stocksLoading && !stocksError && stocks.length > 0 && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id} style={{ borderBottom: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}>
                              {hg.headers.map((header) => {
                                const meta = header.column.id !== "select" &&
                                  header.column.id !== "index" &&
                                  header.column.id !== "arrow"
                                  ? (COL_META[header.column.id] ?? { align: "right" })
                                  : { align: "left" as const };

                                return (
                                  <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    className={`px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap select-none ${
                                      header.column.getCanSort() ? "cursor-pointer hover:opacity-70" : ""
                                    } ${meta.align === "right" ? "text-right" : "text-left"}`}
                                    style={{ color: "var(--qc-ink-2)" }}
                                  >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getCanSort() && (
                                      <SortIcon dir={header.column.getIsSorted()} />
                                    )}
                                  </th>
                                );
                              })}
                            </tr>
                          ))}
                        </thead>
                        <tbody>
                          {table.getRowModel().rows.map((row, i) => {
                            const isLast = i === table.getRowModel().rows.length - 1;
                            return (
                              <tr
                                key={row.id}
                                onClick={() =>
                                  router.push(
                                    `/screener/overview?symbol=${encodeURIComponent(row.original.symbol)}`
                                  )
                                }
                                className="cursor-pointer transition-colors group"
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-section)")}
                                onMouseLeave={e => (e.currentTarget.style.background = row.getIsSelected() ? "var(--qc-lime)" : "")}
                                style={{
                                  borderBottom: !isLast ? "1px solid var(--qc-hair-2)" : undefined,
                                  background: row.getIsSelected() ? "var(--qc-lime)" : undefined,
                                }}
                              >
                                {row.getVisibleCells().map((cell) => {
                                  const isRight =
                                    cell.column.id !== "select" &&
                                    cell.column.id !== "index" &&
                                    cell.column.id !== "arrow" &&
                                    (COL_META[cell.column.id]?.align ?? "right") === "right";

                                  return (
                                    <td
                                      key={cell.id}
                                      className={`px-4 py-3 text-sm whitespace-nowrap ${isRight ? "text-right" : "text-left"}`}
                                      style={{
                                        color:
                                          cell.column.id === "companyName"
                                            ? "var(--qc-ink)"
                                            : "var(--qc-ink-2)",
                                        fontWeight:
                                          cell.column.id === "companyName" ? 500 : 400,
                                      }}
                                    >
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination footer */}
                    <div
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3"
                      style={{ borderTop: "1px solid var(--qc-hair)" }}
                    >
                      <p className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>
                        {table.getFilteredRowModel().rows.length} result
                        {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
                        {selectedCount > 0 && (
                          <span className="ml-2 font-semibold" style={{ color: "var(--qc-ink)" }}>
                            · {selectedCount} selected
                          </span>
                        )}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className="rounded-[6px] p-1 disabled:opacity-30 transition-colors"
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-section)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}
                        >
                          <ChevronLeft className="h-4 w-4" style={{ color: "var(--qc-ink)" }} />
                        </button>
                        <span className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>
                          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                        </span>
                        <button
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          className="rounded-[6px] p-1 disabled:opacity-30 transition-colors"
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-section)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}
                        >
                          <ChevronRight className="h-4 w-4" style={{ color: "var(--qc-ink)" }} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
        </div>{/* end body content */}
      </div>{/* end min-h-screen */}
    </>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function BasketPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32 gap-2" style={{ color: "var(--qc-ink-2)" }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      }
    >
      <BasketContent />
    </Suspense>
  );
}
