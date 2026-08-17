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

// Base path for the HTML Incremental Skills API (upgrade of the old /api/html-skills)
export const API_BASE = "/api/html-incremental-skills";

export interface HtmlSkill {
  id: string;
  slug: string;
  name: string;
  data_extraction_prompt: string;
  html_template_prompt: string;
  html_template_filename?: string | null;
  use_template_engine: boolean;
  enable_data_validation: boolean;
  data_validation_loops: number;
  enable_html_validation: boolean;
  extraction_model: string;
  fact_validation_model: string;
  html_template_model: string;
  visual_qa_model: string;
  transcript_signal_types: TranscriptSignalType[];
  ppt_signal_types: PptSignalType[];
  annual_report_signal_types: AnnualReportSignalType[];
  market_data_signal_types: MarketDataSignalType[];
  category: PluginCategory;
  max_tokens: number;
  max_transcript_qtrs: number | null;
  max_ppt_qtrs: number | null;
  max_annual_report_years: number | null;
  max_market_data_months: number | null;
  // Incremental base-context behavior
  strip_html: boolean;
  max_base_analyses: number;
  // Historic-mode window overrides — null falls back to the fields above
  historic_max_transcript_qtrs: number | null;
  historic_max_ppt_qtrs: number | null;
  historic_max_annual_report_years: number | null;
  historic_max_market_data_months: number | null;
  // Global base pin — skill-wide, applies to every ticker (replaces the old per-ticker pin)
  pinned_fiscal_year: string | null;
  pinned_quarter: string | null;
  pinned_historic: boolean | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HtmlSkillOutput {
  id: string;
  skill_id: string;
  ticker: string;
  call_id: string;
  fiscal_year: string | null;
  quarter: string | null;
  raw_html: string;
  text_summary: string;
  prompt_v: string;
  extracted_json?: any;
  audit_logs?: {
    fact_validation: any[];
    visual_qa: any[];
  };
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  is_historic: boolean;
  is_pinned_base: boolean;
  config_key: string | null;
  created_at: string;
  updated_at: string;
}

// A named, alternate settings bundle for a skill (e.g. "ppt_only", "transcript_and_ppt").
// Selected explicitly per-run via configKey — never auto-detected. Omitting configKey on a run
// means the skill's own top-level fields are used, exactly as before configs existed.
export interface HtmlSkillConfig {
  id?: string;
  skill_id?: string;
  key: string;
  name: string;
  data_extraction_prompt: string;
  html_template_prompt: string;
  html_template_filename?: string | null;
  use_template_engine: boolean;
  enable_data_validation: boolean;
  data_validation_loops: number;
  enable_html_validation: boolean;
  extraction_model: string | null;
  fact_validation_model: string | null;
  html_template_model: string | null;
  visual_qa_model: string | null;
  transcript_signal_types: TranscriptSignalType[];
  ppt_signal_types: PptSignalType[];
  annual_report_signal_types: AnnualReportSignalType[];
  market_data_signal_types: MarketDataSignalType[];
  max_transcript_qtrs: number | null;
  max_ppt_qtrs: number | null;
  max_annual_report_years: number | null;
  max_market_data_months: number | null;
  historic_max_transcript_qtrs: number | null;
  historic_max_ppt_qtrs: number | null;
  historic_max_annual_report_years: number | null;
  historic_max_market_data_months: number | null;
  // null on these three (only these three) falls back to the skill's own value — execution knobs, not analysis behavior
  // null on these (only these) falls back to the skill's own value — execution knobs, not analysis behavior
  max_tokens: number | null;
  strip_html: boolean | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConfigListResponse {
  configs: HtmlSkillConfig[];
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
  };
}

export interface PromptDryRunResponse {
  slug: string;
  ticker: string;
  systemPrompt: string;
  userPrompt: string;
  historic: boolean;
  signal_count: number;
  raw_signal_count: number;
  base_context_count: number;
  fiscal_year: string | null;
  quarter: string | null;
  config_key?: string | null;
}

// Shared window-size option lists — used by both the skill's own editor (SkillDetail)
// and per-config editors (ConfigsModal), so the two stay in lockstep.
export const QTR_OPTIONS: { label: string; value: number | null }[] = [
  { label: "No limit", value: null },
  { label: "2 qtrs", value: 2 },
  { label: "4 qtrs", value: 4 },
  { label: "8 qtrs", value: 8 },
  { label: "12 qtrs", value: 12 },
  { label: "16 qtrs", value: 16 },
  { label: "20 qtrs", value: 20 },
  { label: "None", value: 0 },
];

export const ANNUAL_OPTIONS: { label: string; value: number | null }[] = [
  { label: "No limit", value: null },
  { label: "1 yr", value: 1 },
  { label: "2 yrs", value: 2 },
  { label: "3 yrs", value: 3 },
  { label: "5 yrs", value: 5 },
  { label: "None", value: 0 },
];

export const MARKET_DATA_MONTHS_OPTIONS: { label: string; value: number | null }[] = [
  { label: "No limit", value: null },
  { label: "6 mo", value: 6 },
  { label: "12 mo", value: 12 },
  { label: "24 mo", value: 24 },
  { label: "36 mo", value: 36 },
  { label: "None", value: 0 },
];

export interface OutputHistoryRow {
  id: string;
  ticker: string;
  call_id: string;
  fiscal_year: string | null;
  quarter: string | null;
  is_historic: boolean;
  config_key: string | null;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  created_at: string;
  updated_at: string;
}

export interface OutputHistoryResponse {
  ticker: string;
  rows: OutputHistoryRow[];
  page: number;
  size: number;
  total: number;
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
  base_context_count?: number;
  base_missing?: boolean;
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
  { label: "DeepseekV4 Flash Lite (High Reasoning)", value: "~deepseek/deepseek-v4-flash-latest:high" },
  { label: "DeepseekV4 Flash Lite (Low Reasoning)", value: "~deepseek/deepseek-v4-flash-latest:low" },
  { label: "DeepseekV4 Flash Lite (No Reasoning)", value: "~deepseek/deepseek-v4-flash-latest" },
  { label: "DeepseekV4 Flash Lite (Floor/Cheapest)", value: "~deepseek/deepseek-v4-flash-latest:floor" },
  { label: "Gemini 2.5 Flash (Vertex AI)", value: "gemini-2.5-flash" },
];
