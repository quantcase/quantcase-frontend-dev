import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthClientNote } from "@/types/wealthos";

export function useWealthNotes(clientId: string) {
  const [data, setData] = useState<WealthClientNote[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(() => {
    if (!clientId) return;

    apiCall<WealthClientNote[]>(`${BACKEND_URL}/api/wealthos/clients/${clientId}/notes`, {
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
  }, [clientId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return { data, loading, error, refetch: fetchNotes };
}
