"use client";

import { useMemo } from "react";

import { useJournals } from "@/hooks/useJournals";
import { useJournalDetail } from "@/hooks/useJournalDetail";
import { useAllJournalTickers } from "@/hooks/useAllJournalTickers";
import { useSmallcaseHoldings } from "@/hooks/useSmallcaseHoldings";
import { useModSynopsis } from "@/hooks/useModSynopsis";
import { useWhatsMoving } from "@/hooks/useWhatsMoving";
import { useStocks } from "@/hooks/useStocks";

import { joinTickers, joinAllTickers, entryDates } from "../_lib/diary-derive";
import type { DiaryTicker } from "../_lib/diary-derive";
import type { WhatsMovingItem } from "@/types/investor-dashboard";
import type { Journal } from "@/types/journal";

// Everything the diary page reads, fanned out in one place so the page itself
// stays a layout concern. Follows the house dashboard pattern: hooks are called
// unconditionally, panels degrade to empty rather than gating the whole page on
// a global spinner.
//
// Only `journals` and `detail` are load-bearing — the rest (holdings, names,
// what's-moving) enrich rows and are allowed to arrive late or not at all.

/** Stable identity for the "no journals yet" case — a fresh `[]` per render
 *  would retrigger the cross-journal fan-out (and its holdings sync) forever. */
const EMPTY_JOURNALS: Journal[] = [];
export function useDiaryData(activeJournalId: string | null) {
  const journals = useJournals();
  const detail = useJournalDetail(activeJournalId); // null ⇒ skips fetching
  const holdings = useSmallcaseHoldings();
  const mod = useModSynopsis();
  const moving = useWhatsMoving(6);
  const { stocks } = useStocks();

  // The entries strip spans every journal — a card badges the journal it's filed
  // under, which is only a fact worth printing if the strip can show more than
  // one. Everything else on the page stays scoped to the active journal.
  const journalList = journals.data ?? EMPTY_JOURNALS;
  const all = useAllJournalTickers(journalList);

  const tickers: DiaryTicker[] = useMemo(
    () => joinTickers(detail.data?.tickers ?? [], holdings.data, mod.data, stocks),
    [detail.data, holdings.data, mod.data, stocks],
  );

  const allTickers: DiaryTicker[] = useMemo(
    () => joinAllTickers(all.data ?? [], holdings.data, mod.data, stocks),
    [all.data, holdings.data, mod.data, stocks],
  );

  const owned = useMemo(() => tickers.filter((t) => t.holding !== null), [tickers]);
  const watchlist = useMemo(() => tickers.filter((t) => t.holding === null), [tickers]);
  const pending = useMemo(() => tickers.filter((t) => t.pending), [tickers]);
  const dates = useMemo(() => entryDates(tickers), [tickers]);

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
    journals: journals.data ?? [],
    journalsLoading: journals.loading,
    journalsError: journals.error,
    refetchJournals: journals.refetch,

    journal: detail.data?.journal ?? null,
    tickers,
    owned,
    watchlist,
    pending,
    entryDates: dates,
    detailLoading: detail.loading,
    detailError: detail.error,
    refetchDetail: detail.refetch,

    allTickers,
    allTickersLoading: all.loading,
    refetchAllTickers: all.refetch,

    holdings: holdings.data,
    holdingsLoading: holdings.loading,
    brokerNotConnected: holdings.notConnected,
    syncHoldings: holdings.sync,
    holdingsSyncing: holdings.syncing,

    changes,
    changesLoading: moving.loading,
  };
}
