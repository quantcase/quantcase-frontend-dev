import { useState, useEffect } from "react";
import { rawFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { TechnicalsResponse, TechnicalsApiResponse, TechnicalsDerived } from "@/types/technicals";

function unwrapDI(raw: TechnicalsApiResponse["decisionIntelligence"]): TechnicalsResponse["decisionIntelligence"] {
  if (!raw) return undefined;
  if ("decisionIntelligence" in raw) return raw.decisionIntelligence;
  return raw as TechnicalsResponse["decisionIntelligence"];
}

function computeDerived(data: TechnicalsResponse): TechnicalsDerived {
  const supportNum = data.supportResistance.static.support[0] ?? 0;
  const resistanceNum = data.supportResistance.static.resistance[0] ?? 0;
  const cmp = data.price.cmp;
  const range = resistanceNum - supportNum;
  const positionInRange = range > 0 ? ((cmp - supportNum) / range) * 100 : 0;
  const upsideToResistance = resistanceNum > 0 ? ((resistanceNum - cmp) / cmp) * 100 : 0;
  const downsideToSupport = supportNum > 0 ? ((cmp - supportNum) / cmp) * 100 : 0;
  const riskReward = downsideToSupport > 0 ? upsideToResistance / downsideToSupport : 0;
  const srMidpoint = (supportNum + resistanceNum) / 2;
  return { supportNum, resistanceNum, positionInRange, upsideToResistance, downsideToSupport, riskReward, srMidpoint };
}

export function useTechnicals(symbol: string) {
  const [data, setData] = useState<TechnicalsResponse | null>(null);
  const [derived, setDerived] = useState<TechnicalsDerived | null>(null);
  const [loading, setLoading] = useState(!!symbol?.trim());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) { setLoading(false); return; }
    rawFetch<TechnicalsApiResponse>(`${BACKEND_URL}/api/screener/${symbol}/technicals`, {
      onStart: () => { setLoading(true); setError(null); setData(null); setDerived(null); },
      onSuccess: (raw) => {
        const response: TechnicalsResponse = { ...raw, decisionIntelligence: unwrapDI(raw.decisionIntelligence) };
        setData(response);
        setDerived(computeDerived(response));
        setLoading(false);
      },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [symbol]);

  return { data, derived, loading, error };
}
