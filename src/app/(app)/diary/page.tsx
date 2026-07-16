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

  const entryCount = useMemo(() => totalEntryCount(d.tickers), [d.tickers]);

  // Held here, not in the carousel: the nav now renders in the section header,
  // so both need to read the same position.
  const carousel = useCarouselPos(d.pending.length);

  // The panel is the one place entries are read/edited, so it must refresh both
  // the journal (entry counts, health) and the strip after a change.
  function handlePanelChanged() {
    d.refetchDetail();
    d.refetchJournals();
    d.refetchAllTickers(); // the strip spans journals; it goes stale too
  }

  // Resolve against the cross-journal set first: these callers (what's-changed,
  // holdings) are portfolio-wide, so their tickers often aren't in the active
  // journal and would otherwise silently no-op. The all-journal row also carries
  // the membership the panel needs to open the right journal.
  function openByTicker(ticker: string) {
    const match =
      d.allTickers.find((t) => t.ticker.toUpperCase() === ticker.toUpperCase()) ??
      d.tickers.find((t) => t.ticker.toUpperCase() === ticker.toUpperCase());
    if (match) setOpenTicker(match);
  }

  return (
    <div className="min-h-screen bg-[var(--qc-bg)] font-sans">
      <main className="mx-auto max-w-[1240px] px-4 pb-24 pt-8 sm:px-6 lg:px-10">
        <DiaryMasthead entryCount={entryCount || null} />

        {d.journalsError && (
          <div className="mb-6 rounded-lg border border-down bg-down-soft px-4 py-3 text-[14px] text-down">
            {d.journalsError}
          </div>
        )}

        <EntriesStrip
          tickers={d.allTickers}
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
            />
          </div>

          {/* Flex column so the carousel can stretch to the left column's
              height rather than ending wherever its content happens to stop. */}
          <div className="flex min-w-0 flex-col">
            <KeepWritingHeader
              pendingCount={d.pending.length}
              dates={d.entryDates}
              nav={<ComposerCarouselNav tickers={d.pending} pos={carousel} />}
            />
            {activeId && (
              <ComposerCarousel
                tickers={d.pending}
                journalId={activeId}
                onSaved={handlePanelChanged}
                pos={carousel}
              />
            )}
          </div>
        </div>

        <div className="mb-10">
          {/* The switcher renders even with no active journal: it carries
              "Create new watchlist", which is the only way out if the last
              selectable journal goes away. */}
          <WatchlistTable
            tickers={activeId ? d.watchlist : []}
            journalId={activeId}
            loading={Boolean(activeId) && d.detailLoading && d.tickers.length === 0}
            onOpen={setOpenTicker}
            onChanged={handlePanelChanged}
            switcher={
              <JournalTabs
                journals={watchlistJournals}
                activeId={activeId}
                onSelect={setActiveId}
                onCreate={() => setCreateOpen(true)}
                onChanged={d.refetchJournals}
                // Move off the doomed journal before its refetch lands.
                onDeleted={(id) => { if (id === activeId) setActiveId(null); }}
              />
            }
          />
        </div>
      </main>

      {/* Open the ticker's OWN journal, not the active one: the strip now spans
          every journal, so a card can be from Holdings while the switcher sits
          on Tracking — reading `activeId` here would show the wrong entries.
          Rows from the single-journal sections carry no membership, so they fall
          back to the active journal they came from. */}
      {openTicker && (primaryJournal(openTicker)?.id ?? activeId) && (
        <TickerEntriesPanel
          journalId={primaryJournal(openTicker)?.id ?? activeId!}
          ticker={openTicker.ticker}
          market={openTicker.market}
          name={openTicker.name}
          onClose={() => setOpenTicker(null)}
          onChanged={handlePanelChanged}
        />
      )}

      {createOpen && (
        <CreateJournalModal
          onClose={() => setCreateOpen(false)}
          onCreated={(journal) => {
            setCreateOpen(false);
            d.refetchJournals();
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
