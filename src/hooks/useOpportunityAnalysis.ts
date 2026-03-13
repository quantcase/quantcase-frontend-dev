import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { apiCall } from '@/lib/api';
import { OFactorResponse, OFactorResponseWrapper, TotalScore } from '@/types/opportunity';

export function useOpportunityAnalysis(callId: string) {
  const [data, setData] = useState<OFactorResponse | Record<string, never>>({});
  const [totalScore, setTotalScore] = useState<TotalScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId.trim()) return;

    const url = `${BACKEND_URL}/api/opportunity/analysis?callId=${callId}`;

    apiCall<OFactorResponseWrapper>(url, {
      onStart: () => {
        setLoading(true);
        setError(null);
        setData({});
        setTotalScore(null);
      },
      onSuccess: (response) => {
        setData(response.data);
        setTotalScore(response.total_score ?? null);
        setLoading(false);
      },
      onError: (error) => {
        setError(error);
        setData({});
        setTotalScore(null);
        setLoading(false);
      },
    });
  }, [callId]);

  return { data, totalScore, loading, error };
}
