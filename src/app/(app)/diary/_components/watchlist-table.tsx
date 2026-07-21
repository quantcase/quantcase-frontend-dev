"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2, Pencil, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStocks } from "@/hooks/useStocks";
import { useJournalMutations } from "@/hooks/useJournalMutations";
import { NIFTY50_TICKERS } from "@/lib/journal-ideas";
import { fmtPrice } from "@/lib/portfolio-format";
import { entryExcerpt, relativeTime } from "../_lib/diary-derive";
import type { DiaryTicker } from "../_lib/diary-derive";

interface WatchlistTableProps {
  /** The selected journal's tickers, in full. */
  tickers: DiaryTicker[];
  /** Null when no journal is selected — the switcher still renders, the table doesn't. */
  journalId: string | null;
  loading: boolean;
  onOpen: (t: DiaryTicker) => void;
  onChanged: () => void;
  /**
   * The watchlist switcher, rendered between this section's title and its
   * table. Passed in rather than built here so the table stays about tickers
   * and knows nothing about journals.
   */
  switcher?: React.ReactNode;
}

// The selected watchlist, rendered whole: every ticker in that journal, whatever
// you have or haven't written about it. The tab's count is the row count — no
// filtering here, or the pill would promise rows the table doesn't show. Only
// the Holdings journal is excluded, and that happens upstream by dropping it
// from the switcher entirely.
export function WatchlistTable({ tickers, journalId, loading, onOpen, onChanged, switcher }: WatchlistTableProps) {
  const router = useRouter();
  const { addTickers, removeTicker, mutating } = useJournalMutations();
  const [adding, setAdding] = useState(false);
  const [confirmTicker, setConfirmTicker] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const existing = useMemo(() => tickers.map((t) => t.ticker), [tickers]);

  function handleAdd(ticker: string) {
    if (!journalId) return;
    setError(null);
    addTickers(journalId, [ticker], () => { setAdding(false); onChanged(); }, setError);
  }

  function handleRemove(ticker: string) {
    if (!journalId) return;
    setError(null);
    removeTicker(journalId, ticker, () => { setConfirmTicker(null); onChanged(); }, setError);
  }

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow">On your trackers</div>
          {!loading && tickers.length > 0 && (
            <div className="mt-1 text-[13px] text-ink-2">
              {`${tickers.length} ${tickers.length === 1 ? "stock" : "stocks"} you're tracking`}
            </div>
          )}
        </div>

        {journalId && (adding ? (
          <AddTickerCombo
            existing={existing}
            busy={mutating}
            onAdd={handleAdd}
            onClose={() => setAdding(false)}
          />
        ) : (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" />
            Add to tracker
          </Button>
        ))}
      </div>

      {switcher && <div className="mb-4">{switcher}</div>}

      {error && (
        <div className="mb-3 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">{error}</div>
      )}

      {/* Not gated on `journalId`: these rows span journals, so they render
          whether or not one is selected. Only the add/remove controls need a
          journal to write to. */}
      {loading ? (
        <div className="rounded-xl border border-hair bg-card p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer mb-3 h-8 rounded last:mb-0" />
          ))}
        </div>
      ) : tickers.length === 0 ? (
        <IdeasEmpty existing={existing} onPick={handleAdd} busy={mutating} canAdd={Boolean(journalId)} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-hair bg-card">
          <div className="grid grid-cols-[1.2fr_1fr_0.7fr_2fr_auto] gap-4 border-b border-hair px-5 py-3">
            <span className="eyebrow">Company</span>
            <span className="eyebrow">Sector</span>
            <span className="eyebrow text-right">CMP</span>
            <span className="eyebrow">Notes</span>
            <span className="eyebrow w-[132px] text-right">Added</span>
          </div>

          {tickers.map((t) => {
            // Literally the latest entry, note or thesis — this column is
            // "Latest", so recency wins. The strip card prefers the thesis
            // instead, but that card is filed under "Your thesis" and would
            // contradict its section by quoting a note; a roster row has no
            // such claim to contradict.
            const note = entryExcerpt(t.latestEntry);
            const confirming = confirmTicker === t.ticker;

            // Row opens the stock's overview page; the pencil opens the journal
            // drawer. The row is a keyboard-activatable div (a button can't wrap
            // the action buttons), and every action stops the event bubbling so
            // it doesn't also navigate.
            const openOverview = () =>
              router.push(`/screener/overview?symbol=${encodeURIComponent(t.ticker)}`);

            return (
              <div
                key={t.ticker}
                role="button"
                tabIndex={0}
                onClick={openOverview}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openOverview(); }
                }}
                className="grid cursor-pointer grid-cols-[1.2fr_1fr_0.7fr_2fr_auto] items-center gap-4 border-b border-hair px-5 py-3.5 last:border-0 hover:bg-secondary"
              >
                <span className="min-w-0">
                  <span className="mono block truncate text-[12px] font-semibold text-ink">{t.ticker}</span>
                  {/* Universe fetch can land after the journal — fall back to the ticker */}
                  {t.name && <span className="block truncate text-[12px] text-ink-3">{t.name}</span>}
                </span>

                <span className="truncate text-[12px] text-ink-2">{t.sector ?? "—"}</span>

                {/* Metrics arrive on their own request — an em-dash until they do,
                    same as an unknown ticker. Magnitude, not sentiment: plain ink. */}
                <span className="mono text-right text-[13px] text-ink">{fmtPrice(t.metrics?.cmp)}</span>

                <span className="min-w-0">
                  {note ? (
                    <span className="serif line-clamp-2 text-[13px] italic leading-[1.45] text-ink-2">
                      &ldquo;{note}&rdquo;
                    </span>
                  ) : (
                    <span className="text-[12px] text-ink-3">Nothing written yet</span>
                  )}
                </span>

                <span className="flex w-[132px] items-center justify-end gap-2">
                  {confirming ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(t.ticker); }}
                        disabled={mutating}
                        className="rounded-md bg-down px-2.5 py-1 text-[11px] font-medium text-[var(--qc-on-dark)] disabled:opacity-60"
                      >
                        {mutating ? <Loader2 className="size-3 animate-spin" /> : "Remove"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmTicker(null); }}
                        aria-label="Cancel"
                        className="flex size-6 items-center justify-center rounded-md border border-hair text-ink-2"
                      >
                        <X className="size-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="mono text-[11px] text-ink-3">{relativeTime(t.addedAt)}</span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => { e.stopPropagation(); onOpen(t); }}
                        aria-label={`Open journal for ${t.ticker}`}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => { e.stopPropagation(); setConfirmTicker(t.ticker); }}
                        aria-label={`Remove ${t.ticker}`}
                        className="text-ink-3 hover:text-down"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Add combo ────────────────────────────────────────────────────────────────
// Autocompletes the stock universe; a free-typed ticker is allowed (the backend
// validates). Carried over from the retired journal-detail header control.

function AddTickerCombo({
  existing, busy, onAdd, onClose,
}: { existing: string[]; busy: boolean; onAdd: (t: string) => void; onClose: () => void }) {
  const { stocks } = useStocks();
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const existingSet = useMemo(() => new Set(existing.map((t) => t.toUpperCase())), [existing]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return stocks
      .filter((s) => s.ticker && !existingSet.has(s.ticker.toUpperCase()))
      .filter(
        (s) =>
          s.ticker?.toLowerCase().includes(q) ||
          s.name?.toLowerCase().includes(q) ||
          s.industry?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, stocks, existingSet]);

  function add(ticker: string) {
    const t = ticker.trim().toUpperCase();
    if (!t || existingSet.has(t)) return;
    onAdd(t);
    setQuery("");
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2 rounded-md border border-hair-strong bg-card px-2.5 py-1.5">
        {busy ? <Loader2 className="size-3.5 shrink-0 animate-spin text-ink-3" /> : <Search className="size-3.5 shrink-0 text-ink-3" />}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) add(results[0]?.ticker ?? query);
            if (e.key === "Escape") onClose();
          }}
          autoFocus
          placeholder="Add a ticker…"
          aria-label="Add a ticker to this watchlist"
          className="w-[190px] bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute right-0 z-[100] mt-1 w-[300px] overflow-hidden rounded-md border border-hair bg-card shadow-[var(--qc-shadow-annot)]">
          {results.map((s) => (
            <button
              key={s.ticker}
              onClick={() => add(s.ticker)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-secondary"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-ink">{s.name}</span>
                <span className="block truncate text-[11px] text-ink-3">{s.industry}</span>
              </span>
              <span className="mono flex shrink-0 items-center gap-1 text-[11px] text-ink-2">
                <Plus className="size-3" />
                {s.ticker}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Empty ────────────────────────────────────────────────────────────────────
// A rotating window of Nifty50 ideas so the table is never a dead end.
// Carried over from the retired ideas-empty-state.

function IdeasEmpty({
  existing, onPick, busy, canAdd,
}: { existing: string[]; onPick: (t: string) => void; busy: boolean; canAdd: boolean }) {
  const existingSet = useMemo(() => new Set(existing.map((t) => t.toUpperCase())), [existing]);
  const [offset, setOffset] = useState(0);

  const ideas = useMemo(() => {
    const pool = NIFTY50_TICKERS.filter((t) => !existingSet.has(t));
    return Array.from({ length: Math.min(6, pool.length) }, (_, i) => pool[(offset + i) % pool.length]);
  }, [existingSet, offset]);

  return (
    <div className="rounded-xl border border-dashed border-hair px-6 py-12 text-center">
      <div className="mb-1.5 text-[17px] font-medium text-ink">Nothing here yet</div>
      <p className="mx-auto mb-5 max-w-[400px] text-[13px] leading-[1.5] text-ink-2">
        Add a stock to this watchlist to start following it.
      </p>

      <div className="flex flex-wrap justify-center gap-1.5">
        {ideas.map((t) => (
          <button
            key={t}
            onClick={() => onPick(t)}
            disabled={busy || !canAdd}
            className="mono rounded-md border border-hair bg-card px-2.5 py-1 text-[11px] text-ink-2 transition-colors hover:border-ink-3 hover:text-ink disabled:opacity-60"
          >
            + {t}
          </button>
        ))}
        <button
          onClick={() => setOffset((o) => o + 6)}
          className="rounded-md px-2.5 py-1 text-[11px] text-ink-3 hover:text-ink"
        >
          More ideas →
        </button>
      </div>
    </div>
  );
}
