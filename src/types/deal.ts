// Core type definitions for Deal Factor Dashboard

// ─── Scenario Framework ───────────────────────────────────────────────────────

export interface DScenarioCase {
  points?: string[];
}

export interface ScenarioFrameworkSection {
  meta?: { section_id?: string; title?: string };
  bear?: DScenarioCase;
  base?: DScenarioCase;
  bull?: DScenarioCase;
}

// ─── Target Price Matrix ──────────────────────────────────────────────────────

export interface DPriceScenario {
  eps_cagr?: string;
  fy_eps?: string;
  exit_pe?: string;
  pe_rationale?: string;
  target_range?: string;
  from_cmp?: string;
  cagr?: string;
  probability?: number;
  tags?: string[];
}

export interface TargetPriceMatrixSection {
  meta?: { section_id?: string; title?: string };
  holding_period?: string;
  current_price?: string;
  bear?: DPriceScenario;
  base?: DPriceScenario;
  bull?: DPriceScenario;
}

// ─── Risk-Reward Summary ──────────────────────────────────────────────────────

export interface RiskRewardMetric {
  label?: string;
  value?: string;
  description?: string;
  subtitle?: string;
}

export interface RiskRewardSummarySection {
  meta?: { section_id?: string; title?: string };
  probability_weighted_return?: RiskRewardMetric;
  risk_reward_ratio?: RiskRewardMetric;
  downside_protection?: RiskRewardMetric;
}

// ─── EPS Engine ───────────────────────────────────────────────────────────────

export interface EpsScenario {
  industry_cagr?: { value: string; note: string };
  revenue_growth?: { value: string; note: string; mgmt_guidance: string; mgmt_result: string };
  margin_trajectory?: { value: string; note: string; mgmt_guidance: string; mgmt_result: string };
  execution_alpha?: { rating: string; value: string; note: string };
  expected_eps_cagr?: { value: string; subtitle: string };
}

export interface EpsEngineSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };
  sub_section_title?: string;
  sub_section_subtitle?: string;
  scenarios?: { bear?: EpsScenario; base?: EpsScenario; bull?: EpsScenario };
  insight?: string;
  top_upside_lever?: string;
  primary_risk_factor?: string;
}

// ─── Historical Performance ───────────────────────────────────────────────────

export interface HistoricalPerformanceSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };
  company_growth?: { value: string; label: string };
  industry_growth?: { value: string; label: string };
  company_name?: string;
  industry_name?: string;
  chart_data?: Array<{ year: string; company: number; industry: number }>;
  stats?: Array<{ value: string; label: string; color: string }>;
}

// ─── Quality of Earnings ──────────────────────────────────────────────────────

export interface QualityMetric {
  label: string;
  value: string;
  change: string;
  change_color: string;
}

export interface QualityOfEarningsSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };
  metrics?: QualityMetric[];
  chart_data?: Array<{ year: string; roe: number; roic: number; market_share: number }>;
  bottom_line?: string;
}

// ─── Valuation vs Peers ───────────────────────────────────────────────────────

export interface ValuationRichSegment {
  text: string;
  bold?: boolean;
  color?: "emerald" | "blue" | "red";
}

export interface ValuationVsPeersSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };
  current_position?: Array<{ label: string; value: string; detail: string; color: string }>;
  re_rating_view?: {
    badge: string;
    title: string;
    description: ValuationRichSegment[];
  };
  expansion_drivers?: Array<{ text: string; detail: string }>;
  contraction_risks?: Array<{ text: string; detail: string }>;
  scenario_multiples?: Array<{ label: string; value: string; change: string; color: string }>;
}

// ─── Detailed Analysis (wrapper) ──────────────────────────────────────────────

export interface DetailedAnalysisSection {
  eps_engine?: EpsEngineSection;
  historical_performance?: HistoricalPerformanceSection;
  quality_of_earnings?: QualityOfEarningsSection;
  valuation_vs_peers?: ValuationVsPeersSection;
}

// ─── Overview ─────────────────────────────────────────────────────────────────

export interface DealVerdict {
  title?: string;
  description?: string;
}

export interface EpsEngineCard {
  score?: number;
  drivers?: string[];
}

export interface ScenarioSummaryCase {
  label?: string;
  subtext?: string;
  headline?: string;
}

export interface DealFactorScore {
  level?: string;
  overall?: number;
  eps_engine?: number;
  valuation_rerating?: number;
}

export interface OverviewSection {
  deal_verdict?: DealVerdict;
  key_takeaway?: string[];
  eps_engine_card?: EpsEngineCard;
  valuation_rerating_card?: EpsEngineCard;
  scenario_summary?: {
    bear?: ScenarioSummaryCase;
    base?: ScenarioSummaryCase;
    bull?: ScenarioSummaryCase;
  };
  deal_factor_score?: DealFactorScore;
}

// ─── Deal Intelligence ────────────────────────────────────────────────────────

export interface DealIntelligenceSignal {
  key: string;
  label: string;
  score: number;
  max_score: number;
  sentiment: "positive" | "negative" | "neutral";
  details: string[];
}

export interface DealScore {
  label: string;
  total: number;
  max_score: number;
  signals_breakdown: DealIntelligenceSignal[];
}

export interface DealRecommendedStrategy {
  action: string;
  thesis?: string | null;
  timing?: string | null;
  segment?: string | null;
  rationale?: string | null;
}

export interface DealWatchout {
  title: string;
  description: string;
}

export interface DealIntelligence {
  deal_score: DealScore;
  key_takeaways: string[];
  recommended_strategy: DealRecommendedStrategy;
  watchouts: DealWatchout[];
}

// ─── Root Response ────────────────────────────────────────────────────────────

export interface DFactorResponse {
  scenario_framework?: ScenarioFrameworkSection;
  target_price_matrix?: TargetPriceMatrixSection;
  risk_reward_summary?: RiskRewardSummarySection;
  overview?: OverviewSection;
  detailed_analysis?: DetailedAnalysisSection;
  deal_intelligence?: DealIntelligence;
}

export interface DFactorTotalScore {
  total_score: number;
  max_score: number;
}

export interface DFactorResponseWrapper {
  success: boolean;
  data: DFactorResponse;
  total_score?: DFactorTotalScore;
}
