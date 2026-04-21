import { useState, useEffect } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { RMAnalytics, ClientAnalytics } from "@/types/wealthos";

export function useWealthRMAnalytics(rmId: string) {
  const [data, setData] = useState<RMAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rmId?.trim()) return;

    apiCall<{ data: RMAnalytics }>(`${BACKEND_URL}/api/wealthos/analytics/rm/${rmId}`, {
      onStart: () => { setLoading(true); setError(null); setData(null); },
      onSuccess: (response) => { setData(response.data); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [rmId]);

  return { data, loading, error };
}

type RawClientAnalytics = {
  segments: { segment: string; client_count: number; avg_engagement_score: number; avg_churn_probability: number }[];
  interactions_last_30d: unknown[];
};

export function useWealthClientAnalytics() {
  const [data, setData] = useState<ClientAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiCall<{ data: RawClientAnalytics }>(`${BACKEND_URL}/api/wealthos/analytics/clients`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (response) => {
        const raw = response.data;
        setData({
          by_segment: (raw.segments ?? []).map((s) => ({
            segment: s.segment as import("@/types/wealthos").Segment,
            count: s.client_count,
            avg_engagement: s.avg_engagement_score,
            avg_churn: s.avg_churn_probability,
          })),
          by_interaction_type: [],
        });
        setLoading(false);
      },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, []);

  return { data, loading, error };
}
