"use client";

import { BACKEND_URL } from "@/lib/constants";
import { useDashboardResource } from "@/hooks/useDashboardResource";
import type { ModSynopsis } from "@/types/investor-dashboard";

export function useModSynopsis() {
  return useDashboardResource<ModSynopsis>(`${BACKEND_URL}/api/portfolio/mod-synopsis`);
}
