"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus } from "lucide-react";
import { useTickerEntriesAcross } from "@/hooks/useTickerEntriesAcross";
import type { EntrySource } from "@/hooks/useTickerEntriesAcross";
import { EntryTimelineItem } from "./entry-timeline-item";
import { EntryComposer } from "./entry-composer";
import { Button } from "@/components/ui/button";
import { fmtPrice } from "@/lib/journal-format";
import { fmtSignedPct } from "@/lib/portfolio-format";
import type { TickerMarket } from "@/types/journal";

interface Props {
  /** The journal new entries are written to, and — unless `sources` is given —
   *  the only one read from. */
  journalId: string;
  /** Journals to read entries from, for the cross-journal view: a ticker in both
   *  Holdings and Tracking has one story, told in two places. Omit for the
   *  single-journal panel (`journalId` alone). Writes still go to `journalId`. */
  sources?: EntrySource[];
  ticker: string;
  /** Optional market snapshot to show in the panel header. */
  market?: TickerMarket | null;
  /** Ticker's display name, if known. */
  name?: string | null;
  onClose: () => void;
  /** Fired whenever an entry is added/edited/deleted/evaluated, so the parent
   *  table can refetch the ticker row (latestEntry / health / count). */
  onChanged?: () => void;
}

export function TickerEntriesPanel({ journalId, sources, ticker, market, name, onClose, onChanged }: Props) {
  // Single-journal callers pass no `sources`; read from `journalId` alone so the
  // panel on a stock page keeps showing exactly that journal's entries.
  const readFrom: EntrySource[] = useMemo(
    () => sources ?? [{ id: journalId, name: "" }],
    [sources, journalId],
  );
  const { data: entries, loading, refetch } = useTickerEntriesAcross(readFrom, ticker);
  const [composing, setComposing] = useState(false);

  // Only worth naming the journal on each entry when the list actually spans
  // more than one — otherwise the badge states a fact the header already implies.
  const showJournalBadge = readFrom.length > 1;
  const writeTargetName = showJournalBadge
    ? readFrom.find((s) => s.id === journalId)?.name ?? null
    : null;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function afterChange() {
    refetch();
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

          {/* Timeline */}
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
            Entries{entries ? ` · ${entries.length}` : ""}
          </div>

          {loading ? (
            <div className="flex flex-col gap-2.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[92px] rounded-lg border border-hair bg-secondary opacity-50" />
              ))}
            </div>
          ) : !entries || entries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-hair px-4 py-8 text-center text-[13px] text-ink-3">
              No entries yet. Add your first note or thesis above.
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
