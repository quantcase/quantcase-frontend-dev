"use client";

import { useState, useEffect } from "react";

import { BACKEND_URL } from "@/lib/constants";
import { apiCall } from "@/lib/api";
import { adaptL4Results } from "@/lib/overview-adapter";
import type { L4AnalysisResponse } from "@/types/analysis";
import type { OverviewAnalysis } from "@/types/overview";
import type { Dimension } from "@/types/journal";

// The AI read shown on the composer card, per M/O/D dimension.
//
// Two things make this worth its own hook rather than reusing useOverviewFetch:
//
//  1. One L4 response carries all three pillar_patterns, so the cache key is the
//     TICKER, not ticker+dimension — switching dimensions costs zero requests.
//  2. useOverviewFetch's onStart does setData(null) and it has no cache, so
//     every carousel step would refetch and blank-flash the box.
//
// The cache is module-level on purpose: cards unmount as the carousel advances,
// and stepping back should be instant.
const cache = new Map<string, OverviewAnalysis>();

const PILLAR: Record<Dimension, "management" | "opportunity" | "deal"> = {
  M: "management",
  O: "opportunity",
  D: "deal",
};

interface QuantcaseRead {
  read: string | null;
  score: number | null;
  trend: string | null;
  loading: boolean;
}

export function useQuantcaseRead(ticker: string | null, dim: Dimension): QuantcaseRead {
  const [data, setData] = useState<OverviewAnalysis | null>(() => (ticker ? cache.get(ticker) ?? null : null));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) { setData(null); return; }

    const hit = cache.get(ticker);
    if (hit) { setData(hit); setLoading(false); return; }

    // Guards a fast next/prev: a resolved response for an abandoned card must
    // not overwrite the current one.
    let cancelled = false;
    setLoading(true);
    setData(null);

    apiCall<L4AnalysisResponse>(
      `${BACKEND_URL}/api/post-html-analysis?ticker=${encodeURIComponent(ticker)}&layer_id=l4`,
      {
        onSuccess: (res) => {
          // adaptL4Results returns null when the payload carries no summary
          // result — a ticker with no analysis yet. Cache only real reads.
          const adapted = adaptL4Results(res.data?.results ?? []);
          if (adapted) cache.set(ticker, adapted);
          if (!cancelled) setData(adapted);
        },
        // A missing read must never block writing — fail quiet, the box hides.
        onError: () => { if (!cancelled) setData(null); },
        onComplete: () => { if (!cancelled) setLoading(false); },
      },
    );

    return () => { cancelled = true; };
  }, [ticker]); // not `dim` — one fetch serves all three pillars

  const pattern = data?.pillar_patterns.find((p) => p.pillar === PILLAR[dim]) ?? null;

  return {
    read: pattern?.interpretation ?? pattern?.snapshot ?? null,
    score: pattern?.score ?? null,
    trend: pattern?.trend ?? null,
    loading,
  };
}

/** Warm the cache for the next card in the queue. Fire-and-forget. */
export function prefetchQuantcaseRead(ticker: string | null) {
  if (!ticker || cache.has(ticker)) return;
  apiCall<L4AnalysisResponse>(
    `${BACKEND_URL}/api/post-html-analysis?ticker=${encodeURIComponent(ticker)}&layer_id=l4`,
    {
      onSuccess: (res) => {
        const adapted = adaptL4Results(res.data?.results ?? []);
        if (adapted) cache.set(ticker, adapted);
      },
      onError: () => {},
    },
  );
}
