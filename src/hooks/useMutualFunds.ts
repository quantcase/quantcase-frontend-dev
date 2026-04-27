"use client";

import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import type { MutualFundsListResponse, MutualFundScheme } from "@/types/mutual-fund";

export function useMutualFunds() {
  const [schemes, setSchemes] = useState<MutualFundScheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/mutual-funds/`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.json() as Promise<MutualFundsListResponse>;
      })
      .then((data) => {
        if (data.success) setSchemes(data.schemes);
        else throw new Error("Unexpected response format");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { schemes, loading, error };
}
