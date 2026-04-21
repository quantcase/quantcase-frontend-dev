import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiCall } from "@/lib/api";

interface OpportunityPromptMetric {
  name: string;
  type: string;
  trend?: string;
}

interface OpportunityPromptData {
  section: string;
  bfsi: boolean;
  instructions: string;
  metrics: OpportunityPromptMetric[];
}

interface OpportunityPromptResponse {
  success: boolean;
  data: OpportunityPromptData;
}

// Maps UI section IDs to API section param values
export const SECTION_ID_MAP: Record<string, string> = {
  industry_overview: "industry",
  competition: "competition",
  financial_strength: "financial_strength",
  customer_traction: "customer_traction",
};

export function useOpportunityPrompt(callId: string, section: string) {
  const [data, setData] = useState<OpportunityPromptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId || !section) return;

    const apiSection = SECTION_ID_MAP[section] ?? section;
    const url = `${BACKEND_URL}/api/opportunity/prompt?section=${apiSection}&callId=${callId}`;

    apiCall<OpportunityPromptResponse>(url, {
      onStart: () => {
        setLoading(true);
        setError(null);
      },
      onSuccess: (response) => {
        setData(response.data);
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      },
    });
  }, [callId, section]);

  return { data, loading, error };
}
