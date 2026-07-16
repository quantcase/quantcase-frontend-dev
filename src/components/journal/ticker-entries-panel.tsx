"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus } from "lucide-react";
import { EntryTimelineItem } from "./entry-timeline-item";
import { EntryComposer } from "./entry-composer";
import { Button } from "@/components/ui/button";
import { fmtPrice } from "@/lib/journal-format";
import { fmtSignedPct } from "@/lib/portfolio-format";
import type { TickerMarket } from "@/types/journal";
import type { SourcedEntry } from "@/app/(app)/diary/_lib/diary-derive";

interface Props {
  /** The journal new entries are written to. Reads come from `entries`. */
  journalId: string;
  /**
   * Every entry to show, newest first, each stamped with the journal it's filed
   * under — a ticker in both Holdings and Tracking has one story told in two
   * places, and this is that story merged.
   *
   * Passed in rather than fetched: the journal tree already carries it, so a
   * fetch here would re-request data the caller is holding (and could disagree
   * with the card the drawer was opened from).
   */
  entries: SourcedEntry[];
  /**
   * Whether `entries` is settled. An unsettled list is `[]` too, so without this
   * the drawer can't tell "no entries" from "not loaded yet" — and it opens the
   * composer on the former. Defaults to true for callers that hold their entries
   * before the drawer mounts.
   */
  entriesReady?: boolean;
  ticker: string;
  /** Optional market snapshot to show in the panel header. */
  market?: TickerMarket | null;
  /** Ticker's display name, if known. */
  name?: string | null;
  onClose: () => void;
  /** Fired whenever an entry is added/edited/deleted/evaluated, so the owner of
   *  `entries` can refetch. */
  onChanged?: () => void;
}

export function TickerEntriesPanel({ journalId, entries, entriesReady = true, ticker, market, name, onClose, onChanged }: Props) {
  // Nothing to read means nothing to click through to write it: open the
  // composer for an empty ticker. Not a `useState` initializer — callers that
  // fetch mount this drawer before their entries land, and an initializer would
  // read that transient `[]` and open the composer over a timeline that's about
  // to arrive. Latched so it only ever fires on the first settled read, leaving
  // the user free to close it (and keeping it shut after they delete the last
  // entry, which is a deletion, not an invitation to write).
  const settledEmpty = entriesReady && entries.length === 0;
  const [composing, setComposing] = useState(settledEmpty);
  const [autoOpened, setAutoOpened] = useState(settledEmpty);
  useEffect(() => {
    if (autoOpened || !settledEmpty) return;
    setAutoOpened(true);
    setComposing(true);
  }, [autoOpened, settledEmpty]);

  // Only worth naming the journal on each entry when the list actually spans
  // more than one — otherwise the badge states a fact the header already implies.
  const journalIds = useMemo(
    () => new Set(entries.map((e) => e.journalId)),
    [entries],
  );
  const showJournalBadge = journalIds.size > 1;
  const writeTargetName = showJournalBadge
    ? entries.find((e) => e.journalId === journalId)?.journalName ?? null
    : null;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // The parent owns `entries`, so it owns refreshing them — this drawer has
  // nothing of its own to refetch.
  function afterChange() {
    onChanged?.();
  }

  const changePositive = (market?.change ?? 0) >= 0;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onClick={onClose} />

      {/* Sheet */}
      <div className="relative flex h-full w-full max-w-[520px] flex-col border-l border-hair bg-card shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-bold tracking-[0.02em] text-ink">{ticker}</span>
              {name && <span className="text-[12px] text-ink-2">{name}</span>}
            </div>
            {market && (
              <div className="mt-1 flex items-center gap-3 font-mono text-[12px]">
                <span className="text-ink">{fmtPrice(market.ltp)}</span>
                {market.changePercent != null && (
                  <span style={{ color: changePositive ? "var(--qc-up)" : "var(--qc-down)" }}>
                    {fmtSignedPct(market.changePercent)}
                  </span>
                )}
                {market.qcScore != null && <span className="text-ink-3">QC {market.qcScore}</span>}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-md border border-hair text-ink-2 hover:bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Composer (toggled) */}
          {composing ? (
            <div className="mb-5 rounded-xl border border-hair bg-secondary/40 p-4">
              {/* Name the write target when the list spans journals — otherwise
                  "New entry" silently picks one of several. */}
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                New entry{writeTargetName ? ` · ${writeTargetName}` : ""}
              </div>
              <EntryComposer
                journalId={journalId}
                ticker={ticker}
                onSaved={() => { setComposing(false); afterChange(); }}
                onCancel={() => setComposing(false)}
              />
            </div>
          ) : (
            <Button variant="pill" size="sm" className="mb-5 w-full" onClick={() => setComposing(true)}>
              <Plus className="size-3.5" /> Add note or thesis
            </Button>
          )}

          {/* Timeline. No loading state: the drawer opens from a row that already
              has its entries, so there's nothing to wait for. */}
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
            Entries{entries.length > 0 ? ` · ${entries.length}` : ""}
          </div>

          {entries.length === 0 ? (
            // The "above" is the button; with the composer open it's the form
            // itself, and telling someone to write in the box they're already
            // looking at is noise.
            <div className="rounded-lg border border-dashed border-hair px-4 py-8 text-center text-[13px] text-ink-3">
              {composing ? "No entries yet." : "No entries yet. Add your first note or thesis above."}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {entries.map((row) => (
                <EntryTimelineItem
                  key={row.entry.id}
                  entry={row.entry}
                  // Its own journal, not the write target: editing an entry filed
                  // under Holdings from a drawer that composes into Tracking must
                  // still update it where it lives.
                  journalId={row.journalId}
                  journalName={showJournalBadge ? row.journalName : null}
                  ticker={ticker}
                  onChanged={afterChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
