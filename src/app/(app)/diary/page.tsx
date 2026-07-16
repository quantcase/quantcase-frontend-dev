"use client";

import { useState, useEffect, useMemo } from "react";

import { CreateJournalModal } from "@/components/journal/create-journal-modal";
import { TickerEntriesPanel } from "@/components/journal/ticker-entries-panel";
import { ConnectPortfolioModal } from "@/components/investor/connect-portfolio-modal";
import { UploadPortfolioModal } from "@/components/investor/upload-portfolio-modal";

import { DiaryMasthead } from "./_components/diary-masthead";
import { EntriesStrip } from "./_components/entries-strip";
import { ChangedSinceCard } from "./_components/changed-since-card";
import { EverythingYouOwn } from "./_components/everything-you-own";
import { KeepWritingHeader } from "./_components/keep-writing-header";
import { ComposerCarousel, ComposerCarouselNav, useCarouselPos } from "./_components/composer-carousel";
import { WatchlistTable } from "./_components/watchlist-table";
import { JournalTabs } from "./_components/journal-tabs";

import { useDiaryData } from "./_hooks/useDiaryData";
import { totalEntryCount, primaryJournal } from "./_lib/diary-derive";
import type { DiaryTicker } from "./_lib/diary-derive";

export default function DiaryPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openTicker, setOpenTicker] = useState<DiaryTicker | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const d = useDiaryData(activeId);

  // The holdings journal is what you own, and EverythingYouOwn already tells
  // that story from the portfolio itself. Showing it here too would put owned
  // stocks under "On your watchlist", which is the section for what you track
  // but don't own — so it's dropped from the switcher entirely.
  const watchlistJournals = useMemo(
    () => d.journals.filter((j) => j.kind !== "holdings"),
    [d.journals],
  );

  // Land on a journal once the list resolves, and recover if the active one
  // disappears (deleted here or elsewhere) — otherwise the detail hook keeps
  // fetching a dead id.
  //
  // Selection runs over the filtered list: the holdings journal is the backend
  // default, so honouring isDefault here would select a journal that no longer
  // has a pill and leave the section looking unselected.
  useEffect(() => {
    if (watchlistJournals.length === 0) return;
    if (activeId && watchlistJournals.some((j) => j.id === activeId)) return;
    setActiveId(watchlistJournals.find((j) => j.isDefault)?.id ?? watchlistJournals[0].id);
  }, [watchlistJournals, activeId]);

  // Every entry, not the active journal's: the masthead counts the diary, and
  // scoping it to a journal made "ENTRY 47" jump whenever you switched pills.
  const entryCount = useMemo(() => totalEntryCount(d.allTickers), [d.allTickers]);

  // Held here, not in the carousel: the nav now renders in the section header,
  // so both need to read the same position.
  const carousel = useCarouselPos(d.toWrite.length);

  // One request backs the page, so any write refreshes all of it — counts,
  // health, sections and the open drawer's entries alike.
  const handlePanelChanged = d.refetch;

  // Every row is cross-journal now, so a single lookup serves every caller
  // (what's-changed, holdings, the strip) and carries the membership the drawer
  // needs to open the right journal.
  function openByTicker(ticker: string) {
    const match = d.allTickers.find((t) => t.ticker.toUpperCase() === ticker.toUpperCase());
    if (match) setOpenTicker(match);
  }

  // The drawer renders from the row's own entries, so it must re-read that row
  // after a write — `openTicker` is a snapshot taken when the card was clicked,
  // and would otherwise show a stale timeline until reopened.
  const openRow = useMemo(
    () =>
      openTicker
        ? d.allTickers.find((t) => t.ticker.toUpperCase() === openTicker.ticker.toUpperCase()) ?? openTicker
        : null,
    [openTicker, d.allTickers],
  );

  return (
    <div className="min-h-screen bg-[var(--qc-bg)] font-sans">
      <main className="mx-auto max-w-[1240px] px-4 pb-24 pt-8 sm:px-6 lg:px-10">
        <DiaryMasthead entryCount={entryCount || null} />

        {d.journalsError && (
          <div className="mb-6 rounded-lg border border-down bg-down-soft px-4 py-3 text-[14px] text-down">
            {d.journalsError}
          </div>
        )}

        {/* Thesis-or-blank only; note-only tickers are the watchlist's story. */}
        <EntriesStrip
          tickers={d.thesisTickers}
          loading={d.allTickersLoading && d.allTickers.length === 0}
          onPick={setOpenTicker}
        />

        {/* Left: what changed + what you own. Right: what to write next. */}
        <div className="mb-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_minmax(0,520px)]">
          <div className="flex min-w-0 flex-col gap-6">
            <ChangedSinceCard
              items={d.changes}
              loading={d.changesLoading && d.changes.length === 0}
              onReRead={openByTicker}
            />

            <EverythingYouOwn
              data={d.holdings}
              loading={d.holdingsLoading}
              notConnected={d.brokerNotConnected}
              syncing={d.holdingsSyncing}
              onSync={d.syncHoldings}
              onConnect={() => setConnectOpen(true)}
              onPick={openByTicker}
              metrics={d.metrics}
            />
          </div>

          {/* Flex column so the carousel can stretch to the left column's
              height rather than ending wherever its content happens to stop. */}
          <div className="flex min-w-0 flex-col">
            <KeepWritingHeader
              pendingCount={d.toWrite.length}
              dates={d.entryDates}
              nav={<ComposerCarouselNav tickers={d.toWrite} pos={carousel} />}
            />
            {/* Not gated on activeId: the queue spans journals, so it has work
                to show before (and independently of) a journal being selected. */}
            <ComposerCarousel
              tickers={d.toWrite}
              fallbackJournalId={activeId}
              onSaved={handlePanelChanged}
              pos={carousel}
            />
          </div>
        </div>

        <div className="mb-10">
          {/* The switcher renders even with no active journal: it carries
              "Create new watchlist", which is the only way out if the last
              selectable journal goes away. */}
          {/* Cross-journal now (note-only tickers, wherever filed), so it no
              longer waits on a selected journal — `activeId` only says where a
              newly-added ticker gets written. */}
          <WatchlistTable
            tickers={d.watchlist}
            journalId={activeId}
            loading={d.allTickersLoading && d.allTickers.length === 0}
            onOpen={setOpenTicker}
            onChanged={handlePanelChanged}
            switcher={
              <JournalTabs
                journals={watchlistJournals}
                activeId={activeId}
                onSelect={setActiveId}
                onCreate={() => setCreateOpen(true)}
                onChanged={d.refetch}
                // Move off the doomed journal before its refetch lands.
                onDeleted={(id) => { if (id === activeId) setActiveId(null); }}
              />
            }
          />
        </div>
      </main>

      {/* Shows every journal the ticker is in: a card quotes the newest entry
          across all of them, so a drawer scoped to one journal would contradict
          the card it was opened from. Writes still go to a single journal —
          `primaryJournal` (Holdings-first) picks it, and the composer names it. */}
      {openRow && (primaryJournal(openRow)?.id ?? activeId) && (
        <TickerEntriesPanel
          journalId={primaryJournal(openRow)?.id ?? activeId!}
          entries={openRow.entries}
          ticker={openRow.ticker}
          market={openRow.market}
          name={openRow.name}
          onClose={() => setOpenTicker(null)}
          onChanged={handlePanelChanged}
        />
      )}

      {createOpen && (
        <CreateJournalModal
          onClose={() => setCreateOpen(false)}
          onCreated={(journal) => {
            setCreateOpen(false);
            d.refetch();
            setActiveId(journal.id); // land on what you just made
          }}
        />
      )}

      <ConnectPortfolioModal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onOpenCsvUpload={() => { setConnectOpen(false); setUploadOpen(true); }}
        onConnected={() => { setConnectOpen(false); d.syncHoldings(); }}
      />

      <UploadPortfolioModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => { setUploadOpen(false); window.location.reload(); }}
      />
    </div>
  );
}
