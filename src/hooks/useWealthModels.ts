import { useState, useEffect } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthModel } from "@/types/wealthos";

export function useWealthModels(refreshKey?: number) {
  const [data, setData] = useState<WealthModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiCall<{ data: WealthModel[] }>(`${BACKEND_URL}/api/wealthos/models`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (response: any) => { setData(response.data || response); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [refreshKey]);

  return { data, loading, error };
}
