import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { rawFetch } from '@/lib/api';
import type { BasketStocksApiResponse } from '@/types/screener';

interface UseBasketStocksOptions {
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function useBasketStocks(
  basketId: string | null,
  options: UseBasketStocksOptions = {}
) {
  const { page = 1, size = 50, sort = 'marketCapCr', order = 'desc' } = options;
  const [data, setData] = useState<BasketStocksApiResponse | null>(null);
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

    rawFetch<BasketStocksApiResponse>(
      `${BACKEND_URL}/api/baskets/${basketId}/stocks?${params}`,
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
