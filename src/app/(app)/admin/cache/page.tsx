"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Database,
  RefreshCw,
  Trash2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Server,
  HardDrive,
  Layers,
  ArrowRight,
  Sparkles,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  Users2,
  Activity,
  Layers3,
} from "lucide-react";
import { authFetch, authHeaders } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";

interface MemoryStats {
  used: string;
  peak: string;
  max: string;
}

interface KeyCountItem {
  name: string;
  pattern: string;
  count: number;
}

interface WarmingState {
  isRunning: boolean;
  startTime: string | null;
  totalTickers: number;
  completedTickers: number;
  currentTicker: string | null;
  errors: { symbol: string; error: string }[];
}

interface CacheStatsResponse {
  success: boolean;
  connected: boolean;
  message?: string;
  host: string;
  port: number;
  memory?: MemoryStats;
  keyCounts?: Record<string, KeyCountItem>;
  warming?: WarmingState;
}

const DOMAIN_CARDS = [
  {
    key: "financials",
    title: "Financial Statements",
    description: "Annual & quarterly tables, ratios, and valuations. 14s cold latency without cache.",
    pattern: "qc:stock:*:financials*",
    icon: FileSpreadsheet,
    color: "text-blue-500",
  },
  {
    key: "charts",
    title: "KPI Charts",
    description: "P/E ratio, sales margin, EV/EBITDA, P/B, and Mcap/Sales series across quarters.",
    pattern: "qc:stock:*:charts:*",
    icon: BarChart3,
    color: "text-indigo-500",
  },
  {
    key: "peers",
    title: "Industry Peers",
    description: "Basic industry peer groups and comparative metric rankings.",
    pattern: "qc:stock:*:peers & qc:peers:industry:*",
    icon: Users2,
    color: "text-amber-500",
  },
  {
    key: "shareholding",
    title: "Shareholding Pattern",
    description: "Promoter, FII, DII, mutual fund and public holding series.",
    pattern: "qc:stock:*:shareholding*",
    icon: PieChart,
    color: "text-emerald-500",
  },
  {
    key: "technicals",
    title: "Technicals & Rule Engine",
    description: "Indicator scores, Wyckoff phases, trend quality, and decision intelligence.",
    pattern: "qc:stock:*:technicals*",
    icon: TrendingUp,
    color: "text-purple-500",
  },
  {
    key: "mod",
    title: "MOD Analysis (L3 & L4)",
    description: "Management, Opportunity, and Deal dimension insights & synthesized summary.",
    pattern: "qc:analysis:*",
    icon: Sparkles,
    color: "text-rose-500",
  },
  {
    key: "lenses",
    title: "Lens Evaluations",
    description: "Signal aggregations, composite lens scores, and category radar metrics.",
    pattern: "qc:lenses:*",
    icon: Layers3,
    color: "text-cyan-500",
  },
  {
    key: "prices",
    title: "Historical Prices & OHLCV",
    description: "Daily and monthly candles, trading volume, and index metrics.",
    pattern: "qc:stock:*:prices:*",
    icon: Activity,
    color: "text-slate-500",
  },
];

export default function AdminCachePage() {
  const [stats, setStats] = useState<CacheStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Ticker-specific invalidation state
  const [tickerInput, setTickerInput] = useState("");
  const [tickerScope, setTickerScope] = useState("all");

  // Warming state
  const [warmingTickers, setWarmingTickers] = useState("RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK");
  const [warmingDomains, setWarmingDomains] = useState<string[]>([
    "financials",
    "charts",
    "peers",
    "shareholding",
    "technicals",
    "mod",
    "lenses",
    "info",
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await authFetch(`${BACKEND_URL}/admin/cache/stats`, {
        headers: authHeaders(),
      });
      const data: CacheStatsResponse = await res.json();
      setStats(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load cache stats";
      setFeedback({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleInvalidate = async (scope: string, ticker?: string) => {
    const actionKey = ticker ? `ticker-${ticker}-${scope}` : `scope-${scope}`;
    setActionInProgress(actionKey);
    setFeedback(null);

    try {
      const res = await authFetch(`${BACKEND_URL}/admin/cache/invalidate`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ scope, ticker: ticker || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Invalidation failed");
      }
      setFeedback({
        type: "success",
        message: data.message || `Successfully invalidated ${data.deletedCount} cache key(s).`,
      });
      await fetchStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalidation failed";
      setFeedback({ type: "error", message: msg });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleWarmCache = async () => {
    setActionInProgress("warm");
    setFeedback(null);

    const tickers = warmingTickers
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);

    if (tickers.length === 0) {
      setFeedback({ type: "error", message: "Please provide at least one ticker symbol to warm." });
      setActionInProgress(null);
      return;
    }

    try {
      const res = await authFetch(`${BACKEND_URL}/admin/cache/warm`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          tickers,
          domains: warmingDomains,
          concurrency: 2,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to trigger cache warming");
      }
      setFeedback({
        type: "success",
        message: `Background warming started for ${tickers.length} tickers. This page will update automatically.`,
      });
      await fetchStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Warming trigger failed";
      setFeedback({ type: "error", message: msg });
    } finally {
      setActionInProgress(null);
    }
  };

  const toggleDomain = (domainKey: string) => {
    if (warmingDomains.includes(domainKey)) {
      setWarmingDomains(warmingDomains.filter((d) => d !== domainKey));
    } else {
      setWarmingDomains([...warmingDomains, domainKey]);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/coverage"
              className="text-[13px] text-ink-3 hover:text-ink transition-colors flex items-center gap-1"
            >
              <Layers className="size-3.5" />
              <span>Coverage</span>
            </Link>
            <span className="text-ink-3">/</span>
            <span className="text-[13px] text-ink font-medium">Cache Management</span>
          </div>
          <h1 className="text-[22px] font-[400] text-ink mt-1 flex items-center gap-2">
            <Database className="size-5 text-ink-2" />
            <span>Redis Cache Management</span>
          </h1>
          <p className="text-[13.5px] text-ink-2 mt-0.5">
            Real-time memory stats, domain-level invalidation, ticker purging, and cache warming.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchStats();
          }}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-hair bg-card hover:border-ink text-[13px] font-medium text-ink transition-colors shrink-0"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg border flex items-start gap-3 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
          )}
          <span className="text-[13px] flex-1">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] underline hover:opacity-80 ml-auto"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Connection Card */}
        <div className="rounded-lg border border-hair bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-ink-3 uppercase tracking-wider">Redis Node</span>
            <Server className="size-4 text-ink-3" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[18px] font-semibold text-ink">
              {stats?.connected ? "Connected" : "Offline"}
            </span>
            <span
              className={`size-2 rounded-full ${
                stats?.connected ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
              }`}
            />
          </div>
          <p className="text-[11.5px] text-ink-3 mt-1 font-mono">
            {stats?.host}:{stats?.port}
          </p>
        </div>

        {/* Memory Used Card */}
        <div className="rounded-lg border border-hair bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-ink-3 uppercase tracking-wider">Memory Used</span>
            <HardDrive className="size-4 text-ink-3" />
          </div>
          <div className="mt-2 text-[18px] font-semibold text-ink">
            {stats?.memory?.used || "N/A"}
          </div>
          <p className="text-[11.5px] text-ink-3 mt-1">
            Peak: {stats?.memory?.peak || "N/A"} · Max: {stats?.memory?.max || "unlimited"}
          </p>
        </div>

        {/* Total Keys Card */}
        <div className="rounded-lg border border-hair bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-ink-3 uppercase tracking-wider">Quantcase Keys</span>
            <Database className="size-4 text-ink-3" />
          </div>
          <div className="mt-2 text-[18px] font-semibold text-ink">
            {stats?.keyCounts?.all?.count ?? "..."}
          </div>
          <p className="text-[11.5px] text-ink-3 mt-1">
            Pattern: <span className="font-mono text-[11px]">qc:*</span>
          </p>
        </div>

        {/* Cache Warming Status Card */}
        <div className="rounded-lg border border-hair bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-ink-3 uppercase tracking-wider">Warming State</span>
            <Zap className="size-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[18px] font-semibold text-ink">
              {stats?.warming?.isRunning ? "Warming In Progress" : "Idle"}
            </span>
            {stats?.warming?.isRunning && <Loader2 className="size-4 animate-spin text-amber-500" />}
          </div>
          <p className="text-[11.5px] text-ink-3 mt-1">
            {stats?.warming?.isRunning
              ? `${stats.warming.completedTickers}/${stats.warming.totalTickers} tickers (${stats.warming.currentTicker || ""})`
              : "Ready for on-demand pre-warming"}
          </p>
        </div>
      </div>

      {/* Section 1: Domain-Level Invalidation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-medium text-ink">Domain-Level Invalidation</h2>
            <p className="text-[12.5px] text-ink-3">
              Clear cached records across all companies for a given functional domain.
            </p>
          </div>

          {/* Invalidate ALL button */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to flush ALL Quantcase cache keys? Users will experience cold loading until caches are regenerated."
                )
              ) {
                handleInvalidate("all");
              }
            }}
            disabled={actionInProgress !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-[12px] font-medium transition-colors"
          >
            {actionInProgress === "scope-all" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            <span>Flush All Caches</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {DOMAIN_CARDS.map((domain) => {
            const Icon = domain.icon;
            const count = stats?.keyCounts?.[domain.key]?.count ?? 0;
            const isDeleting = actionInProgress === `scope-${domain.key}`;

            return (
              <div
                key={domain.key}
                className="rounded-lg border border-hair bg-card p-4 flex flex-col justify-between space-y-3 hover:border-ink/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-secondary shrink-0">
                        <Icon className={`size-4 ${domain.color}`} />
                      </div>
                      <span className="text-[13.5px] font-medium text-ink">{domain.title}</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-ink-2 font-mono">
                      {count}
                    </span>
                  </div>
                  <p className="text-[12px] text-ink-3 mt-2 line-clamp-2">{domain.description}</p>
                  <p className="text-[10.5px] text-ink-3/70 font-mono mt-2 truncate" title={domain.pattern}>
                    {domain.pattern}
                  </p>
                </div>

                <button
                  onClick={() => handleInvalidate(domain.key)}
                  disabled={actionInProgress !== null}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border border-hair bg-secondary hover:bg-ink hover:text-white text-[12px] font-medium text-ink transition-colors"
                >
                  {isDeleting ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                  <span>Invalidate Domain</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Ticker-Specific Invalidation & Section 3: Cache Warming Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Ticker Invalidation Box */}
        <div className="rounded-lg border border-hair bg-card p-5 space-y-4">
          <div>
            <h2 className="text-[15px] font-medium text-ink flex items-center gap-2">
              <Trash2 className="size-4 text-ink-2" />
              <span>Single Ticker Invalidation</span>
            </h2>
            <p className="text-[12.5px] text-ink-3 mt-0.5">
              Purge cached data for a specific stock ticker to test changes immediately.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[12px] font-medium text-ink-2 block mb-1">
                NSE Ticker Symbol
              </label>
              <input
                type="text"
                placeholder="e.g. INFY, TCS, HDFCBANK"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                className="w-full rounded-md border border-hair bg-secondary px-3 py-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-ink uppercase"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-ink-2 block mb-1">
                Invalidation Scope
              </label>
              <select
                value={tickerScope}
                onChange={(e) => setTickerScope(e.target.value)}
                className="w-full rounded-md border border-hair bg-secondary px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink"
              >
                <option value="all">All Ticker Data (Financials, Charts, MOD, Technicals, Lenses, Info)</option>
                <option value="financials">Financial Statements Only</option>
                <option value="charts">KPI Charts Only</option>
                <option value="peers">Peers Row Only</option>
                <option value="shareholding">Shareholding Pattern Only</option>
                <option value="technicals">Technicals & Rule Engine Only</option>
                <option value="mod">MOD Analysis (L3 & L4) Only</option>
                <option value="lenses">Lens Evaluations Only</option>
                <option value="info">Company Info Only</option>
                <option value="prices">Historical Prices Only</option>
              </select>
            </div>

            <button
              onClick={() => {
                if (!tickerInput.trim()) {
                  setFeedback({ type: "error", message: "Please enter a ticker symbol." });
                  return;
                }
                handleInvalidate(tickerScope, tickerInput.trim());
              }}
              disabled={actionInProgress !== null || !tickerInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-ink text-[var(--qc-on-dark)] hover:opacity-90 disabled:opacity-50 text-[13px] font-medium transition-opacity"
            >
              {actionInProgress?.startsWith("ticker-") ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              <span>Purge Ticker Cache</span>
            </button>
          </div>
        </div>

        {/* Cache Warming Box */}
        <div className="rounded-lg border border-hair bg-card p-5 space-y-4">
          <div>
            <h2 className="text-[15px] font-medium text-ink flex items-center gap-2">
              <Zap className="size-4 text-amber-500" />
              <span>Pre-Warm Cache</span>
            </h2>
            <p className="text-[12.5px] text-ink-3 mt-0.5">
              Compute and cache records in background so users experience instant ~40ms responses.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[12px] font-medium text-ink-2">Tickers (Comma-separated)</label>
                <button
                  type="button"
                  onClick={() =>
                    setWarmingTickers("RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK, HINDUNILVR, ITC, SBIN, BHARTIARTL, KOTAKBANK")
                  }
                  className="text-[11px] text-ink-3 hover:text-ink underline"
                >
                  Load Top 10
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. INFY, TCS, RELIANCE"
                value={warmingTickers}
                onChange={(e) => setWarmingTickers(e.target.value)}
                className="w-full rounded-md border border-hair bg-secondary px-3 py-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-ink uppercase"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-ink-2 block mb-1.5">
                Domains to Warm
              </label>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                {[
                  { key: "financials", label: "Financials Statements" },
                  { key: "charts", label: "KPI Charts" },
                  { key: "peers", label: "Industry Peers" },
                  { key: "shareholding", label: "Shareholding" },
                  { key: "technicals", label: "Technicals & Rules" },
                  { key: "mod", label: "MOD Analysis" },
                  { key: "lenses", label: "Lenses" },
                  { key: "info", label: "Company Info" },
                ].map((d) => (
                  <label
                    key={d.key}
                    className="flex items-center gap-2 cursor-pointer select-none text-ink-2 hover:text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={warmingDomains.includes(d.key)}
                      onChange={() => toggleDomain(d.key)}
                      className="rounded border-hair"
                    />
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleWarmCache}
              disabled={actionInProgress !== null || stats?.warming?.isRunning}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 text-[13px] font-medium transition-colors"
            >
              {actionInProgress === "warm" || stats?.warming?.isRunning ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Zap className="size-3.5" />
              )}
              <span>
                {stats?.warming?.isRunning ? "Warming Running in Background..." : "Trigger Background Warming"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
