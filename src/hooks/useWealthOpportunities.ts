import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthOpportunity, Paginated } from "@/types/wealthos";

interface OpportunityFilters {
  page?: number;
  size?: number;
  category?: string;
  status?: string;
  client_id?: string;
}

export function useWealthOpportunities(filters: OpportunityFilters = {}) {
  const [data, setData] = useState<Paginated<WealthOpportunity> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { page = 1, size = 20, category, status, client_id } = filters;

  const fetchOpportunities = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));
    if (category && category !== "all") params.set("category", category);
    if (status) params.set("status", status);
    if (client_id) params.set("client_id", client_id);

    apiCall<{ data: WealthOpportunity[]; pagination: { page: number; size: number; totalItems: number; totalPages: number } }>(
      `${BACKEND_URL}/api/wealthos/opportunities?${params.toString()}`,
      {
        onStart: () => {
          setLoading(true);
          setError(null);
        },
        onSuccess: (res) => {
          setData({
            items: res.data,
            data: res.data,
            total: res.pagination.totalItems,
            page: res.pagination.page,
            size: res.pagination.size,
            pagination: res.pagination,
          });
          setLoading(false);
        },
        onError: (err) => {
          setError(err);
          setLoading(false);
        },
      }
    );
  }, [page, size, category, status, client_id]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return { data, loading, error, refetch: fetchOpportunities };
}
