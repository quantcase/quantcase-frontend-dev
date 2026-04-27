import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { rawFetch } from '@/lib/api';
import type { MfBasketSchemesApiResponse } from '@/types/mutual-fund';

interface UseMfBasketSchemesOptions {
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function useMfBasketSchemes(
  basketId: string | null,
  options: UseMfBasketSchemesOptions = {}
) {
  const { page = 1, size = 50, sort = 'aum', order = 'desc' } = options;
  const [data, setData] = useState<MfBasketSchemesApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!basketId) return;

    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort,
      order,
    });

    rawFetch<MfBasketSchemesApiResponse>(
      `${BACKEND_URL}/api/mutual-funds/baskets/${basketId}/schemes?${params}`,
      {
        onStart: () => {
          setLoading(true);
          setError(null);
          setData(null);
        },
        onSuccess: (json) => {
          setData(json);
          setLoading(false);
        },
        onError: (err) => {
          setError(err);
          setLoading(false);
        },
      }
    );
  }, [basketId, page, size, sort, order]);

  return { data, loading, error };
}
