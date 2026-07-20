import { useState, useEffect, useMemo } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch } from "@/lib/api";
import type { WyckoffResponse } from "@/types/wyckoff";

interface UseWyckoffOptions {
  /** Years of OHLCV in chart.bars (1–20). Analysis always uses the full series. */
  chartYears?: number;
  /** Set false to omit the chart block entirely — much lighter. */
  includeBars?: boolean;
  /** Override the adaptive zigzag threshold. Omit to use the computed value. */
  minPct?: number;
}

interface FetchState {
  data: WyckoffResponse | null;
  error: string | null;
  /** Request this result belongs to — guards against out-of-order responses. */
  url: string | null;
}

const IDLE: FetchState = { data: null, error: null, url: null };

/**
 * Single source of Wyckoff analysis — the engine runs server-side, so there is
 * no client-side compute, no deferral, and no `analyzing` state.
 *
 * Insufficient history is NOT an error: it returns 200 with
 * `meta.insufficientData: true`, so render the empty state off that flag.
 */
export function useWyckoff(symbol: string, options: UseWyckoffOptions = {}) {
  const { chartYears, includeBars, minPct } = options;
  const [state, setState] = useState<FetchState>(IDLE);

  const url = useMemo(() => {
    const trimmed = symbol?.trim();
    if (!trimmed) return null;
    const params = new URLSearchParams();
    if (chartYears !== undefined) params.set("chartYears", String(chartYears));
    if (includeBars !== undefined) params.set("includeBars", String(includeBars));
    if (minPct !== undefined) params.set("minPct", String(minPct));
    const qs = params.toString();
    return `${BACKEND_URL}/api/screener/${trimmed}/wyckoff${qs ? `?${qs}` : ""}`;
  }, [symbol, chartYears, includeBars, minPct]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    rawFetch<WyckoffResponse>(url, {
      onSuccess: (response) => {
        if (!cancelled) setState({ data: response, error: null, url });
      },
      onError: (err) => {
        if (!cancelled) setState({ data: null, error: err, url });
      },
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Derived rather than stored, so a symbol change reads as loading immediately
  // instead of briefly showing the previous symbol's analysis.
  const settled = state.url === url;
  return {
    data: settled ? state.data : null,
    error: settled ? state.error : null,
    loading: !!url && !settled,
  };
}
