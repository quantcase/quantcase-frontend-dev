import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthAction, Paginated } from "@/types/wealthos";

export function useWealthActions(clientId: string, page = 1, size = 20) {
  const [data, setData] = useState<Paginated<WealthAction> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActions = useCallback(() => {
    if (!clientId?.trim()) return;

    const params = new URLSearchParams({ page: String(page), size: String(size) });
    apiCall<{ data: WealthAction[]; pagination: { page: number; size: number; totalItems: number } }>(
      `${BACKEND_URL}/api/wealthos/clients/${clientId}/actions?${params.toString()}`,
      {
        onStart: () => { setLoading(true); setError(null); },
        onSuccess: (response) => {
          setData({
            items: response.data ?? [],
            total: response.pagination?.totalItems ?? 0,
            page: response.pagination?.page ?? page,
            size: response.pagination?.size ?? size,
          });
          setLoading(false);
        },
        onError: (err) => { setError(err); setLoading(false); },
      }
    );
  }, [clientId, page, size]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  return { data, loading, error, refetch: fetchActions };
}
