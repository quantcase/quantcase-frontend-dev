import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";

interface ScoreVerdict {
  score: number;
  verdict: string;
}

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
  management: ScoreVerdict;
  opportunity: ScoreVerdict;
  deal: ScoreVerdict;
}

export interface ScreenerPeersResponse {
  symbol: string;
  basicIndustry: string;
  industryGroup: string;
  latestQuarter: string;
  yearAgoQuarter: string;
  count: number;
  peers: PeerRow[];
}

export function useScreenerPeers(symbol: string) {
  const [data, setData] = useState<ScreenerPeersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    fetch(`${BACKEND_URL}/api/screener/${symbol}/peers`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch peers: ${res.status}`);
        return res.json() as Promise<ScreenerPeersResponse>;
      })
      .then((json) => { setData(json); setLoading(false); })
      .catch((err: Error) => { setError(err.message); setLoading(false); });
  }, [symbol]);

  return { data, loading, error };
}
