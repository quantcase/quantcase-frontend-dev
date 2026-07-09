"use client";

import { BACKEND_URL } from "@/lib/constants";
import { useDashboardResource } from "@/hooks/useDashboardResource";
import type { ResearchLibrarySummary } from "@/types/investor-dashboard";

export function useResearchLibrarySummary() {
  return useDashboardResource<ResearchLibrarySummary>(
    `${BACKEND_URL}/api/research-library/summary`
  );
}
