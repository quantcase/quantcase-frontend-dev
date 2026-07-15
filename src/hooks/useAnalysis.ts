import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { apiCall } from '@/lib/api';
import { InsightData, InsightType, L3AnalysisResponse } from '@/types/analysis';
import { adaptL3Results } from '@/lib/analysis-adapter';

// L3 is the current analysis layer served by /api/post-html-analysis.
const LAYER_ID = 'l3';

interface UseAnalysisResult {
  insights: InsightData[];
  getInsight: (type: InsightType) => InsightData | null;
  loading: boolean;
  error: string | null;
}

export function useAnalysis(ticker: string): UseAnalysisResult {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(!!ticker?.trim());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker.trim()) { setLoading(false); return; }

    const url = `${BACKEND_URL}/api/post-html-analysis?ticker=${ticker}&layer_id=${LAYER_ID}`;

    apiCall<L3AnalysisResponse>(url, {
      onStart: () => {
        setLoading(true);
        setError(null);
        setInsights([]);
      },
      onSuccess: (response) => {
        setInsights(adaptL3Results(response.data?.results ?? []));
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setInsights([]);
        setLoading(false);
      },
    });
  }, [ticker]);

  const getInsight = (type: InsightType): InsightData | null =>
    insights.find((i) => i.type === type && i.available) ?? null;

  return { insights, getInsight, loading, error };
}
