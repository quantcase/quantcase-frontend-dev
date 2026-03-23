import { useState, useEffect } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthModel } from "@/types/wealthos";

export function useWealthModels() {
  const [data, setData] = useState<WealthModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiCall<{ data: WealthModel[] }>(`${BACKEND_URL}/api/wealthos/models`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (response) => { setData(response.data); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, []);

  return { data, loading, error };
}
