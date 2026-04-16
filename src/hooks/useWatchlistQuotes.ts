import { useState, useEffect, useCallback } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import type { ScreenerData } from '@/types/screener';

export interface WatchlistQuote {
  symbol: string;
  name: string;
  sector: string;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  bookValue: number | null;
  peValuationLabel: string | null;
}

// The screener endpoint returns the ScreenerData object directly (no success/data wrapper).
interface ApiWrapper {
  success?: boolean;
  data?: ScreenerData;
}

export function useWatchlistQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, WatchlistQuote>>({});
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async (syms: string[]) => {
    if (syms.length === 0) return;
    setLoading(true);
    const results = await Promise.allSettled(
      syms.map((sym) =>
        fetch(`${BACKEND_URL}/api/screener/${sym}`)
          .then((r) => r.json() as Promise<ApiWrapper>)
          .then((json) => {
            // API returns the ScreenerData object directly; fall back to wrapped form just in case
            const d: ScreenerData | null = (json as unknown as ScreenerData).symbol
              ? (json as unknown as ScreenerData)
              : (json.data ?? null);
            if (!d?.company) return null;
            return {
              symbol: sym,
              name: d.company.name,
              sector: d.company.sector,
              pe: d.valuation?.peRatio ?? null,
              pb: d.valuation?.pbRatio ?? null,
              roe: d.efficiency?.returnOnEquity ?? null,
              bookValue: d.perShare?.bookValue ?? null,
              peValuationLabel: d.valuation?.peValuationLabel ?? null,
            } satisfies WatchlistQuote;
          })
          .catch(() => null)
      )
    );
    const map: Record<string, WatchlistQuote> = {};
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value) {
        map[r.value.symbol] = r.value;
      }
    });
    setQuotes(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch_(symbols);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(',')]);

  return { quotes, loading };
}
