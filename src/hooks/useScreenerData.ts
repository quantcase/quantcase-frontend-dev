import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { rawFetch } from '@/lib/api';
import { ScreenerData } from '@/types/screener';

export function useScreenerData(symbol: string) {
  const [data, setData] = useState<ScreenerData | null>(null);
  const [loading, setLoading] = useState(!!symbol?.trim());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) { setLoading(false); return; }

    const url = `${BACKEND_URL}/api/screener/${symbol}`;

    rawFetch<ScreenerData>(url, {
      onStart: () => {
        setLoading(true);
        setError(null);
        setData(null);
      },
      onSuccess: (response) => {
        setData(response);
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setData(null);
        setLoading(false);
      },
    });
  }, [symbol]);

  return { data, loading, error };
}
