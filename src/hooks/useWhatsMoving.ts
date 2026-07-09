"use client";

import { BACKEND_URL } from "@/lib/constants";
import { useDashboardResource } from "@/hooks/useDashboardResource";
import type { WhatsMovingResponse } from "@/types/investor-dashboard";

export function useWhatsMoving(limit = 4) {
  return useDashboardResource<WhatsMovingResponse>(
    `${BACKEND_URL}/api/portfolio/whats-moving?limit=${limit}`
  );
}
