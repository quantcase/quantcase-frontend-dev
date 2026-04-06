// Core type definitions for Management Factor Dashboard

export type TrustLevel = "HIGH" | "MODERATE" | "LOW";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";
export type StatusType = "ACHIEVED" | "MISSED" | "PENDING";
export type TargetType = "financial" | "conceptual";
export type TimeframeOption = "current_quarter" | "rolling_3_year" | "full_history";

// Company header
export interface CompanyInfo {
  name: string | null;
  company_name?: string | null;
  ticker: string | null;
  exchange: "NSE" | "BSE";
  industry: string | null;
  callDate: string | null;
  confidenceLevel: ConfidenceLevel;
  transcriptsAnalyzed?: number | null;
}

// Score cards
export interface FactorScore {
  factor: "Guidance Accuracy" | "Disclosure Honesty" | "Capital Allocation" | "Customer Traction" | string;
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
  targets?: Array<{ statement: string; severity?: string }>;
}

// Disclosures (structured 3-category object from backend)
export interface RiskDisclosure {
  risk_title: string;
  risk_type?: string | null;
  mitigation_strategy?: string | null;
  severity?: "high" | "medium" | "low" | null;
}

export interface BadNewsDisclosure {
  news_title: string;
  disclosure_type?: string | null;
  mitigation_strategy?: string | null;
  severity?: "high" | "medium" | "low" | null;
}

export interface LegalIssueDisclosure {
  issue_title: string;
  issue_type?: string | null;
  impact?: string | null;
  severity?: "high" | "medium" | "low" | null;
}

export interface Disclosures {
  risk?: RiskDisclosure[] | null;
  bad_news?: BadNewsDisclosure[] | null;
  legal_issues?: LegalIssueDisclosure[] | null;
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
  source_call?: string;
  source_date?: string;
  period: string;
  metric: string;
  statement?: string;
  targeted_value: string | number;
  current_value: string | number;
  variance?: string;
  variance_pct?: number;
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

// Capital Allocation
// ─── Capex Breakdown ──────────────────────────────────────────────────────────

export type CapexTimeframe = "last_quarter" | "12_months" | "3_years" | "5_years";

export interface CapexSlice {
  name: string;
  percentage: number;
  amount_label: string;
}

export interface CapexBreakdownPeriod {
  total_deployed: number;
  total_deployed_label: string;
  vs_5yr_avg_pct: number;
  largest_allocation: string;
  largest_allocation_pct: number;
  slices: CapexSlice[];
}

/** All four timeframes pre-computed by the backend */
export interface CapexBreakdown {
  last_quarter: CapexBreakdownPeriod | null;
  "12_months": CapexBreakdownPeriod | null;
  "3_years": CapexBreakdownPeriod | null;
  "5_years": CapexBreakdownPeriod | null;
}

// ─── ROCE Trend ───────────────────────────────────────────────────────────────

export interface RoceTrendMetric {
  label: string;
  value: string;
  /** Optional sub-label shown beneath the value (e.g. "-0.5pp vs 2023", "FY 2023") */
  sub_label?: string | null;
  sentiment: "positive" | "negative" | "neutral";
}

export interface RoceTrendDataPoint {
  period: string;
  roce: number;
}

export interface RoceTrendView {
  /** Label shown as date-range in header, e.g. "2019 – 2024" */
  date_range: string;
  wacc_threshold: number | null;
  period_avg_roce: number | null;
  data_points: RoceTrendDataPoint[];
  /** Exactly 4 metric cards: Latest ROCE, Peak ROCE, Avg ROCE, vs WACC */
  metrics: RoceTrendMetric[];
}

export interface RoceTrend {
  summary: string;
  quarterly: RoceTrendView | null;
  yearly: RoceTrendView | null;
}

// ─── Capital Allocation (top-level) ───────────────────────────────────────────

export interface CapitalAllocation {
  capex_breakdown: CapexBreakdown | null;
  roce_trend: RoceTrend | null;
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
  disclosures?: Disclosures | null;
  capital_allocation?: CapitalAllocation | null;
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