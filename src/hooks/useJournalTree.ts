"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet } from "@/lib/api";
import type { Journal, JournalWithTickers, JournalTicker } from "@/types/journal";

/** A ticker plus the journal it came from — the identity `JournalTicker` drops
 *  once rows from several journals are flattened into one list. */
export interface OwnedJournalTicker extends JournalTicker {
  journalId: string;
  journalName: string;
  journalKind: Journal["kind"];
}

interface State {
  data: JournalWithTickers[] | null;
  loading: boolean;
  error: string | null;
}

/**
 * The whole journal tree — every journal, its tickers, and their entries — in one
 * request.
 *
 * This is the diary's single read. It replaces four hooks (`useJournals`,
 * `useJournalDetail`, `useAllJournalTickers`, `useTickerEntriesAcross`) that
 * existed only because the API used to be journal-scoped: answering
 * "which journals is this ticker in?" or "everything written about ACE" meant
 * fanning out one request per journal and stitching the results. The endpoint now
 * nests tickers and entries, so all of that collapses to this.
 *
 * The GET lazily creates the two default journals (Holdings + Tracking) backend-
 * side, so this resolves to at least those two, defaults first.
 *
 * Fetched once and shared: callers derive their slices from `data` rather than
 * re-fetching, and every mutation refetches through a single `refetch`. That's
 * why this takes no arguments — a per-journal parameter would reintroduce the
 * request-per-journal shape this exists to remove.
 */
export function useJournalTree() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  const fetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    apiAuthGet<{ success: boolean; data: { journals: JournalWithTickers[] } }>(
      `${BACKEND_URL}/api/journal/journals`,
      {
        onSuccess: (res) => setState({ data: res.data.journals, loading: false, error: null }),
        onError: (err) => setState({ data: null, loading: false, error: err }),
        onComplete: () => setState((s) => ({ ...s, loading: false })),
      },
    );
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}

/**
 * The tree flattened to one row per (ticker, journal), each stamped with its
 * journal — the shape the cross-journal join consumes.
 *
 * A ticker in several journals yields one row per journal; `joinAllTickers`
 * merges them back into a single row carrying full membership.
 */
export function flattenTickers(journals: JournalWithTickers[] | null): OwnedJournalTicker[] {
  return (journals ?? []).flatMap((j) =>
    j.tickers.map((t) => ({
      ...t,
      journalId: j.id,
      journalName: j.name,
      journalKind: j.kind,
    })),
  );
}

/** The journal list without the nested tickers — for callers that only pick or
 *  name journals (switchers, "add to journal" modals) and shouldn't re-render on
 *  entry churn. */
export function toJournals(journals: JournalWithTickers[] | null): Journal[] {
  return (journals ?? []).map(({ tickers: _tickers, ...j }) => j);
}
