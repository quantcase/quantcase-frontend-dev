import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { apiCall } from '@/lib/api';
import { SummaryData } from '@/models/summary';

export function useSummary(callId: string) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId.trim()) return;

    apiCall<SummaryData>(`${BACKEND_URL}/api/summary/${callId}`, {
      onStart: () => {
        setLoading(true);
        setError(null);
        setData(null);
      },
      onSuccess: (data) => {
        setData(data);
        setLoading(false);
      },
      onError: (error) => {
        setError(error);
        setData(null);
        setLoading(false);
      },
    });
  }, [callId]);

  return { data, loading, error };
}
