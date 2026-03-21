import { useState, useEffect } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { DashboardData } from "@/types/wealthos";

export function useWealthDashboard(rmId: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rmId?.trim()) return;

    apiCall<{ data: DashboardData }>(`${BACKEND_URL}/api/wealthos/dashboard/today?rm_id=${rmId}`, {
      onStart: () => { setLoading(true); setError(null); setData(null); },
      onSuccess: (response) => { setData(response.data); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [rmId]);

  return { data, loading, error };
}
