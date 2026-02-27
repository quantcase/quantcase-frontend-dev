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

// ─── Root Response ────────────────────────────────────────────────────────────

export interface DFactorResponse {
  scenario_framework?: ScenarioFrameworkSection;
  target_price_matrix?: TargetPriceMatrixSection;
  risk_reward_summary?: RiskRewardSummarySection;
}

export interface DFactorResponseWrapper {
  success: boolean;
  data: DFactorResponse;
}
