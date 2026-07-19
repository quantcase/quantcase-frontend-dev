import { useCallback, useEffect, useRef, useState } from "react";
import { rawFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { normalizeTechnicals } from "@/lib/technicals-normalize";
import type {
  InsightLifecycle,
  TechnicalsResponse,
  TechnicalsApiResponse,
  TechnicalsDerived,
  TechnicalsStatusResponse,
} from "@/types/technicals";

/** The AI job takes 60–90s. The status endpoint is cheap, so poll it steadily. */
const POLL_INITIAL_DELAY_MS = 20_000;
const POLL_INTERVAL_MS = 10_000;
const MAX_POLL_ATTEMPTS = 18; // ~3 min ceiling

/** Backend lifecycle plus a client-only state for exhausting the poll budget. */
export type InsightStatus = InsightLifecycle | "unavailable";

function technicalsUrl(symbol: string, refresh: boolean): string {
  const base = `${BACKEND_URL}/api/screener/${symbol}/technicals`;
  return refresh ? `${base}?refresh=1` : base;
}

function statusUrl(symbol: string): string {
  return `${BACKEND_URL}/api/screener/${symbol}/technicals/status`;
}

/**
 * Dev-only: `?mockInsight=pending` forces the null-insight path so the
 * generating/failed states can be exercised without a cold ticker.
 */
function forcePendingInsight(): boolean {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("mockInsight") === "pending";
}

function computeDerived(data: TechnicalsResponse): TechnicalsDerived {
  const supportNum = data.supportResistance.static.support[0] ?? 0;
  const resistanceNum = data.supportResistance.static.resistance[0] ?? 0;
  const cmp = data.price.cmp;
  const range = resistanceNum - supportNum;
  const positionInRange = range > 0 ? ((cmp - supportNum) / range) * 100 : 0;
  const upsideToResistance = resistanceNum > 0 ? ((resistanceNum - cmp) / cmp) * 100 : 0;
  const downsideToSupport = supportNum > 0 ? ((cmp - supportNum) / cmp) * 100 : 0;
  const riskReward = downsideToSupport > 0 ? upsideToResistance / downsideToSupport : 0;
  const srMidpoint = (supportNum + resistanceNum) / 2;
  return { supportNum, resistanceNum, positionInRange, upsideToResistance, downsideToSupport, riskReward, srMidpoint };
}

/** Derive the lifecycle from a full technicals payload, tolerating old backends. */
function lifecycleOf(response: TechnicalsResponse): InsightStatus {
  if (response.insightStatus) {
    // "ready" with a queued job means: show this one, a newer one is coming.
    if (response.insightStatus === "ready" && response.insightJob) return "generating";
    return response.insightStatus;
  }
  return response.decisionIntelligence ? "ready" : "generating";
}

export function useTechnicals(symbol: string, options?: { poll?: boolean }) {
  const poll = options?.poll ?? true;

  const [data, setData] = useState<TechnicalsResponse | null>(null);
  const [derived, setDerived] = useState<TechnicalsDerived | null>(null);
  const [loading, setLoading] = useState(!!symbol?.trim());
  const [error, setError] = useState<string | null>(null);
  const [insightStatus, setInsightStatus] = useState<InsightStatus>("ready");
  const [insightProgress, setInsightProgress] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // rawFetch has no abort support, so guard every callback against a response
  // that lost the race to a newer request (symbol switch, refresh, poll).
  const symbolRef = useRef(symbol);
  const reqIdRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAttemptsRef = useRef(0);
  const pollingRef = useRef(false);

  const stopPolling = useCallback(() => {
    pollingRef.current = false;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  /**
   * `initial` drives the page skeletons — only ever true for the first load of a
   * symbol. Polls and refreshes must not set it, or the whole page re-skeletons.
   */
  const fetchTechnicals = useCallback(
    (sym: string, { initial, refresh }: { initial: boolean; refresh: boolean }) => {
      const reqId = ++reqIdRef.current;

      rawFetch<TechnicalsApiResponse>(technicalsUrl(sym, refresh), {
        onStart: () => {
          if (reqId !== reqIdRef.current) return;
          if (initial) {
            setLoading(true);
            setError(null);
            setData(null);
            setDerived(null);
            setRefreshError(null);
            setIsRefreshing(false);
            setInsightProgress(null);
            setInsightStatus("ready");
          }
        },
        onSuccess: (raw) => {
          if (reqId !== reqIdRef.current) return;
          const normalized = normalizeTechnicals(raw);
          const response = forcePendingInsight()
            ? { ...normalized, decisionIntelligence: null, insightStatus: "generating" as const }
            : normalized;

          setData(response);
          setDerived(computeDerived(response));
          if (initial) setLoading(false);
          setIsRefreshing(false);

          const next = lifecycleOf(response);
          setInsightStatus(next);
          if (next !== "generating") {
            setInsightProgress(null);
            stopPolling();
          }
        },
        onError: (err) => {
          if (reqId !== reqIdRef.current) return;
          setIsRefreshing(false);
          if (initial) {
            setError(err);
            setLoading(false);
          } else {
            // A failed poll/refresh must not blank a fully-rendered page.
            setRefreshError(err);
            stopPolling();
          }
        },
      });
    },
    [stopPolling],
  );

  /**
   * Self-scheduling poll against the cheap status endpoint. Never hits
   * /technicals (that recomputes TA) and never passes refresh=1 (that would
   * enqueue a fresh job every tick).
   */
  // Indirection so the loop can re-schedule itself without referencing the
  // callback inside its own initializer.
  const pollStatusRef = useRef<(sym: string) => void>(() => {});

  const pollStatus = useCallback(
    (sym: string) => {
      rawFetch<TechnicalsStatusResponse>(statusUrl(sym), {
        onSuccess: (status) => {
          if (sym !== symbolRef.current || !pollingRef.current) return;

          pollAttemptsRef.current += 1;
          setInsightProgress(status.insightJob?.progress ?? null);

          // failed is sticky — the backend will not retry on its own.
          if (status.insightStatus === "failed" || status.insightStatus === "absent") {
            stopPolling();
            setInsightStatus(status.insightStatus);
            return;
          }

          if (status.insightStatus === "ready") {
            stopPolling();
            // Status only reports lifecycle; fetch the payload itself.
            fetchTechnicals(sym, { initial: false, refresh: false });
            return;
          }

          if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
            stopPolling();
            setInsightStatus("unavailable");
            return;
          }

          pollTimerRef.current = setTimeout(() => pollStatusRef.current(sym), POLL_INTERVAL_MS);
        },
        onError: () => {
          if (sym !== symbolRef.current || !pollingRef.current) return;
          // A transient status failure shouldn't kill the run; retry within budget.
          pollAttemptsRef.current += 1;
          if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
            stopPolling();
            setInsightStatus("unavailable");
            return;
          }
          pollTimerRef.current = setTimeout(() => pollStatusRef.current(sym), POLL_INTERVAL_MS);
        },
      });
    },
    [stopPolling, fetchTechnicals],
  );
  // Keep the latest values reachable from async poll callbacks. Both are only
  // ever read after a render has committed.
  useEffect(() => {
    symbolRef.current = symbol;
    pollStatusRef.current = pollStatus;
  });

  // Initial load whenever the symbol changes. With no symbol there is nothing to
  // reset — the empty case is derived below rather than written back to state.
  useEffect(() => {
    stopPolling();
    pollAttemptsRef.current = 0;

    if (!symbol?.trim()) {
      reqIdRef.current++;
      return;
    }

    fetchTechnicals(symbol, { initial: true, refresh: false });

    return stopPolling;
  }, [symbol, fetchTechnicals, stopPolling]);

  // Kick off the poll loop once whenever we enter the generating state.
  useEffect(() => {
    if (!poll || insightStatus !== "generating" || !symbol?.trim()) return;
    if (pollingRef.current) return;

    pollingRef.current = true;
    pollTimerRef.current = setTimeout(() => pollStatus(symbol), POLL_INITIAL_DELAY_MS);

    return stopPolling;
  }, [poll, insightStatus, symbol, pollStatus, stopPolling]);

  const refresh = useCallback(() => {
    if (!symbol?.trim() || isRefreshing) return;
    stopPolling();
    pollAttemptsRef.current = 0;
    setRefreshError(null);
    setIsRefreshing(true);
    // ?refresh=1 returns a null insight and enqueues a regeneration job (and
    // clears a sticky `failed`), so the poll loop takes it from here.
    setInsightStatus("generating");
    fetchTechnicals(symbol, { initial: false, refresh: true });
  }, [symbol, isRefreshing, stopPolling, fetchTechnicals]);

  // With no symbol there is nothing to show and nothing in flight.
  const hasSymbol = !!symbol?.trim();

  return {
    data: hasSymbol ? data : null,
    derived: hasSymbol ? derived : null,
    loading: hasSymbol && loading,
    error: hasSymbol ? error : null,
    insightStatus,
    insightProgress,
    /** An insight is on screen but a newer one is being generated. */
    isUpdating: hasSymbol && insightStatus === "generating" && !!data?.decisionIntelligence,
    isRefreshing,
    refreshError,
    refresh,
  };
}
