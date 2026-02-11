export interface SummaryData {
  success: boolean;
  data: {
    id: string;
    callId: string;
    entities: {
      people: string[];
      geographies: string[];
      business_segments: string[];
    };
    promises: Array<{
      metric: string;
      target: string;
      timeline: string;
      statement: string;
    }>;
    milestones: Array<{
      metric: string;
      period: string;
      guided_value: string;
    }>;
    metrics: Array<{
      metric: string;
      period: string;
      guided_value: string;
    }>;
    governanceSignals: {
      transparent: boolean;
      defensive_language: boolean;
      capital_allocation_clarity: boolean;
    };
    notablePatterns: {
      tone: string;
      risk_disclosures: Array<{
        risk: string;
        severity: string;
        disclosed_early: boolean;
      }>;
    };
    managementScore: number | null;
    confidence: string;
    createdAt: string;
    updatedAt: string;
  };
}
