// Core type definitions for Management Factor Dashboard

export type TrustLevel = "HIGH" | "MODERATE" | "LOW";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";
export type StatusType = "ACHIEVED" | "MISSED" | "PENDING";
export type TargetType = "financial" | "conceptual";
export type TimeframeOption = "current_quarter" | "rolling_3_year" | "full_history";

// API Response types
export interface Promise {
  metric: string;
  target: string;
  timeline: string;
  statement: string;
}

export interface RiskDisclosure {
  risk: string;
  severity: "high" | "medium" | "low";
  disclosed_early: boolean;
}

// Company header
export interface CompanyInfo {
  name: string | null;
  ticker: string | null;
  exchange: "NSE" | "BSE";
  industry: string | null;
  callDate: string | null;
  confidenceLevel: ConfidenceLevel;
}

// Score cards
export interface FactorScore {
  factor: "Guidance Accuracy" | "Disclosure Honesty" | "Capital Allocation";
  rating: TrustLevel;
  descriptor: string | null;
}

// Trust panel
export interface TrustScore {
  overall: TrustLevel;
  subfactors: {
    guidanceAccuracy: number;
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
  targeted_value: string;
  current_value: string;
  variance: string;
  status: StatusType;
  target_type: TargetType;
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

export interface ManagementDashboardResponse {
  success: boolean;
  data: ManagementDashboardData;
}

// Transcript Call types
export interface TranscriptCall {
  id: string;
  company: string;
  company_name: string;
  basic_industry: string;
  fiscal_year: string;
  call_date: string;
  quarter: string;
  ppt_url: string;
}

export interface TranscriptCallsResponse {
  success: boolean;
  data: TranscriptCall[];
}

// Job types
export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface BullMQObject {
  id: string;
  name: string;
  state: string;
  progress: number;
  attemptsMade: number;
  returnvalue: unknown;
}

export interface Job {
  id: string;
  callId: string;
  type: string;
  status: JobStatus;
  bullmqId: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  error?: string;
  bullmqObject?: BullMQObject;
}

export interface JobCreateResponse {
  success: boolean;
  message: string;
  job: Job;
}

export interface JobStatusResponse {
  success: boolean;
  data: Job;
}