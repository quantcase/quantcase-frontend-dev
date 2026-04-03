import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiPost } from "@/lib/api";

const DEFAULT_INDICATORS = [
  "cmp", "pe", "marketCap", "divYld", "npQtr",
  "qtrProfitVar", "salesQtr", "qtrSalesVar", "roce",
];

export interface PeerRow {
  symbol: string;
  name: string;
  isSubject: boolean;
  cmp: number | null;
  pe: number | null;
  marketCapCr: number | null;
  divYld: number | null;
  npQtrCr: number | null;
  qtrProfitVar: number | null;
  salesQtrCr: number | null;
  qtrSalesVar: number | null;
  roce: number | null;
}

export interface ScreenerPeersResponse {
  symbol: string;
  basicIndustry: string;
  industryGroup: string;
  latestQuarter: string;
  yearAgoQuarter: string;
  indicators: string[];
  count: number;
  peers: PeerRow[];
}

export function useScreenerPeers(symbol: string) {
  const [data, setData] = useState<ScreenerPeersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) return;

    apiPost<ScreenerPeersResponse>(
      `${BACKEND_URL}/api/screener/${symbol}/peers`,
      {
        onStart: () => { setLoading(true); setError(null); setData(null); },
        onSuccess: (json) => { setData(json); setLoading(false); },
        onError: (err) => { setError(err); setLoading(false); },
      },
      { indicators: DEFAULT_INDICATORS }
    );
  }, [symbol]);

  return { data, loading, error };
}
