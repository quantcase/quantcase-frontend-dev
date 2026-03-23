import { useState, useEffect } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { RMAnalytics, ClientAnalytics } from "@/types/wealthos";

export function useWealthRMAnalytics(rmId: string) {
  const [data, setData] = useState<RMAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rmId?.trim()) return;

    apiCall<{ data: RMAnalytics }>(`${BACKEND_URL}/api/wealthos/analytics/rm/${rmId}`, {
      onStart: () => { setLoading(true); setError(null); setData(null); },
      onSuccess: (response) => { setData(response.data); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [rmId]);

  return { data, loading, error };
}

export function useWealthClientAnalytics() {
  const [data, setData] = useState<ClientAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiCall<{ data: ClientAnalytics }>(`${BACKEND_URL}/api/wealthos/analytics/clients`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (response) => { setData(response.data); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, []);

  return { data, loading, error };
}
