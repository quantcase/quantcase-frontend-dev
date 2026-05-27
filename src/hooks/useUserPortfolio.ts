"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet } from "@/lib/api";
import type { UserPortfolio } from "@/types/investor-portfolio";

interface State {
  data: UserPortfolio | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useUserPortfolio() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null, notFound: false });

  const fetch = useCallback(() => {
    setState(s => ({ ...s, loading: true, error: null, notFound: false }));
    apiAuthGet<{ success: boolean; data: UserPortfolio }>(
      `${BACKEND_URL}/api/portfolio/user`,
      {
        onSuccess: (res) => setState({ data: res.data, loading: false, error: null, notFound: false }),
        onError: (err) => {
          const notFound = err.includes("404") || err.toLowerCase().includes("no portfolio");
          setState({ data: null, loading: false, error: notFound ? null : err, notFound });
        },
        onComplete: () => setState(s => ({ ...s, loading: false })),
      }
    );
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}
