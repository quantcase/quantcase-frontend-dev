import { useState, useEffect } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { RMAnalytics, ClientAnalytics, Segment, InteractionType } from "@/types/wealthos";

export function useWealthRMAnalytics(rmId: string) {
  const [data, setData] = useState<RMAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rmId?.trim()) return;

    apiCall<{ data: RMAnalytics }>(`${BACKEND_URL}/api/wealthos/analytics/rm/${rmId}`, {
      onStart: () => {
        setLoading(true);
        setError(null);
        setData(null);
      },
      onSuccess: (response: any) => {
        const res = response.data || response;
        setData({
          ...res,
          total_clients: res.clients?.total ?? res.total_clients ?? 0,
          avg_engagement_score: res.clients?.avg_engagement_score ?? res.avg_engagement_score ?? 0,
          avg_churn_probability: res.clients?.avg_churn_probability ?? res.avg_churn_probability ?? 0,
          suggestion_adoption_rate: res.suggestions_last_30d?.adoption_rate ?? res.suggestion_adoption_rate ?? 0,
          avg_portfolio_risk_score: res.portfolio?.avg_risk_score ?? res.avg_portfolio_risk_score ?? 0,
          interactions_last_30d: res.interactions_last_30d ?? 0,
        });
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      },
    });
  }, [rmId]);

  return { data, loading, error };
}

type RawClientAnalytics = {
  segments: { segment: string; client_count: number; total_aum_cr?: number; avg_engagement_score: number; avg_churn_probability: number }[];
  interactions_last_30d: { type: string; count: number }[];
  risk_profiles?: { risk_profile: string; client_count: number; total_aum_cr: number }[];
  lifecycle_stages?: { lifecycle_status: string; client_count: number; total_aum_cr: number }[];
};

export function useWealthClientAnalytics() {
  const [data, setData] = useState<ClientAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiCall<{ data: RawClientAnalytics }>(`${BACKEND_URL}/api/wealthos/analytics/clients`, {
      onStart: () => {
        setLoading(true);
        setError(null);
      },
      onSuccess: (response: any) => {
        const raw: RawClientAnalytics = response.data || response;
        const segments = (raw.segments ?? []).map((s: any) => ({
          segment: s.segment as Segment,
          client_count: s.client_count ?? s.count ?? 0,
          count: s.client_count ?? s.count ?? 0,
          total_aum_cr: s.total_aum_cr || 0,
          avg_engagement_score: s.avg_engagement_score ?? s.avg_engagement ?? 0,
          avg_engagement: s.avg_engagement_score ?? s.avg_engagement ?? 0,
          avg_churn_probability: s.avg_churn_probability ?? s.avg_churn ?? 0,
          avg_churn: s.avg_churn_probability ?? s.avg_churn ?? 0,
        }));
        setData({
          segments,
          by_segment: segments as any,
          interactions_last_30d: (raw.interactions_last_30d ?? []).map((i) => ({
            type: i.type as InteractionType,
            count: i.count,
          })),
          risk_profiles: raw.risk_profiles as any,
          lifecycle_stages: raw.lifecycle_stages as any,
        });
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      },
    });
  }, []);

  return { data, loading, error };
}
