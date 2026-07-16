"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet } from "@/lib/api";
import type { JournalEntry } from "@/types/journal";

/** An entry plus the journal it was filed under — the identity a merged,
 *  cross-journal list would otherwise lose. */
export interface SourcedEntry {
  entry: JournalEntry;
  journalId: string;
  journalName: string;
}

interface State {
  data: SourcedEntry[] | null;
  loading: boolean;
  error: string | null;
}

/** Journals to read a ticker's entries from — id for the fetch, name for the badge. */
export interface EntrySource {
  id: string;
  name: string;
}

/** Promise wrapper around the callback-style GET. Resolves `null` on failure so
 *  one unreachable journal degrades to a partial list rather than an empty one. */
function getEntries(journalId: string, ticker: string): Promise<JournalEntry[] | null> {
  return new Promise((resolve) => {
    apiAuthGet<{ success: boolean; data: { ticker: string; entries: JournalEntry[] } }>(
      `${BACKEND_URL}/api/journal/journals/${journalId}/tickers/${encodeURIComponent(ticker)}/entries`,
      {
        onSuccess: (res) => resolve(res.data.entries),
        onError: () => resolve(null),
      },
    );
  });
}

/**
 * Every entry written about a ticker, across the journals it belongs to, newest
 * first and stamped with its journal.
 *
 * The entries endpoint is journal-scoped and is the only one that returns whole
 * entries (journal detail carries just `latestEntry`), so "everything about ACE"
 * can only be assembled by fanning out over the ticker's journals. Collapse this
 * to one request the day the backend exposes a cross-journal entries read.
 *
 * Pass a stable `sources` array — it's fingerprinted by journal id, so a fresh
 * literal per render is fine, but a changing id set refetches.
 */
export function useTickerEntriesAcross(sources: EntrySource[], ticker: string | null) {
  const [state, setState] = useState<State>({ data: null, loading: Boolean(ticker), error: null });

  // Fingerprint over ids, not the array reference: callers build `sources` from a
  // derived row and would otherwise refetch on every render.
  const ids = useMemo(() => sources.map((s) => s.id).join(","), [sources]);

  const fetch = useCallback(() => {
    if (!ticker || sources.length === 0) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.all(sources.map((s) => getEntries(s.id, ticker))).then((results) => {
      const rows = results.flatMap((entries, i) =>
        (entries ?? []).map((entry) => ({
          entry,
          journalId: sources[i].id,
          journalName: sources[i].name,
        })),
      );

      // Every journal failing is an error; a partial result is just partial.
      const allFailed = results.every((r) => r === null);
      rows.sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());

      setState({
        data: allFailed ? null : rows,
        loading: false,
        error: allFailed ? "Failed to load entries" : null,
      });
    });
    // `sources` is intentionally read through the `ids` fingerprint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, ticker]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}
