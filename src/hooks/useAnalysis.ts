import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { apiCall } from '@/lib/api';
import { InsightData, InsightType } from '@/types/analysis';

interface AnalysisApiResponse {
  success: boolean;
  data: {
    insights: InsightData[];
  };
}

interface UseAnalysisResult {
  insights: InsightData[];
  getInsight: (type: InsightType) => InsightData | null;
  loading: boolean;
  error: string | null;
}

export function useAnalysis(ticker: string): UseAnalysisResult {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker.trim()) return;

    const url = `${BACKEND_URL}/api/analysis?ticker=${ticker}`;

    apiCall<AnalysisApiResponse>(url, {
      onStart: () => {
        setLoading(true);
        setError(null);
        setInsights([]);
      },
      onSuccess: (response) => {
        setInsights(response.data?.insights ?? []);
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
