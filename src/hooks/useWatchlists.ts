import { useState, useEffect, useCallback } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import type { Watchlist, WatchlistsApiResponse, WatchlistApiResponse } from '@/types/screener';

// Hard-coded user_id until auth is wired up
const USER_ID = 'user123';

export function useWatchlists() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/watchlists?user_id=${USER_ID}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json: WatchlistsApiResponse = await res.json();
      setWatchlists(json.watchlists ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  /**
   * Add symbols to an existing watchlist or create a new one.
   * Returns the updated watchlist on success, throws on error.
   */
  const addSymbols = useCallback(
    async (symbols: string[], opts: { watchlistId: string } | { watchlistName: string }): Promise<Watchlist> => {
      const body: Record<string, unknown> = { user_id: USER_ID, symbols };
      if ('watchlistId' in opts) {
        body.watchlist_id = opts.watchlistId;
      } else {
        body.watchlist_name = opts.watchlistName;
      }

      const res = await fetch(`${BACKEND_URL}/api/watchlists/add-symbols`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? res.statusText);
      }
      const json: WatchlistApiResponse = await res.json();
      // Refresh watchlist list
      await fetch_();
      return json.watchlist;
    },
    [fetch_]
  );

  return { watchlists, loading, error, refresh: fetch_, addSymbols };
}
