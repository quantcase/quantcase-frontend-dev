"use client";

import { BACKEND_URL } from "@/lib/constants";
import { useDashboardResource } from "@/hooks/useDashboardResource";
import type { PortfolioSummary } from "@/types/investor-dashboard";

export function usePortfolioSummary() {
  return useDashboardResource<PortfolioSummary>(`${BACKEND_URL}/api/portfolio/summary`);
}
