import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch } from "@/lib/api";
import type { PeerDataResponse } from "@/types/opportunity";

export function usePeerData(callId: string) {
  const [data, setData] = useState<PeerDataResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!callId) return;

    rawFetch<PeerDataResponse>(`${BACKEND_URL}/api/opportunity/peer-data?callId=${callId}`, {
      onStart: () => {
        setLoading(true);
        setData(null);
      },
      onSuccess: (json) => {
        setData(json);
        setLoading(false);
      },
      onError: () => {
        setData(null);
        setLoading(false);
      },
    });
  }, [callId]);

  return { data, loading };
}
