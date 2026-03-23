import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthSuggestion, SuggestionStatus, SuggestionPriority } from "@/types/wealthos";

interface SuggestionFilters {
  status?: SuggestionStatus;
  priority?: SuggestionPriority;
}

export function useWealthSuggestions(clientId: string, filters: SuggestionFilters = {}) {
  const [data, setData] = useState<WealthSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(() => {
    if (!clientId?.trim()) return;

    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);

    const query = params.toString();
    const url = `${BACKEND_URL}/api/wealthos/clients/${clientId}/suggestions${query ? `?${query}` : ""}`;

    apiCall<{ data: WealthSuggestion[] }>(url, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (response) => { setData(response.data); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [clientId, filters.status, filters.priority]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return { data, loading, error, refetch: fetchSuggestions };
}
