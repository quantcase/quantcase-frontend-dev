import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { apiCall } from '@/lib/api';
import { TranscriptCall, TranscriptCallsResponse } from '@/types/management';

export function useTranscriptCalls(symbol: string) {
  const [data, setData] = useState<TranscriptCall[]>([]);
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) return;

    const url = `${BACKEND_URL}/api/transcript/calls?symbol=${symbol}`;

    apiCall<TranscriptCallsResponse>(url, {
      onStart: () => {
        setLoading(true);
        setError(null);
        setData([]);
        setTier(null);
      },
      onSuccess: (response) => {
        setData(response.data);
        setTier(response.tier ?? null);
        setLoading(false);
      },
      onError: (error) => {
        setError(error);
        setData([]);
        setTier(null);
        setLoading(false);
      },
    });
  }, [symbol]);

  return { data, tier, loading, error };
}
