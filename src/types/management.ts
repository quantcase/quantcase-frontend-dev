// Core type definitions for Management Factor Dashboard

export type TimeframeOption = "current_quarter" | "rolling_3_year" | "full_history";

// ─── MQI Score ────────────────────────────────────────────────────────────────

export interface MqiDimension {
  max: number;
  score: number;
  rationale: string;
}

export interface MqiScore {
  label: string;
  total: number;
  dimensions: {
    guidance_accuracy: MqiDimension;
    red_flags: MqiDimension;
    investment_thesis: MqiDimension;
    promoter_activity: MqiDimension;
  };
  investment_implication: string;
}

// ─── Guidance vs Actuals ──────────────────────────────────────────────────────

export type GuidanceSeverity =
  | "beat"
  | "major"
  | "mediocre"
  | "minor"
  | "rolled_forward"
  | "ongoing"
  | "not_trackable";

export type GuidanceTag =
  | "order_book"
  | "revenue_growth"
  | "revenue"
  | "deal_conversion"
  | "disclosure_commitment"
  | "vertical_recovery"
  | "margin"
  | "ai_revenue"
  | "geography_recovery"
  | "strategic_capex"
  | "project_milestone"
  | string;

export interface GuidanceRow {
  tag: GuidanceTag;
  delta: string;
  actual: string;
  metric: string;
  period: string;
  guidance: string;
  severity: GuidanceSeverity;
  management_explanation: string;
}

export interface GuidanceVsActuals {
  rows: GuidanceRow[];
  misses: { major: number; minor: number; mediocre: number };
  pattern: string;
  hit_rate: { met_or_beat: number; total_trackable: number };
  guidance_bias: string;
}

// ─── Legacy types (used by orphaned components, not by the active page) ───────

export type TrustLevel = "HIGH" | "MODERATE" | "LOW";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";
export type StatusType = "ACHIEVED" | "MISSED" | "PENDING";
type TargetType = "financial" | "conceptual";

interface CompanyInfo {
  name: string | null;
  company_name?: string | null;
  ticker: string | null;
  exchange: "NSE" | "BSE";
  industry: string | null;
  callDate: string | null;
  confidenceLevel: ConfidenceLevel;
  transcriptsAnalyzed?: number | null;
}

export interface FactorScore {
  factor: string;
  rating: TrustLevel;
  descriptor: string | null;
}

interface TrustScore {
  overall: TrustLevel;
  subfactors: { guidanceAccuracy: number; disclosureHonesty: number; capitalAllocation: number };
}

interface GovernanceSignal {
  id: string;
  text: string;
  isPositive: boolean;
  targets?: Array<{ statement: string; severity?: string }>;
}

interface ConsistencyMetrics {
  score: number;
  maxScore: number;
  hitRate: number;
  disclosurePattern: string;
}

interface GuidanceRecord {
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
  data_source?: string | null;
}

interface NotablePattern {
  id: string;
  title: string;
  description: string;
  category: "positive" | "neutral" | "negative";
}

type CapexTimeframe = "last_quarter" | "12_months" | "3_years" | "5_years";

interface CapexSlice { name: string; percentage: number; amount_label: string }
interface CapexBreakdownPeriod {
  total_deployed: number; total_deployed_label: string; vs_5yr_avg_pct: number;
  largest_allocation: string; largest_allocation_pct: number; slices: CapexSlice[];
}
interface CapexBreakdown {
  last_quarter: CapexBreakdownPeriod | null; "12_months": CapexBreakdownPeriod | null;
  "3_years": CapexBreakdownPeriod | null; "5_years": CapexBreakdownPeriod | null;
}

interface RoceTrendMetric { label: string; value: string; sub_label?: string | null; sentiment: "positive" | "negative" | "neutral" }
interface RoceTrendDataPoint { period: string; roce: number }
interface RoceTrendView {
  date_range: string; wacc_threshold: number | null; period_avg_roce: number | null;
  data_points: RoceTrendDataPoint[]; metrics: RoceTrendMetric[];
}
interface RoceTrend { summary: string; quarterly: RoceTrendView | null; yearly: RoceTrendView | null }
interface CapitalAllocation { capex_breakdown: CapexBreakdown | null; roce_trend: RoceTrend | null }

// ─── Investment Thesis ────────────────────────────────────────────────────────

export interface WatchlistItem {
  number: number;
  what_to_listen_for: string;
  why_it_matters: string;
  green_signal: string;
  red_signal: string;
}

export interface InvestmentThesis {
  bull_case: string[];
  bear_case: string[];
  next_concall_watchlist: WatchlistItem[];
}

// ─── Red Flags ────────────────────────────────────────────────────────────────

export type RedFlagSeverity = "caution" | "watch";

export interface RedFlag {
  title: string;
  evidence: string;
  severity: RedFlagSeverity;
  implication: string;
}

// ─── Promoter Activity ────────────────────────────────────────────────────────

export interface ShareholdingEntry {
  quarter: string;
  promoter_pct: number | null;
  pledge_pct: number | null;
  change: number | null;
  signal: string;
}

export interface PromoterActivity {
  verdict: string;
  shareholding: ShareholdingEntry[];
  promoter_note: string;
  verdict_rationale: string;
  mqi_rationale?: string;
}

// ─── Management Intelligence ──────────────────────────────────────────────────

export interface IntelligenceSignalItem {
  key: string;
  label: string;
  score: number;
  max_score: number;
  sentiment: "positive" | "negative" | "neutral";
  details: string[];
}

export interface IntelligenceRecommendedStrategy {
  action: string;
  thesis?: string | null;
  timing?: string | null;
  segment?: string | null;
  rationale?: string | null;
}

export interface ManagementIntelligence {
  key_takeaways: string[];
  signals_breakdown: IntelligenceSignalItem[];
  recommended_strategy: IntelligenceRecommendedStrategy | null;
  watchouts: string[];
}

// ─── Dashboard Data ───────────────────────────────────────────────────────────

export interface ManagementDashboardData {
  mqi_score: MqiScore;
  guidance_vs_actuals: GuidanceVsActuals;
  investment_thesis?: InvestmentThesis;
  red_flags?: RedFlag[];
  promoter_activity?: PromoterActivity;
  management_intelligence?: ManagementIntelligence;
  analyzedAt?: string | null;
}

export interface ManagementDashboardResponse {
  success: boolean;
  data: ManagementDashboardData;
  analyzedAt?: string | null;
}

// ─── Transcript Call ──────────────────────────────────────────────────────────

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

// ─── Jobs ─────────────────────────────────────────────────────────────────────

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

export type PipelineStepStatus = "waiting" | "processing" | "completed" | "failed";

export interface PipelineStep {
  analysis_type: string;
  label: string;
  status: PipelineStepStatus;
}

export interface PipelineJob {
  id: string;
  callId: string;
  type: string;
  status: JobStatus;
  all_steps: PipelineStep[];
  error?: string;
}

export interface FullPipelineResponse {
  success: boolean;
  message: string;
  job: PipelineJob;
}

export interface JobStatusResponse {
  success: boolean;
  data: Job;
}

export interface PipelineJobStatusResponse {
  success: boolean;
  data: PipelineJob;
}
