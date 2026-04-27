import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { rawFetch } from '@/lib/api';
import type { MfBasketsApiResponse } from '@/types/mutual-fund';

export function useMfBaskets() {
  const [data, setData] = useState<MfBasketsApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    rawFetch<MfBasketsApiResponse>(`${BACKEND_URL}/api/mutual-funds/baskets`, {
      onStart: () => {
        setLoading(true);
        setError(null);
      },
      onSuccess: (json) => {
        setData(json);
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
