import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch } from "@/lib/api";
import type { MfScreenerParams, MfScreenerResponse } from "@/types/mutual-fund";

export function useMfScreener(params: MfScreenerParams) {
  const [data, setData] = useState<MfScreenerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.category) qs.set("category", params.category);
    if (params.risk) qs.set("risk", params.risk);
    if (params.rating != null) qs.set("rating", String(params.rating));
    if (params.amc_slug) qs.set("amc_slug", params.amc_slug);
    if (params.plan_type) qs.set("plan_type", params.plan_type);
    if (params.sort) qs.set("sort", params.sort);
    if (params.order) qs.set("order", params.order);
    if (params.page != null) qs.set("page", String(params.page));
    if (params.size != null) qs.set("size", String(params.size));

    rawFetch<MfScreenerResponse>(`${BACKEND_URL}/api/mutual-funds?${qs}`, {
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
  }, [
    params.q,
    params.category,
    params.risk,
    params.rating,
    params.amc_slug,
    params.plan_type,
    params.sort,
    params.order,
    params.page,
    params.size,
  ]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
