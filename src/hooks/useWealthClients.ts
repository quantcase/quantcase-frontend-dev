import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthClient, Paginated } from "@/types/wealthos";

interface ClientFilters {
  page?: number;
  size?: number;
  segment?: string;
  rm_id?: string;
  search?: string;
}

export function useWealthClients(filters: ClientFilters = {}) {
  const [data, setData] = useState<Paginated<WealthClient> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { page = 1, size = 20, segment, rm_id, search } = filters;

  const fetchClients = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));
    if (segment) params.set("segment", segment);
    if (rm_id) params.set("rm_id", rm_id);
    if (search) params.set("search", search);

    apiCall<{ data: WealthClient[]; pagination: { page: number; size: number; totalItems: number; totalPages: number } }>(`${BACKEND_URL}/api/wealthos/clients?${params.toString()}`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (response) => {
        setData({
          items: response.data,
          total: response.pagination.totalItems,
          page: response.pagination.page,
          size: response.pagination.size,
        });
        setLoading(false);
      },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [page, size, segment, rm_id, search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { data, loading, error, refetch: fetchClients };
}
