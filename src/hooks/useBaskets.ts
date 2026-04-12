import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { rawFetch } from '@/lib/api';
import type { BasketsApiResponse } from '@/types/screener';

export function useBaskets() {
  const [data, setData] = useState<BasketsApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    rawFetch<BasketsApiResponse>(`${BACKEND_URL}/api/baskets`, {
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
