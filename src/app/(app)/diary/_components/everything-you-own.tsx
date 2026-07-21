"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Loader2, Pencil, RefreshCw, Search } from "lucide-react";
import { Popover } from "radix-ui";

import { TabToggle } from "@/components/molecules/tab-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtLakhs, fmtPrice, fmtSignedPct, brokerLabel } from "@/lib/portfolio-format";
import { brokerAccountCount } from "../_lib/diary-derive";
import type { SmallcaseHoldingsData, SmallcaseHolding } from "@/types/smallcase";
import type { TickerMetrics } from "@/hooks/useTickerMetrics";

const PAGE_SIZE = 8;

interface EverythingYouOwnProps {
  data: SmallcaseHoldingsData | null;
  loading: boolean;
  notConnected: boolean;
  syncing: boolean;
  onSync: () => void;
  onConnect: () => void;
  onPick: (ticker: string) => void;
  /**
   * CMP by uppercased ticker. The holdings API has no price of its own — it
   * sends a position's value, not the quote behind it — so the column is joined
   * in from the bulk ticker read. Absent until that lands.
   */
  metrics: Map<string, TickerMetrics>;
}

export function EverythingYouOwn({
  data, loading, notConnected, syncing, onSync, onConnect, onPick, metrics,
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
        <HoldingsList holdings={holdings} onPick={onPick} metrics={metrics} />
      ) : (
        <AllocationChart holdings={holdings} total={totalValue} />
      )}
    </section>
  );
}

// ── List ─────────────────────────────────────────────────────────────────────

function HoldingsList({
  holdings, onPick, metrics,
}: { holdings: SmallcaseHolding[]; onPick: (t: string) => void; metrics: Map<string, TickerMetrics> }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  // Empty = no broker constraint, which is not the same as "none selected".
  const [pickedBrokers, setPickedBrokers] = useState<Set<string>>(new Set());

  // Only the brokers actually holding something — offering an empty filter is noise.
  const brokerOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const h of holdings) {
      const slug = (h.broker ?? "").toLowerCase();
      if (slug && !seen.has(slug)) seen.set(slug, brokerLabel(h.broker));
    }
    return [...seen].map(([slug, label]) => ({ slug, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [holdings]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return holdings.filter((h) => {
      if (pickedBrokers.size > 0 && !pickedBrokers.has((h.broker ?? "").toLowerCase())) return false;
      if (!q) return true;
      // Ticker and name are both how someone recalls a position.
      return h.ticker.toLowerCase().includes(q) || (h.name?.toLowerCase().includes(q) ?? false);
    });
  }, [holdings, query, pickedBrokers]);

  function toggleBroker(slug: string) {
    setPickedBrokers((prev) => {
      const next = new Set(prev);
      if (!next.delete(slug)) next.add(slug);
      return next;
    });
    setPage(0);
  }

  const pageCount = Math.max(Math.ceil(matches.length / PAGE_SIZE), 1);
  // Filtering shrinks the list under a page we may already be past.
  const safePage = Math.min(page, pageCount - 1);
  const rows = matches.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const first = matches.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const last = safePage * PAGE_SIZE + rows.length;

  return (
    <div className="overflow-hidden rounded-xl border border-hair bg-card">
      <div className="flex items-center gap-2 border-b border-hair px-5 py-3">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-3" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder="Search holdings"
            aria-label="Search holdings"
            className="h-8 border-hair pl-8 text-[13px]"
          />
        </div>
        {brokerOptions.length > 0 && (
          <BrokerFilter
            options={brokerOptions}
            picked={pickedBrokers}
            onToggle={toggleBroker}
            onClear={() => { setPickedBrokers(new Set()); setPage(0); }}
          />
        )}
      </div>

      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 border-b border-hair px-5 py-3">
        <span className="eyebrow">Holding</span>
        <span className="eyebrow text-right">Avg Buy</span>
        <span className="eyebrow text-right">Invested</span>
        <span className="eyebrow text-right">CMP</span>
        <span className="eyebrow text-right">Amount</span>
        <span aria-hidden className="w-6" />
      </div>

      {rows.length === 0 && (
        <div className="px-5 py-10 text-center text-[13px] text-ink-2">
          {query.trim()
            ? <>Nothing matches &ldquo;{query.trim()}&rdquo;.</>
            : "No holdings at the selected brokers."}
        </div>
      )}

      {rows.map((h) => {
        // Row opens the stock's overview page; the pencil opens the journal
        // drawer. A plain button can't wrap the pencil button, so the row is a
        // keyboard-activatable div and the pencil stops the event bubbling.
        const openOverview = () =>
          router.push(`/screener/overview?symbol=${encodeURIComponent(h.ticker)}`);

        return (
        <div
          key={h.id}
          role="button"
          tabIndex={0}
          onClick={openOverview}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openOverview(); }
          }}
          className="grid w-full cursor-pointer grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 border-b border-hair px-5 py-3.5 text-left transition-colors hover:bg-secondary"
        >
          <span className="min-w-0">
            <span className="mono block truncate text-[12px] font-semibold text-ink">{h.ticker}</span>
            {/* name is nullable on the API; the ticker already carries identity */}
            {h.name && <span className="block truncate text-[12px] text-ink-3">{h.name}</span>}
          </span>

          {/* Cost basis, straight off the holding — both keys are non-null, so
              these columns always render even when the live price hasn't. */}
          <span className="mono text-right text-[13px] text-ink-2">{fmtPrice(h.avg_price)}</span>

          <span className="mono text-right text-[13px] text-ink-2">{fmtLakhs(h.invested_value)}</span>

          {/* Joined in by ticker, so it's blank for a scrip the backend doesn't
              know (`notFound`) and until the metrics request lands. */}
          <span className="mono text-right text-[13px] text-ink-2">
            {fmtPrice(metrics.get(h.ticker.trim().toUpperCase())?.cmp)}
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

          {/* Journal, not overview — stop the row's navigation from firing too */}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => { e.stopPropagation(); onPick(h.ticker); }}
            aria-label={`Open journal for ${h.ticker}`}
            className="text-ink-3 hover:text-ink"
          >
            <Pencil className="size-3.5" />
          </Button>
        </div>
        );
      })}

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

// ── Broker filter ────────────────────────────────────────────────────────────

function BrokerFilter({
  options, picked, onToggle, onClear,
}: {
  options: { slug: string; label: string }[];
  picked: Set<string>;
  onToggle: (slug: string) => void;
  onClear: () => void;
}) {
  // Naming the broker when it's the only one picked beats a bare "1" count.
  const summary =
    picked.size === 0 ? "All brokers"
    : picked.size === 1 ? (options.find((o) => picked.has(o.slug))?.label ?? "1 broker")
    : `${picked.size} brokers`;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="pill" size="sm" className="shrink-0 text-[13px]" aria-label="Filter by broker">
          {summary}
          <ChevronDown aria-hidden className="size-3.5 text-ink-3" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[180px] rounded-lg border border-hair bg-card p-1 shadow-[var(--qc-shadow-shell)]"
        >
          {options.map((o) => {
            const on = picked.has(o.slug);
            return (
              <button
                key={o.slug}
                type="button"
                role="menuitemcheckbox"
                aria-checked={on}
                onClick={() => onToggle(o.slug)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-secondary"
              >
                <Check aria-hidden className={`size-3.5 shrink-0 text-ink ${on ? "" : "invisible"}`} />
                <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ background: brokerDot(o.slug) }} />
                <span className="truncate text-[13px] text-ink">{o.label}</span>
              </button>
            );
          })}
          {picked.size > 0 && (
            <>
              <div className="my-1 border-t border-hair" />
              <button
                type="button"
                onClick={onClear}
                className="w-full rounded-md px-2 py-1.5 text-left text-[12px] text-ink-2 transition-colors hover:bg-secondary"
              >
                Clear filter
              </button>
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
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
