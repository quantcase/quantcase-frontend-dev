"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Search } from "lucide-react";

import { TabToggle } from "@/components/molecules/tab-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmt, fmtLakhs, fmtSignedPct, brokerLabel } from "@/lib/portfolio-format";
import { brokerAccountCount } from "../_lib/diary-derive";
import type { SmallcaseHoldingsData, SmallcaseHolding } from "@/types/smallcase";

const PAGE_SIZE = 8;

interface EverythingYouOwnProps {
  data: SmallcaseHoldingsData | null;
  loading: boolean;
  notConnected: boolean;
  syncing: boolean;
  onSync: () => void;
  onConnect: () => void;
  onPick: (ticker: string) => void;
}

export function EverythingYouOwn({
  data, loading, notConnected, syncing, onSync, onConnect, onPick,
}: EverythingYouOwnProps) {
  const [view, setView] = useState("List");

  const holdings = useMemo(
    // Largest position first — that's the one whose thesis matters most.
    () => [...(data?.holdings ?? [])].sort((a, b) => b.display_value - a.display_value),
    [data],
  );
  const brokers = useMemo(() => brokerAccountCount(holdings), [holdings]);
  const totalValue = data?.portfolio?.total_value ?? holdings.reduce((s, h) => s + h.display_value, 0);

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow">Everything you own</div>
          {!loading && !notConnected && holdings.length > 0 && (
            <div className="mt-1 text-[13px] text-ink-2">
              <span className="mono">{fmtLakhs(totalValue)}</span> across {brokers || 1}{" "}
              {brokers === 1 ? "broker account" : "broker accounts"}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!notConnected && holdings.length > 0 && (
            <Button variant="pill" size="sm" onClick={onSync} disabled={syncing} aria-label="Refresh holdings">
              {syncing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Sync Holdings
            </Button>
          )}
          <TabToggle options={["List", "Chart"]} value={view} onChange={setView} variant="outline" />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-hair bg-card p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer mb-3 h-8 rounded last:mb-0" />
          ))}
        </div>
      ) : notConnected || holdings.length === 0 ? (
        <ConnectPrompt onConnect={onConnect} />
      ) : view === "List" ? (
        <HoldingsList holdings={holdings} onPick={onPick} />
      ) : (
        <AllocationChart holdings={holdings} total={totalValue} />
      )}
    </section>
  );
}

// ── List ─────────────────────────────────────────────────────────────────────

function HoldingsList({ holdings, onPick }: { holdings: SmallcaseHolding[]; onPick: (t: string) => void }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return holdings;
    // Ticker and name are both how someone recalls a position.
    return holdings.filter(
      (h) => h.ticker.toLowerCase().includes(q) || (h.name?.toLowerCase().includes(q) ?? false),
    );
  }, [holdings, query]);

  const pageCount = Math.max(Math.ceil(matches.length / PAGE_SIZE), 1);
  // Filtering shrinks the list under a page we may already be past.
  const safePage = Math.min(page, pageCount - 1);
  const rows = matches.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const first = matches.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const last = safePage * PAGE_SIZE + rows.length;

  return (
    <div className="overflow-hidden rounded-xl border border-hair bg-card">
      <div className="border-b border-hair px-5 py-3">
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-3" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder="Search holdings"
            aria-label="Search holdings"
            className="h-8 border-hair pl-8 text-[13px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-[1.7fr_1fr_0.6fr_1fr] gap-3 border-b border-hair px-5 py-3">
        <span className="eyebrow">Holding</span>
        <span className="eyebrow text-right">Amount</span>
        <span className="eyebrow text-right">Qty</span>
        <span className="eyebrow text-right">Broker</span>
      </div>

      {rows.length === 0 && (
        <div className="px-5 py-10 text-center text-[13px] text-ink-2">
          Nothing matches &ldquo;{query.trim()}&rdquo;.
        </div>
      )}

      {rows.map((h) => (
        <button
          key={h.id}
          onClick={() => onPick(h.ticker)}
          className="grid w-full grid-cols-[1.7fr_1fr_0.6fr_1fr] items-center gap-3 border-b border-hair px-5 py-3.5 text-left transition-colors hover:bg-secondary"
        >
          <span className="min-w-0">
            <span className="mono block truncate text-[12px] font-semibold text-ink">{h.ticker}</span>
            {/* name is nullable on the API; the ticker already carries identity */}
            {h.name && <span className="block truncate text-[12px] text-ink-3">{h.name}</span>}
          </span>

          <span className="text-right">
            {/* display_value is never null — current_value is, without a live price */}
            <span className="mono block text-[13px] text-ink">{fmtLakhs(h.display_value)}</span>
            {h.pnl_pct != null && (
              <span className={`mono block text-[11px] ${h.pnl_pct >= 0 ? "text-up" : "text-down"}`}>
                {fmtSignedPct(h.pnl_pct)}
              </span>
            )}
          </span>

          <span className="mono text-right text-[13px] text-ink-2">{fmt(h.quantity)}</span>

          <span className="flex items-center justify-end gap-1.5">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ background: brokerDot(h.broker) }} />
            <span className="truncate text-[12px] text-ink-2">{brokerLabel(h.broker)}</span>
          </span>
        </button>
      ))}

      {matches.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <span className="text-[12px] text-ink-3">
            <span className="mono">{first}&ndash;{last}</span> of <span className="mono">{matches.length}</span>
          </span>

          <span className="flex items-center gap-2">
            <Button
              variant="pill"
              size="icon-sm"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="mono text-[12px] text-ink-2">
              {safePage + 1} / {pageCount}
            </span>
            <Button
              variant="pill"
              size="icon-sm"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage >= pageCount - 1}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </span>
        </div>
      )}
    </div>
  );
}

// ── Chart ────────────────────────────────────────────────────────────────────

function AllocationChart({ holdings, total }: { holdings: SmallcaseHolding[]; total: number }) {
  const rows = holdings.slice(0, 8);
  const max = Math.max(...rows.map((h) => h.display_value), 1);

  return (
    <div className="rounded-xl border border-hair bg-card px-5 py-4">
      {rows.map((h) => {
        const share = total > 0 ? (h.display_value / total) * 100 : 0;
        return (
          <div key={h.id} className="mb-3.5 last:mb-0">
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="mono text-[12px] font-semibold text-ink">{h.ticker}</span>
              <span className="mono text-[12px] text-ink-2">
                {fmtLakhs(h.display_value)} <span className="text-ink-3">· {share.toFixed(1)}%</span>
              </span>
            </div>
            {/* Magnitude, not sentiment — navy fill, per the gauge convention */}
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-ink" style={{ width: `${(h.display_value / max) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Empty ────────────────────────────────────────────────────────────────────

function ConnectPrompt({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-hair px-6 py-12 text-center">
      <div className="mb-1.5 text-[17px] font-medium text-ink">Nothing here yet</div>
      <p className="mx-auto mb-5 max-w-[380px] text-[13px] leading-[1.5] text-ink-2">
        Connect a broker and your holdings appear here — with the reasoning you wrote against each one.
      </p>
      <Button onClick={onConnect}>Connect a broker</Button>
    </div>
  );
}

// Broker identity, not data sentiment — a stable hue per broker so rows are
// scannable. Deliberately drawn from the neutral/brand ramp, never the
// semantic up/down colors.
const BROKER_DOTS: Record<string, string> = {
  kite: "var(--qc-up)",
  zerodha: "var(--qc-up)",
  groww: "var(--qc-brand-accent)",
  angelone: "var(--qc-warn)",
  angel_one: "var(--qc-warn)",
  upstox: "var(--qc-blue)",
  hdfc: "var(--qc-warn)",
  kotak: "var(--qc-blue)",
};

function brokerDot(slug: string | null): string {
  if (!slug) return "var(--qc-ink-3)";
  return BROKER_DOTS[slug.toLowerCase()] ?? "var(--qc-ink-3)";
}
