import { useState, useCallback, useEffect } from "react";
import { apiAuthGet } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";

export interface SmallcaseStatus {
  isConnected: boolean;
  broker: string | null;
}

export function useSmallcaseStatus() {
  const [status, setStatus] = useState<SmallcaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(() => {
    setLoading(true);
    apiAuthGet<{ success: boolean; data: SmallcaseStatus }>(
      `${BACKEND_URL}/api/smallcase/status`,
      {
        onSuccess: (res) => {
          setStatus(res.data);
          setLoading(false);
          setError(null);
        },
        onError: (err) => {
          setError(err);
          setLoading(false);
        }
      }
    );
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, error, refetch: fetchStatus };
}
