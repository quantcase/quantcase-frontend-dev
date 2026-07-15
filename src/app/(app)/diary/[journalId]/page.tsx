"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";

import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge, Display } from "@/components/ds";
import { TickerRow } from "./_components/ticker-row";
import { AddTickerInput } from "./_components/add-ticker-input";
import { IdeasEmptyState } from "./_components/ideas-empty-state";
import { TickerEntriesPanel } from "@/components/journal/ticker-entries-panel";

import { useJournalDetail } from "@/hooks/useJournalDetail";
import { useJournalMutations } from "@/hooks/useJournalMutations";
import { isPending } from "@/types/journal";
import type { JournalTicker } from "@/types/journal";

const KIND_LABEL = { holdings: "Auto-synced", tracking: "Watchlist", custom: "Custom" } as const;

export default function JournalDetailPage({ params }: { params: Promise<{ journalId: string }> }) {
  const { journalId } = use(params);
  const { data, loading, error, refetch } = useJournalDetail(journalId);
  const { addTickers, syncHoldings, mutating } = useJournalMutations();

  const [openTicker, setOpenTicker] = useState<JournalTicker | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const journal = data?.journal;
  const tickers = data?.tickers ?? [];
  const isHoldings = journal?.kind === "holdings";
  const pendingCount = tickers.filter(isPending).length;

  function handleAdd(ticker: string) {
    setAddError(null);
    addTickers(journalId, [ticker], () => refetch(), (err) => setAddError(err));
  }

  function handleSync() {
    setSyncing(true);
    syncHoldings(() => { setSyncing(false); refetch(); }, () => setSyncing(false));
  }

  return (
    <div className="min-h-screen bg-[var(--qc-bg)] font-sans">
      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-8 sm:px-6 lg:px-10">
        {/* Back */}
        <Link href="/diary" className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" /> All journals
        </Link>

        {/* Header */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              {journal && <Badge variant="muted">{KIND_LABEL[journal.kind]}</Badge>}
              {pendingCount > 0 && (
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--qc-brand-accent)" }}>
                  {pendingCount} need{pendingCount === 1 ? "s" : ""} a thesis
                </span>
              )}
            </div>
            <Display as="h1" italic className="text-[28px] font-medium leading-[1.15]">
              {journal?.name ?? (loading ? "Loading…" : "Journal")}
            </Display>
          </div>

          <div className="flex items-center gap-2">
            {isHoldings && (
              <Button variant="pill" size="sm" onClick={handleSync} disabled={syncing}>
                {syncing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                Refresh holdings
              </Button>
            )}
            {!isHoldings && journal && <AddTickerInput existing={tickers.map((t) => t.ticker)} busy={mutating} onAdd={handleAdd} />}
          </div>
        </div>

        {addError && (
          <div className="mb-5 rounded-lg border border-down bg-down-soft px-4 py-2.5 text-[13px] text-down">{addError}</div>
        )}
        {error && (
          <div className="mb-5 rounded-lg border border-down bg-down-soft px-4 py-2.5 text-[13px] text-down">{error}</div>
        )}

        {/* Body */}
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg border border-hair bg-card opacity-50" />
            ))}
          </div>
        ) : tickers.length === 0 ? (
          isHoldings ? (
            <div className="rounded-xl border border-dashed border-hair px-6 py-14 text-center">
              <div className="mb-1.5 text-[18px] font-medium text-ink">No holdings synced yet</div>
              <div className="text-[13px] text-ink-2">Connect a broker or upload a portfolio, then refresh.</div>
            </div>
          ) : (
            <IdeasEmptyState existing={tickers.map((t) => t.ticker)} onPick={handleAdd} />
          )
        ) : (
          <div className="rounded-xl border border-hair bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Ticker</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">QC Score</TableHead>
                  <TableHead>Signal</TableHead>
                  <TableHead>Thesis</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickers.map((t) => (
                  <TickerRow
                    key={t.ticker}
                    journalId={journalId}
                    ticker={t}
                    removable={!isHoldings}
                    onOpen={() => setOpenTicker(t)}
                    onChanged={refetch}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Ticker entries side panel */}
      {openTicker && (
        <TickerEntriesPanel
          journalId={journalId}
          ticker={openTicker.ticker}
          market={openTicker.market}
          name={null}
          onClose={() => setOpenTicker(null)}
          onChanged={refetch}
        />
      )}
    </div>
  );
}
