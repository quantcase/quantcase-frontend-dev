"use client";

import { BACKEND_URL } from "@/lib/constants";
import { useDashboardResource } from "@/hooks/useDashboardResource";
import type { MarketIndicesResponse } from "@/types/investor-dashboard";

export function useMarketIndices() {
  return useDashboardResource<MarketIndicesResponse>(`${BACKEND_URL}/api/market/indices`);
}
