import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { HeartbeatGraphData } from "@/types/wealthos";

export function useRmHeartbeat(rmProfileId: string) {
  const [data, setData] = useState<HeartbeatGraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHeartbeat = useCallback(() => {
    if (!rmProfileId) return;

    apiCall<HeartbeatGraphData>(`${BACKEND_URL}/api/wealthos/heartbeat/rm/${rmProfileId}`, {
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
  }, [rmProfileId]);

  useEffect(() => {
    fetchHeartbeat();
  }, [fetchHeartbeat]);

  return { data, loading, error, refetch: fetchHeartbeat };
}

export function useCioHeartbeat(filters: { asset_class?: string; alert_only?: boolean; rm_id?: string } = {}) {
  const [data, setData] = useState<HeartbeatGraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { asset_class, alert_only, rm_id } = filters;

  const fetchHeartbeat = useCallback(() => {
    const params = new URLSearchParams();
    if (asset_class) params.set("asset_class", asset_class);
    if (alert_only) params.set("alert_only", "true");
    if (rm_id) params.set("rm_id", rm_id);

    const query = params.toString() ? `?${params.toString()}` : "";

    apiCall<any>(`${BACKEND_URL}/api/wealthos/heartbeat/cio${query}`, {
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
  }, [asset_class, alert_only, rm_id]);

  useEffect(() => {
    fetchHeartbeat();
  }, [fetchHeartbeat]);

  return { data, loading, error, refetch: fetchHeartbeat };
}
