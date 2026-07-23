import { useState, useEffect } from "react";
import { IndustryIntelligenceData } from "@/types/industry-intelligence";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";
import sampleData from "../../temp/config/industry-intelligence-response.json";

interface State {
  data: IndustryIntelligenceData | null;
  loading: boolean;
  error: string | null;
}

function mergeNulls<T>(live: T, fallback: unknown): T {
  if ((live === null || live === undefined) && fallback != null) return fallback as T;
  if (live == null || fallback == null || typeof live !== "object" || typeof fallback !== "object") {
    return live;
  }
  if (Array.isArray(live)) {
    if (!Array.isArray(fallback)) return live;
    if (live.length === 0 && (fallback as unknown[]).length > 0) return fallback as T;
    return live.map((item, i) =>
      i < (fallback as unknown[]).length ? mergeNulls(item, (fallback as unknown[])[i]) : item
    ) as unknown as T;
  }
  const result = { ...(live as Record<string, unknown>) };
  for (const key of Object.keys(result)) {
    if (key in (fallback as object)) {
      result[key] = mergeNulls(result[key], (fallback as Record<string, unknown>)[key]);
    }
  }
  return result as unknown as T;
}

export function useIndustryIntelligence() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    authFetch(`${BACKEND_URL}/api/industry-intelligence`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<IndustryIntelligenceData>;
      })
      .then((json) => {
        if (!cancelled) {
          const merged = mergeNulls(json, sampleData);
          setState({ data: merged, loading: false, error: null });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message });
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}
