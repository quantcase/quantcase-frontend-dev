"use client";

import { BACKEND_URL } from "@/lib/constants";
import { useDashboardResource } from "@/hooks/useDashboardResource";
import type { DiscoverScreensResponse } from "@/types/investor-dashboard";

export function useDiscoverScreens() {
  return useDashboardResource<DiscoverScreensResponse>(`${BACKEND_URL}/api/discover/screens`);
}
