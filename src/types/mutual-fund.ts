export interface MutualFundScheme {
  amfi_code: string;
  name: string;
  isin: string | null;
  plan_type: string;
  option_type: string;
  nav: number | null;
  nav_date: string | null;
  day_change: number | null;
  day_change_pct: number | null;
  morningstar: number | null;
  risk_label: string | null;
  expense_ratio: number | null;
  aum: number | null;
  family_name: string | null;
  family_id: number | null;
  amc_name: string | null;
  amc_slug: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface MutualFundsListResponse {
  success: boolean;
  total: number;
  schemes: MutualFundScheme[];
}

export interface EquityHolding {
  stock_name: string;
  sector: string | null;
  isin: string | null;
  market_value: number;
  cost_value: number | null;
  weight_pct: number;
  quantity: number;
  month_change_qty: number | null;
  month_change_pct: number | null;
}

export interface DebtHolding {
  name: string;
  credit_rating: string | null;
  maturity_date: string | null;
  holding_type: string;
  market_value: number;
  weight_pct: number;
  quantity: number;
  month_change_qty: number | null;
  month_change_pct: number | null;
}

export interface OtherHolding {
  name: string;
  holding_type: string;
  market_value: number;
  weight_pct: number;
  quantity: number;
  month_change_qty: number | null;
  month_change_pct: number | null;
}

export interface HoldingsData {
  month: string;
  total_aum: number;
  equity_pct: number;
  debt_pct: number;
  other_pct: number;
  fetched_at: string;
  equity_holdings: EquityHolding[];
  debt_holdings: DebtHolding[];
  other_holdings: OtherHolding[];
}

export interface MFReturns {
  as_of_date: string | null;
  return_1m: number | null;
  return_3m: number | null;
  return_6m: number | null;
  return_1y: number | null;
  return_3y: number | null;
  return_5y: number | null;
  return_inception: number | null;
  rank_1m: number | null;
  rank_3m: number | null;
  rank_6m: number | null;
  rank_1y: number | null;
  rank_3y: number | null;
  rank_5y: number | null;
  rank_total: number | null;
}

export interface MFRatioValuation {
  pe_ratio: number | null;
  pb_ratio: number | null;
  ps_ratio: number | null;
  dividend_yield: number | null;
}

export interface MFRatioEfficiency {
  roe: number | null;
  roa: number | null;
}

export interface MFRatioReturns {
  sharpe_ratio: number | null;
  jensens_alpha: number | null;
  treynor_ratio: number | null;
  information_ratio: number | null;
}

export interface MFRatioRisk {
  std_deviation: number | null;
  beta: number | null;
  sortino_ratio: number | null;
  r_squared: number | null;
}

export interface MFRatioCategoryAverages {
  pe: number | null;
  sharpe: number | null;
  beta: number | null;
}

export interface MFRatios {
  as_of_date: string | null;
  valuation: MFRatioValuation | null;
  efficiency: MFRatioEfficiency | null;
  returns: MFRatioReturns | null;
  risk: MFRatioRisk | null;
  category_averages: MFRatioCategoryAverages | null;
}

export interface MFRelatedVariant {
  amfi_code: string;
  name: string;
  plan_type: string;
  option_type: string;
  nav: number | null;
  nav_date: string | null;
  expense_ratio: number | null;
  aum: number | null;
}

export interface MFSector {
  sector: string;
  total_weight: number;
  stock_count: number;
  total_market_value: number;
}

export interface MFHoldingsHistoryPoint {
  month: string;
  total_aum: number;
  equity_pct: number;
  debt_pct: number;
  other_pct: number;
  stock_count: number;
}

export interface MFPeople {
  managers: { name: string; since: string | null }[];
  manager_count: number;
  avg_tenure: number | null;
  longest_tenure: number | null;
}

export interface MFPerformance {
  annual_returns: null;
  percentile_rank: null;
  num_in_category: null;
  growth_10k_current: null;
}

export interface MFRiskDetail {
  risk_rating: null;
  capture_ratios: null;
  drawdown: null;
  risk_return_plot: null;
  analyst: null;
}

export interface MFNavHistoryPoint {
  period: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  avg_nav: number | null;
  data_points: number;
}

export interface MFNavHistory {
  scheme_code: string;
  group_by: string;
  data_points: number;
  summary: {
    total_return_pct: number | null;
    cagr_pct: number | null;
    period_years: number | null;
    start_nav: number | null;
    end_nav: number | null;
    min_nav: number | null;
    max_nav: number | null;
    drawdown_from_high_pct: number | null;
  } | null;
  data: MFNavHistoryPoint[];
}

export interface MutualFundDetail {
  // Identity
  amfi_code: string;
  name: string;
  isin: string | null;
  plan_type: string;
  option_type: string;
  category: string | null;
  amc_name: string | null;
  amc_slug: string | null;
  family_name: string | null;
  family_id: number | null;

  // Live scalars
  nav: number | null;
  nav_date: string | null;
  day_change: number | null;
  day_change_pct: number | null;
  expense_ratio: number | null;
  aum: number | null;
  risk_label: string | null;
  morningstar: number | null;
  is_active: boolean | null;

  // Costs
  min_sip: number | null;
  min_lumpsum: number | null;
  min_additional: number | null;
  exit_load: string | null;

  // Fund metadata
  benchmark: string | null;
  launch_date: string | null;

  // Sub-objects
  returns: MFReturns | null;
  ratios: MFRatios | null;
  related_variants: MFRelatedVariant[];
  holdings: HoldingsData | null;
  sectors: MFSector[];
  holdings_history: MFHoldingsHistoryPoint[];
  people: MFPeople | null;
  performance: MFPerformance | null;
  risk_detail: MFRiskDetail | null;
  nav_history: MFNavHistory | null;
}

export interface MutualFundDetailResponse {
  success: boolean;
  data: MutualFundDetail;
}
