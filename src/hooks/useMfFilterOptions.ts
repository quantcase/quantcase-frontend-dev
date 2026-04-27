import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch } from "@/lib/api";
import type { MfFilterOptions } from "@/types/mutual-fund";

export function useMfFilterOptions() {
  const [data, setData] = useState<MfFilterOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    rawFetch<MfFilterOptions>(`${BACKEND_URL}/api/mutual-funds/filter-options`, {
      onStart: () => {
        setLoading(true);
        setError(null);
      },
      onSuccess: (json) => {
        setData(json);
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      },
    });
  }, []);

  return { data, loading, error };
}
