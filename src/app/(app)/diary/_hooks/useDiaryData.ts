"use client";

import { useMemo } from "react";

import { useJournalTree, flattenTickers, toJournals } from "@/hooks/useJournalTree";
import { useSmallcaseHoldings } from "@/hooks/useSmallcaseHoldings";
import { useModSynopsis } from "@/hooks/useModSynopsis";
import { useWhatsMoving } from "@/hooks/useWhatsMoving";
import { useStocks } from "@/hooks/useStocks";
import { useTickerMetrics } from "@/hooks/useTickerMetrics";

import {
  joinAllTickers,
  entryDates,
  needsEntryQueue,
  hasThesisOrNeedsEntry,
  sortForStrip,
} from "../_lib/diary-derive";
import type { DiaryTicker } from "../_lib/diary-derive";
import type { WhatsMovingItem } from "@/types/investor-dashboard";

// Everything the diary page reads, fanned out in one place so the page itself
// stays a layout concern. Follows the house dashboard pattern: hooks are called
// unconditionally, panels degrade to empty rather than gating the whole page on
// a global spinner.
//
// Only the journal tree is load-bearing — the rest (holdings, names,
// what's-moving) enrich rows and are allowed to arrive late or not at all.

export function useDiaryData(activeJournalId: string | null) {
  // One request for the whole diary: journals, their tickers, and every entry.
  // Sections, the composer queue, the strip and the drawer are all derived from
  // this — nothing here re-fetches per journal or per ticker.
  const tree = useJournalTree();
  const holdings = useSmallcaseHoldings();
  const mod = useModSynopsis();
  const moving = useWhatsMoving(6);
  const { stocks } = useStocks();

  const journals = useMemo(() => toJournals(tree.data), [tree.data]);

  // Every ticker on the page: journal rows ∪ holdings. The union matters —
  // holdings carry no price of their own, and most aren't in a journal, so
  // scoping this to the tree would leave the table it's for mostly blank.
  const metricTickers = useMemo(
    () => [
      ...flattenTickers(tree.data).map((t) => t.ticker),
      ...(holdings.data?.holdings ?? []).map((h) => h.ticker),
    ],
    [tree.data, holdings.data],
  );

  // One bulk read for CMP/PE/market-cap across all of them. Enrichment, like
  // names and sectors — it may arrive late, and both tables render without it.
  const metrics = useTickerMetrics(metricTickers);

  // One row per ticker, carrying its full journal membership and history.
  const allTickers: DiaryTicker[] = useMemo(
    () => joinAllTickers(flattenTickers(tree.data), holdings.data, mod.data, stocks, metrics.data),
    [tree.data, holdings.data, mod.data, stocks, metrics.data],
  );

  // The active journal's roster — a filter over rows already in hand, not a
  // second fetch. Backs "On your watchlist" and scopes "what's changed".
  const tickers: DiaryTicker[] = useMemo(
    () =>
      activeJournalId
        ? allTickers.filter((t) => t.journals.some((j) => j.id === activeJournalId))
        : [],
    [allTickers, activeJournalId],
  );

  // Every entry, everywhere — the streak counts days you wrote, not days you
  // wrote in the selected journal.
  const dates = useMemo(() => entryDates(allTickers), [allTickers]);

  // "Your thesis": what you've reasoned about, plus the blanks still asking to
  // be written. Cross-journal — it's about your writing, wherever it's filed.
  const thesisTickers = useMemo(
    () => sortForStrip(allTickers).filter(hasThesisOrNeedsEntry),
    [allTickers],
  );

  // "On your watchlist": the selected journal's roster, in full. Deliberately
  // unfiltered — the tab is the list, so its count must match what it renders.
  // A ticker with a thesis appears here *and* under "Your thesis"; the two
  // sections answer different questions (what's in this list vs. what have I
  // argued) and are meant to overlap.
  const watchlist = useMemo(() => sortForStrip(tickers), [tickers]);

  // The composer queue mirrors the entries strip: same cross-journal source, same
  // "needs entry" axis, just filtered to the unwritten ones. A stock needs an
  // entry wherever it's filed, and the journal pills below only scope the
  // watchlist section.
  const toWrite = useMemo(() => needsEntryQueue(allTickers), [allTickers]);

  // What's-moving is portfolio-wide; scope it to the active journal so the feed
  // is about what the user is actually writing about. No timestamp on these
  // items (G4) — hence "What's changed", not "Since your last entry".
  const changes: WhatsMovingItem[] = useMemo(() => {
    const inJournal = new Set(tickers.map((t) => t.ticker.trim().toUpperCase()));
    return (moving.data?.items ?? [])
      .filter((i) => inJournal.has(i.symbol.trim().toUpperCase()))
      .slice(0, 3);
  }, [moving.data, tickers]);

  return {
    journals,
    journalsError: tree.error,

    watchlist,
    entryDates: dates,

    allTickers,
    allTickersLoading: tree.loading,
    toWrite,
    thesisTickers,

    /** One read backs the whole page, so one refetch refreshes all of it —
     *  every mutation calls this. */
    refetch: tree.refetch,

    holdings: holdings.data,
    holdingsLoading: holdings.loading,
    /** CMP/PE/market-cap by uppercased ticker — the holdings table's price source. */
    metrics: metrics.data,
    brokerNotConnected: holdings.notConnected,
    syncHoldings: holdings.sync,
    holdingsSyncing: holdings.syncing,

    changes,
    changesLoading: moving.loading,
  };
}
