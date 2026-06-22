export type SignalType =
  | "guidance"
  | "industry_signal"
  | "capital_allocation"
  | "disclosure_quality"
  | "distribution_customer"
  | "growth_forecast"
  | "earnings_quality"
  | "kpi"
  | "mgmt_tone"
  | "analyst_questions"
  | "guidance_revision"
  | "pricing_power"
  | "competitive_position"
  | "milestone"
  | "ongoing";

export type PluginCategory = "management" | "deal" | "opportunity";

export interface HtmlSkill {
  id: string;
  slug: string;
  name: string;
  skill_prompt?: string;
  signal_types: SignalType[];
  category: PluginCategory;
  model: string;
  max_tokens: number;
  max_transcript_qtrs: number | null;
  max_ppt_qtrs: number | null;
  max_annual_report_years: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HtmlSkillOutput {
  id: string;
  skill_id: string;
  ticker: string;
  fiscal_year: string | null;
  quarter: string | null;
  raw_html: string;
  prompt_v: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  created_at: string;
  updated_at: string;
}

export interface RunResponse {
  cached: boolean;
  output: HtmlSkillOutput;
}

export interface HtmlSkillJob {
  id: string;
  slug: string;
  ticker: string;
  type: string;
  status: "pending" | "active" | "completed" | "failed";
}

export interface RunJobResponse {
  success: boolean;
  message: string;
  job: HtmlSkillJob;
}

export interface JobStatusResponse {
  success: boolean;
  data: {
    status: "pending" | "active" | "completed" | "failed";
    type?: string;
    failedReason?: string;
    error?: string;
    output?: {
      raw_html: string;
      input_tokens: number;
      output_tokens: number;
      cost_usd: number;
    };
  };
}

export interface PreviewRunRequest {
  ticker: string;
  skill_prompt: string;
  signal_types: SignalType[];
  model: string;
  max_tokens: number;
  max_transcript_qtrs: number | null;
  max_ppt_qtrs: number | null;
  max_annual_report_years: number | null;
  force: boolean;
}

export interface LiveSkillConfig {
  prompt: string;
  signalTypes: SignalType[];
  model: string;
  maxTokens: number;
  maxTranscriptQtrs: number | null;
  maxPptQtrs: number | null;
  maxAnnualReportYears: number | null;
}

export const FAVORITE_TICKERS = ["HDFCBANK", "RELIANCE", "ASIANPAINT", "IEX", "MSUMI"] as const;
export type TestTicker = string;

export interface SignalCount {
  signal_type: SignalType;
  count: number;
}

export interface SignalCountsResponse {
  ticker: string;
  total: number;
  periods_count: number;
  periods: { fiscal_year: string; quarter: string }[];
  signal_counts: SignalCount[];
}

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  guidance: "Guidance",
  industry_signal: "Industry Signal",
  capital_allocation: "Capital Allocation",
  disclosure_quality: "Disclosure Quality",
  distribution_customer: "Distribution / Customer",
  growth_forecast: "Growth Forecast",
  earnings_quality: "Earnings Quality",
  kpi: "KPI",
  mgmt_tone: "Mgmt Tone",
  analyst_questions: "Analyst Questions",
  guidance_revision: "Guidance Revision",
  pricing_power: "Pricing Power",
  competitive_position: "Competitive Position",
  milestone: "Milestone",
  ongoing: "Ongoing",
};

export const CATEGORY_LABELS: Record<PluginCategory, string> = {
  management: "Management",
  deal: "Deal",
  opportunity: "Opportunity",
};

export const MODEL_OPTIONS: { label: string; value: string }[] = [
  { label: "Haiku", value: "~anthropic/claude-haiku-latest" },
  { label: "Sonnet", value: "~anthropic/claude-sonnet-latest" },
  { label: "MiMo-2.5", value: "xiaomi/mimo-v2.5" },
];
