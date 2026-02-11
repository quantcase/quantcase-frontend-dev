// Core type definitions for Management Factor Dashboard

export type TrustLevel = "HIGH" | "MODERATE" | "LOW";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";
export type StatusType = "MET" | "MISS" | "UNDERPERFORM";
export type TimeframeOption = "current_quarter" | "rolling_3_year" | "full_history";

// Company header
export interface CompanyInfo {
  name: string;
  ticker: string;
  exchange: "NSE" | "BSE";
  industry: string;
  callDate: string;
  confidenceLevel: ConfidenceLevel;
}

// Score cards
export interface FactorScore {
  factor: "Guidance Accuracy" | "Disclosure Honesty" | "Capital Allocation";
  rating: TrustLevel;
  descriptor: string;
}

// Trust panel
export interface TrustScore {
  overall: TrustLevel;
  subfactors: {
    governanceAccuracy: number;
    disclosureHonesty: number;
    capitalAllocation: number;
  };
}

// Governance signals
export interface GovernanceSignal {
  id: string;
  text: string;
  isPositive: boolean;
}

// Consistency metrics
export interface ConsistencyMetrics {
  score: number;
  maxScore: number;
  hitRate: number;
  disclosurePattern: string;
}

// Guidance table
export interface GuidanceRecord {
  id: string;
  period: string;
  metric: string;
  guided: string;
  actual: string;
  variance: string;
  status: StatusType;
}

// Notable patterns
export interface NotablePattern {
  id: string;
  title: string;
  description: string;
  category: "positive" | "neutral" | "negative";
}

// Complete dashboard data
export interface ManagementDashboardData {
  company: CompanyInfo;
  scores: FactorScore[];
  trust: TrustScore;
  governanceSignals: GovernanceSignal[];
  consistency: ConsistencyMetrics;
  guidanceRecords: GuidanceRecord[];
  notablePatterns: NotablePattern[];
  selectedTimeframe: TimeframeOption;
}
