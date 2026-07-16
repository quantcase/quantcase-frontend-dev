"use client";

import { useState, useEffect, useMemo } from "react";
import { BACKEND_URL } from "@/lib/constants";

interface ScoreVerdict {
  score: number;
  verdict: string;
}

/**
 * One ticker's market snapshot + fundamentals.
 *
 * Field-for-field the same row as `PeerRow` in `useScreenerPeers`, minus
 * `isSubject` (which only means something inside a peer set) — both are served
 * from the same backend projection. `cmp` is the name the API uses; the app also
 * says `ltp` (journal `TickerMarket`) and `quote.price` (screener) for this same
 * number. Matching the API here rather than inventing a fourth name.
 */
export interface TickerMetrics {
  symbol: string;
  name: string;
  basicIndustry: string;
  industryGroup: string;
  cmp: number | null;
  pe: number | null;
  marketCapCr: number | null;
  divYld: number | null;
  npQtrCr: number | null;
  qtrProfitVar: number | null;
  salesQtrCr: number | null;
  qtrSalesVar: number | null;
  /** Null for every ticker seen so far — don't build a column on it without checking. */
  roce: number | null;
  management: ScoreVerdict;
  opportunity: ScoreVerdict;
  deal: ScoreVerdict;
}

export interface TickerMetricsResponse {
  count: number;
  latestQuarter: string;
  yearAgoQuarter: string;
  /** Tickers the backend couldn't resolve. Not an error — the rest still return. */
  notFound: string[];
  tickers: TickerMetrics[];
}

/** The API rejects more than this per request (400). */
const MAX_PER_REQUEST = 100;

const key = (t: string) => t.trim().toUpperCase();

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function fetchChunk(tickers: string[], signal: AbortSignal): Promise<TickerMetricsResponse> {
  // POST rather than the GET form: a portfolio can outgrow a query string, and
  // this path has no such ceiling below the API's own 100-ticker cap.
  const res = await fetch(`${BACKEND_URL}/api/tickers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tickers }),
    signal,
  });
  if (!res.ok) throw new Error(`Failed to fetch ticker metrics: ${res.status}`);
  return res.json() as Promise<TickerMetricsResponse>;
}

/**
 * Market data + fundamentals for an arbitrary list of tickers, as one request
 * (or one per 100).
 *
 * This is the bulk read the diary needs: holdings carry no price, and the
 * per-symbol alternatives can't serve a list — `useScreenerPeers` returns a
 * whole industry per call, so using it here would mean N requests fetching
 * thousands of rows to display N numbers.
 *
 * Returns a Map keyed by uppercased ticker for O(1) row lookup, since callers
 * join it against tables rather than iterating it.
 */
export function useTickerMetrics(tickers: string[]) {
  const [data, setData] = useState<Map<string, TickerMetrics>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The caller passes a fresh array every render (it's derived), so depend on
  // the *content*, not the identity — otherwise this refetches forever.
  const unique = useMemo(() => [...new Set(tickers.map(key).filter(Boolean))].sort(), [tickers]);
  const cacheKey = unique.join(",");

  useEffect(() => {
    if (unique.length === 0) {
      setData(new Map());
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    Promise.all(chunk(unique, MAX_PER_REQUEST).map((c) => fetchChunk(c, controller.signal)))
      .then((pages) => {
        const map = new Map<string, TickerMetrics>();
        for (const page of pages) {
          for (const t of page.tickers) map.set(key(t.symbol), t);
        }
        setData(map);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return; // superseded, not failed
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return { data, loading, error };
}
