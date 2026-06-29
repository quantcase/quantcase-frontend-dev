export type TranscriptSignalType =
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

// PPT uses the same set as transcript
export type PptSignalType = TranscriptSignalType;

export type AnnualReportSignalType =
  | "financial_figure"
  | "notes_to_accounts"
  | "guidance"
  | "growth_forecast"
  | "capital_allocation"
  | "risk_factor"
  | "contingent_liability"
  | "governance_signal"
  | "strategic_claim"
  | "m_and_a"
  | "kpi"
  | "leadership_statement"
  | "milestone"
  | "ongoing"
  | "industry_signal"
  | "disclosure_quality"
  | "earnings_quality"
  | "guidance_revision";

export type MarketDataSignalType = "pe" | "cmp";

// Union of all signal types (for the count endpoint which accepts a flat list)
export type SignalType = TranscriptSignalType | AnnualReportSignalType;

export type PluginCategory = "management" | "deal" | "opportunity";

export interface HtmlSkill {
  id: string;
  slug: string;
  name: string;
  skill_prompt?: string;
  transcript_signal_types: TranscriptSignalType[];
  ppt_signal_types: PptSignalType[];
  annual_report_signal_types: AnnualReportSignalType[];
  market_data_signal_types: MarketDataSignalType[];
  category: PluginCategory;
  model: string;
  max_tokens: number;
  max_transcript_qtrs: number | null;
  max_ppt_qtrs: number | null;
  max_annual_report_years: number | null;
  max_market_data_months: number | null;
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
  transcript_signal_types: TranscriptSignalType[];
  ppt_signal_types: PptSignalType[];
  annual_report_signal_types: AnnualReportSignalType[];
  market_data_signal_types: MarketDataSignalType[];
  model: string;
  max_tokens: number;
  max_transcript_qtrs: number | null;
  max_ppt_qtrs: number | null;
  max_annual_report_years: number | null;
  max_market_data_months: number | null;
  force: boolean;
}

export interface LiveSkillConfig {
  prompt: string;
  transcriptSignalTypes: TranscriptSignalType[];
  pptSignalTypes: PptSignalType[];
  annualReportSignalTypes: AnnualReportSignalType[];
  marketDataSignalTypes: MarketDataSignalType[];
  model: string;
  maxTokens: number;
  maxTranscriptQtrs: number | null;
  maxPptQtrs: number | null;
  maxAnnualReportYears: number | null;
  maxMarketDataMonths: number | null;
}

export const FAVORITE_TICKERS = ["HDFCBANK", "RELIANCE", "ASIANPAINT", "IEX", "MSUMI"] as const;
export type TestTicker = string;

export interface SignalCount {
  signal_type: SignalType;
  count: number;
}

export interface SignalCountSource {
  total: number;
  periods_count: number;
  periods: { fiscal_year: string; quarter?: string | null }[];
  signal_counts: SignalCount[];
}

export interface SignalCountsResponse {
  ticker: string;
  total: number;
  by_source: {
    transcript: SignalCountSource;
    ppt: SignalCountSource;
    annual_report: SignalCountSource;
  };
}

export const TRANSCRIPT_SIGNAL_TYPE_LABELS: Record<TranscriptSignalType, string> = {
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

// PPT uses the same labels as transcript
export const PPT_SIGNAL_TYPE_LABELS: Record<PptSignalType, string> = TRANSCRIPT_SIGNAL_TYPE_LABELS;

export const ANNUAL_REPORT_SIGNAL_TYPE_LABELS: Record<AnnualReportSignalType, string> = {
  financial_figure: "Financial Figure",
  notes_to_accounts: "Notes to Accounts",
  guidance: "Guidance",
  growth_forecast: "Growth Forecast",
  capital_allocation: "Capital Allocation",
  risk_factor: "Risk Factor",
  contingent_liability: "Contingent Liability",
  governance_signal: "Governance Signal",
  strategic_claim: "Strategic Claim",
  m_and_a: "M&A",
  kpi: "KPI",
  leadership_statement: "Leadership Statement",
  milestone: "Milestone",
  ongoing: "Ongoing",
  industry_signal: "Industry Signal",
  disclosure_quality: "Disclosure Quality",
  earnings_quality: "Earnings Quality",
  guidance_revision: "Guidance Revision",
};

export const MARKET_DATA_SIGNAL_TYPE_LABELS: Record<MarketDataSignalType, string> = {
  pe: "P/E",
  cmp: "CMP",
};

// Combined map for the count endpoint (flat signal_types query param, still unchanged)
export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  ...TRANSCRIPT_SIGNAL_TYPE_LABELS,
  ...ANNUAL_REPORT_SIGNAL_TYPE_LABELS,
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
