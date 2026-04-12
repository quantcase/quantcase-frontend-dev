import { useState, useEffect, useCallback } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import type { ScreenerData } from '@/types/screener';

export interface WatchlistQuote {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changePercent: number;
  marketCap: number;
  marketCapLabel: string | null;
  week52High: number;
  week52Low: number;
  pe: number | null;
  pb: number | null;
}

interface ApiWrapper {
  success: boolean;
  data: ScreenerData;
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
            if (!json.success || !json.data) return null;
            const { company, quote, valuation } = json.data;
            return {
              symbol: sym,
              name: company.name,
              sector: company.sector,
              price: quote.price,
              changePercent: quote.changePercent,
              marketCap: quote.marketCap,
              marketCapLabel: quote.marketCapLabel,
              week52High: quote.week52High,
              week52Low: quote.week52Low,
              pe: valuation.peRatio ?? null,
              pb: valuation.pbRatio ?? null,
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
