import { useState, useEffect } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthRM } from "@/types/wealthos";

export function useWealthRMList() {
  const [data, setData] = useState<WealthRM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiCall<{ data: WealthRM[] }>(`${BACKEND_URL}/api/wealthos/rm`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (response) => { setData(response.data); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, []);

  return { data, loading, error };
}

export function useWealthRM(rmId: string) {
  const [data, setData] = useState<WealthRM | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rmId?.trim()) return;

    apiCall<{ data: WealthRM }>(`${BACKEND_URL}/api/wealthos/rm/${rmId}`, {
      onStart: () => { setLoading(true); setError(null); setData(null); },
      onSuccess: (response) => { setData(response.data); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [rmId]);

  return { data, loading, error };
}
