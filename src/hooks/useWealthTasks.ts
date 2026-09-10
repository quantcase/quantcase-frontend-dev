import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthTask, Paginated } from "@/types/wealthos";

interface TaskFilters {
  page?: number;
  size?: number;
  status?: string;
  client_id?: string;
  due_before?: string;
}

export function useWealthTasks(filters: TaskFilters = {}) {
  const [data, setData] = useState<Paginated<WealthTask> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { page = 1, size = 20, status, client_id, due_before } = filters;

  const fetchTasks = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));
    if (status) params.set("status", status);
    if (client_id) params.set("client_id", client_id);
    if (due_before) params.set("due_before", due_before);

    apiCall<{ data: WealthTask[]; pagination: { page: number; size: number; totalItems: number; totalPages: number } }>(
      `${BACKEND_URL}/api/wealthos/tasks?${params.toString()}`,
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
  }, [page, size, status, client_id, due_before]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { data, loading, error, refetch: fetchTasks };
}
