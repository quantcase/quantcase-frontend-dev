import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { apiCall } from '@/lib/api';
import { OFactorResponse, OFactorResponseWrapper } from '@/types/opportunity';

export function useOpportunityAnalysis(callId: string) {
  const [data, setData] = useState<OFactorResponse | Record<string, never>>({});
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
      },
      onSuccess: (data) => {
        setData(data.data);
        setLoading(false);
      },
      onError: (error) => {
        setError(error);
        setData({});
        setLoading(false);
      },
    });
  }, [callId]);

  return { data, loading, error };
}
