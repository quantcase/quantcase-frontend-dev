import { useState, useEffect } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthClient } from "@/types/wealthos";

export function useWealthClient(clientId: string) {
  const [data, setData] = useState<WealthClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId?.trim()) return;

    apiCall<{ data: WealthClient }>(`${BACKEND_URL}/api/wealthos/clients/${clientId}`, {
      onStart: () => { setLoading(true); setError(null); setData(null); },
      onSuccess: (response) => { setData(response.data); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [clientId]);

  return { data, loading, error };
}
