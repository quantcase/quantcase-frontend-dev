import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthPortfolio } from "@/types/wealthos";

export function useWealthPortfolio(clientId: string) {
  const [data, setData] = useState<WealthPortfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(() => {
    if (!clientId?.trim()) return;

    apiCall<{ data: WealthPortfolio }>(`${BACKEND_URL}/api/wealthos/clients/${clientId}/portfolio`, {
      onStart: () => {
        setLoading(true);
        setError(null);
      },
      onSuccess: (response: any) => {
        const portfolio = response.data || response;
        if (portfolio) {
          if (portfolio.total_value == null && portfolio.total_value_cr != null) {
            portfolio.total_value = portfolio.total_value_cr;
          }
        }
        setData(portfolio);
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      },
    });
  }, [clientId]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { data, loading, error, refetch: fetchPortfolio };
}
