"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet } from "@/lib/api";
import type { Journal, JournalDetail, JournalTicker } from "@/types/journal";

/** A ticker plus the journal it came from — the identity `JournalTicker` drops. */
export interface OwnedJournalTicker extends JournalTicker {
  journalId: string;
  journalName: string;
  journalKind: Journal["kind"];
}

interface State {
  data: OwnedJournalTicker[] | null;
  loading: boolean;
  error: string | null;
}

/** Promise wrapper around the callback-style GET, so the fan-out can Promise.all. */
function getDetail(journalId: string): Promise<JournalDetail | null> {
  return new Promise((resolve) => {
    apiAuthGet<{ success: boolean; data: JournalDetail }>(
      `${BACKEND_URL}/api/journal/journals/${journalId}`,
      {
        onSuccess: (res) => resolve(res.data),
        // One dead journal shouldn't blank the strip — drop it and keep the rest.
        onError: () => resolve(null),
      },
    );
  });
}

/**
 * Every ticker across every journal, each stamped with the journal it belongs to.
 *
 * `GET /api/journal/journals/{id}` is the only ticker-returning endpoint and it's
 * scoped to one journal, so "which journals is this ticker in?" can only be
 * answered by fanning out over the journal list and flattening. Collapse this to
 * a single request the moment the backend exposes a cross-journal read.
 *
 * Cost worth knowing: the Holdings journal runs a server-side holdings sync
 * before responding, so this re-triggers that sync whenever `journals` changes
 * identity. Pass a stable array (the one from `useJournals`) — not a fresh
 * literal each render — or it will refetch in a loop.
 *
 * A ticker in several journals yields one row per journal; callers group by
 * ticker to get its full membership.
 */
export function useAllJournalTickers(journals: Journal[]) {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  // Depend on the id list, not the array reference: `useJournals` hands back a new
  // array on every refetch, and journal renames shouldn't re-run the fan-out.
  const ids = useMemo(() => journals.map((j) => j.id).join(","), [journals]);

  const fetch = useCallback(() => {
    if (journals.length === 0) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.all(journals.map((j) => getDetail(j.id)))
      .then((details) => {
        if (cancelled) return;
        const rows = details.flatMap((detail) =>
          (detail?.tickers ?? []).map((t) => ({
            ...t,
            journalId: detail!.journal.id,
            journalName: detail!.journal.name,
            journalKind: detail!.journal.kind,
          })),
        );
        // Every journal failing is an error; a partial result is just partial.
        const allFailed = details.every((d) => d === null);
        setState({
          data: allFailed ? null : rows,
          loading: false,
          error: allFailed ? "Failed to load journals" : null,
        });
      });

    return () => { cancelled = true; };
    // `journals` is intentionally read through the `ids` fingerprint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  useEffect(() => fetch(), [fetch]);

  return { ...state, refetch: fetch };
}
