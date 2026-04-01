import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch } from "@/lib/api";

export interface ShareholdingDataPoint {
  quarter: string;
  value: number | null;
}

export interface ShareholdingChild {
  id: string;
  label: string;
  data: ShareholdingDataPoint[];
}

export interface ShareholdingSection {
  id: string;
  label: string;
  isExpandable: boolean;
  data: ShareholdingDataPoint[];
  children: ShareholdingChild[];
}

export interface ShareholdingResponse {
  company: string;
  symbol: string;
  quarters: string[];
  sections: ShareholdingSection[];
}

export function useShareholding(symbol: string) {
  const [data, setData] = useState<ShareholdingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) return;
    rawFetch<ShareholdingResponse>(`${BACKEND_URL}/api/screener/${symbol}/shareholding`, {
      onStart: () => { setLoading(true); setError(null); setData(null); },
      onSuccess: (response) => { setData(response); setLoading(false); },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [symbol]);

  return { data, loading, error };
}
