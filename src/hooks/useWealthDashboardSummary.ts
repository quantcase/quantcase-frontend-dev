import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { DashboardSummary } from "@/types/wealthos";

export function useWealthDashboardSummary() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(() => {
    apiCall<DashboardSummary>(`${BACKEND_URL}/api/wealthos/dashboard/summary`, {
      onStart: () => {
        setLoading(true);
        setError(null);
      },
      onSuccess: (res: any) => {
        setData(res.data || res);
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      },
    });
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, loading, error, refetch: fetchSummary };
}
