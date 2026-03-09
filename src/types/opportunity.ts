// Core type definitions for Opportunity Factor Dashboard

export interface OFactorMetric {
  value?: string;
  label?: string;
  sublabel?: string;
}

// Returns a safe metric with N/A defaults when keys are missing
export function safeMetric(m?: OFactorMetric): Required<OFactorMetric> {
  return {
    value: m?.value ?? 'N/A',
    label: m?.label ?? 'N/A',
    sublabel: m?.sublabel ?? '',
  };
}

// ─── Industry Overview ────────────────────────────────────────────────────────

export interface IndustryOverviewSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };
  metrics?: {
    industry_revenue_ttm?: OFactorMetric;
    industry_cagr?: OFactorMetric;
    market_size?: OFactorMetric;
    current_opm?: OFactorMetric;
    demand_signal?: OFactorMetric;
    supply_constraint?: OFactorMetric;
  };
  text?: {
    demand_supply_dynamics?: {
      demand?: string;
      supply?: string;
      net_impact?: string;
    };
    opm_trend?: {
      metrics?: {
        current_opm?: OFactorMetric;
        five_year_change?: OFactorMetric;
        ten_year_change?: OFactorMetric;
        trend_direction?: OFactorMetric;
      };
      key_observations?: string[];
      margin_drivers?: string[];
      forward_outlook?: string;
    };
    industry_transcripts?: Array<{
      quote?: string;
      company?: string;
      context?: string;
      sector?: string;
    }>;
    takeaway?: string;
  };
}

// ─── Competition ──────────────────────────────────────────────────────────────

export interface PeerRow {
  company: string;
  revenue: number | null;
  revenue_growth: number | null;
  opm: number | null;
  roce: number | null;
  market_share: number | null;
  debt_equity: number | null;
  is_current: boolean;
  is_average: boolean;
}

export interface CompetitionSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };
  metrics?: {
    porters_score?: OFactorMetric;
    pricing_power?: OFactorMetric;
    market_position?: OFactorMetric;
    competitive_intensity?: OFactorMetric;
    entry_barriers?: OFactorMetric;
  };
  text?: {
    pricing_power_dynamics?: {
      current_state?: string;
      shifting_dynamics?: string;
      future_trajectory?: string;
      watch_outs?: string;
    };
    competitive_positioning?: {
      strengths?: string[];
      areas_to_monitor?: string[];
      opportunities?: string[];
    };
    takeaway?: string;
  };
}

// ─── Financial Strength ───────────────────────────────────────────────────────

export interface BalanceSheetSection {
  metrics?: {
    net_debt_ebitda?: OFactorMetric;
    debt_equity?: OFactorMetric;
    interest_coverage?: OFactorMetric;
    current_ratio?: OFactorMetric;
    credit_rating?: OFactorMetric;
  };
  strengths?: string[];
  considerations?: string[];
}

export interface FinancialStrengthSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };
  metrics?: {
    revenue?: OFactorMetric;
    gross_margin?: OFactorMetric;
    ebitda_margin?: OFactorMetric;
    pat?: OFactorMetric;
    free_cash_flow?: OFactorMetric;
    interest_coverage?: OFactorMetric;
    roce?: OFactorMetric;
    roe?: OFactorMetric;
    net_debt_ebitda?: OFactorMetric;
  };
  text?: {
    key_takeaway?: string;
    revenue_growth?: {
      metrics?: {
        revenue?: OFactorMetric;
        five_year_cagr?: OFactorMetric;
        peak_growth?: OFactorMetric;
        growth_quality?: OFactorMetric;
      };
      drivers?: string[];
    };
    profitability?: {
      metrics?: {
        ebitda_margin?: OFactorMetric;
        pat_margin?: OFactorMetric;
        five_year_improvement?: OFactorMetric;
      };
      operating_leverage_drivers?: string[];
      strategic_initiative_drivers?: string[];
    };
    cash_flow?: {
      metrics?: {
        fcf?: OFactorMetric;
        fcf_conversion?: OFactorMetric;
        ocf_ebitda?: OFactorMetric;
        working_capital?: OFactorMetric;
      };
      quality_analysis?: string[];
    };
    balance_sheet?: BalanceSheetSection;
    takeaway?: string;
  };
}

// ─── Customer Traction ────────────────────────────────────────────────────────

export interface CustomerTractionSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };
  metrics?: {
    active_customers?: OFactorMetric;
    net_retention?: OFactorMetric;
    top_10_concentration?: OFactorMetric;
    avg_contract_value?: OFactorMetric;
    churn_rate?: OFactorMetric;
  };
  text?: {
    key_takeaway?: string;
    customer_growth?: {
      metrics?: {
        current_base?: OFactorMetric;
        five_year_growth?: OFactorMetric;
        new_adds?: OFactorMetric;
        churned?: OFactorMetric;
      };
      acquisition_dynamics?: string[];
    };
    retention?: {
      metrics?: {
        net_revenue_retention?: OFactorMetric;
        gross_revenue_retention?: OFactorMetric;
        expansion_revenue?: OFactorMetric;
        annual_churn?: OFactorMetric;
      };
      product_stickiness?: string[];
      expansion_drivers?: string[];
    };
    alt_data_signals?: Array<{
      source?: string;
      insight?: string;
    }>;
    segmentation?: {
      tiers?: Array<{
        tier?: string;
        customer_count?: string;
        revenue_share?: string;
        avg_acv?: string;
        contract_terms?: string;
        nrr?: string;
        churn?: string;
        nrr_label?: string;
        churn_label?: string;
      }>;
      revenue_quality?: string[];
      growth_strategy?: string[];
    };
    takeaway?: string;
  };
}

// ─── Operating Leverage Analysis ─────────────────────────────────────────────

export interface DolDataPoint {
  quarter: string;
  revenue_growth: number;
  ebit_growth: number;
  dol: number;
}

export interface FixedCostLine {
  name: string;
  key: string;
  color: string;
  current_pct: number;
  prior_pct: number;
  change_bps: number;
  note: string;
}

export interface OperatingLeverageSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };
  fixed_cost_equation?: string;
  dol_chart_data?: DolDataPoint[];
  fixed_cost_lines?: FixedCostLine[];
  total_fixed_costs?: {
    current_pct: number;
    prior_pct: number;
    change_bps: number;
    note: string;
  };
  metrics?: {
    revenue_growth_yoy?: OFactorMetric;
    ebit_growth_yoy?: OFactorMetric;
    leverage_spread?: OFactorMetric;
  };
  verdict?: {
    status: string;
    label: string;
    tag: string;
    description: string;
  };
  all_verdicts?: Array<{ status: string; label: string; is_current?: boolean }>;
}

// ─── Free Cash Flow ───────────────────────────────────────────────────────────

export interface FcfConversionDataPoint {
  quarter: string;
  pct: number | null;
  is_floor?: boolean;
}

export interface FcfYieldDataPoint {
  label: string;
  yield_pct: number | null;
  zone: string;
  is_current?: boolean;
}

export interface FreeCashFlowSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };

  // Panel 1 — Conversion Consistency (FCF / PAT %)
  conversion_consistency?: {
    status: string;     // e.g. "Stable"
    status_color?: string; // "green" | "yellow" | "red"
    healthy_threshold_pct: number;
    quarterly_data: FcfConversionDataPoint[];
    range_low: number | null;
    range_high: number | null;
    floor_pct: number | null;
    floor_quarter: string;
    all_above_threshold: boolean;
  };

  // Panel 2 — FCF vs PAT Growth Trajectory
  growth_trajectory?: {
    status: string;           // e.g. "FCF Outpacing"
    status_color?: string;
    fcf_cagr_pct: number | null;
    fcf_start: string;        // e.g. "₹10,840 Cr"
    fcf_end: string;
    pat_cagr_pct: number | null;
    pat_start: string;
    pat_end: string;
    periods: string;          // e.g. "8Q"
    insight_headline: string; // e.g. "FCF growing 2pp faster than PAT…"
    insight_body: string;
  };

  // Panel 3 — OCF → FCF Drag (Capex)
  ocf_to_fcf?: {
    status: string;           // e.g. "Minimal Drag"
    status_color?: string;
    ocf_ttm: string;          // formatted, e.g. "₹45,940 Cr"
    capex: string;            // formatted, e.g. "-₹3,100 Cr"
    fcf_ttm: string;          // formatted, e.g. "₹42,840 Cr"
    ocf_bar_pct: number;      // 0–100 for the bar fill
    capex_bar_pct: number;
    fcf_bar_pct: number;
    capex_revenue_pct: number;    // e.g. 1.8
    capex_ocf_pct: number;        // e.g. 6.7
    drag_description: string;     // e.g. "Very limited"
  };

  // Panel 4 — FCF Yield Then vs Now
  fcf_yield?: {
    status: string;           // e.g. "Watch"
    status_color?: string;    // "green" | "yellow" | "red"
    yield_history: FcfYieldDataPoint[];
    compression_explanation: string;
  };
}

// ─── Working Capital ──────────────────────────────────────────────────────────

export interface WcMetricRow {
  label: string;       // e.g. "DSO (days)"
  key: string;         // e.g. "dso"
  values: (number | null)[];  // one per quarter in quarters[]
}

export interface WcTrendDataPoint {
  quarter: string;
  wc_pct: number;
}

export interface WorkingCapitalSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };
  quarters: string[];             // column headers, e.g. ["Q3'22","Q4'22","Q1'23"]
  rows: WcMetricRow[];            // DSO, DIO, DPO, CCC
  trend_chart?: {
    title: string;                // "WC as % of Revenue"
    data: WcTrendDataPoint[];
    verdict_badge?: string;       // e.g. "Asset Light Scaling"
    verdict_color?: string;       // "green" | "yellow" | "red"
  };
  signals?: Array<{
    label: string;
    color?: string;               // "green" | "yellow" | "red"
  }>;
  insight?: string;               // e.g. "CCC improving 12 days over 4Q…"
}

// ─── Capital Structure & Capex ────────────────────────────────────────────────

export interface CapexIntensityMetric {
  label: string;
  value: string;         // e.g. "1.8%"
  bar_pct: number;       // 0–100 for the fill bar
  max_label?: string;    // e.g. "max 2.4%"
  note?: string;         // e.g. "Declining – less capital needed per rupee of revenue"
  status?: string;       // "green" | "yellow" | "red"
}

export interface CapitalStructureSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };

  // Panel 1 — Balance Sheet Position
  balance_sheet?: {
    status: string;           // e.g. "Net Cash Company"
    status_color?: string;
    cash_investments: string; // e.g. "₹62,000 Cr"
    cash_bar_pct: number;
    gross_debt: string;       // e.g. "₹4,000 Cr"
    debt_bar_pct: number;
    net_cash: string;         // e.g. "₹58,000 Cr"
    timeline: Array<{ label: string; value: string; is_current?: boolean }>;
    insight: string;
  };

  // Panel 2 — Debt Trajectory
  debt_trajectory?: {
    status: string;           // e.g. "Deleveraging"
    status_color?: string;
    bars: Array<{ label: string; value: number; color?: string; is_current?: boolean }>;
    peak_debt: string;
    peak_label?: string;
    current_debt: string;
    current_label?: string;
    reduction_pct: string;    // e.g. "–57%"
    reduction_label?: string;
    insight: string;
  };

  // Panel 3 — Equity & Profit Allocation
  equity_allocation?: {
    status: string;           // e.g. "Compounding"
    status_color?: string;
    rows: Array<{
      label: string;
      kept_pct: number | null;
      paid_pct: number | null;
      is_current?: boolean;
    }>;
    total_equity: string;     // e.g. "₹1.12L Cr"
    total_equity_sublabel?: string;
    roe: string;              // e.g. "47.8%"
    roe_sublabel?: string;
    payout_trend: string;     // e.g. "Rising"
    payout_trend_direction?: "up" | "down" | "flat";
    payout_sublabel?: string;
    insight: string;
  };

  // Panel 4 — Capex Intensity
  capex_intensity?: {
    status: string;           // e.g. "Asset Light"
    status_color?: string;
    metrics: CapexIntensityMetric[];
    note?: string;            // explanatory note box
  };
}

// ─── Final Scoring ────────────────────────────────────────────────────────────

export interface FinalScoringSection {
  meta?: { section_id?: string; title?: string; subtitle?: string };
  score: number;             // e.g. 6
  max_score: number;         // e.g. 8
  status: string;            // e.g. "HIGH QUALITY"
  status_color?: string;     // "green" | "yellow" | "red"
  title: string;             // e.g. "Numbers support the thesis"
  body: string;              // paragraph text
}

// ─── Root Response ────────────────────────────────────────────────────────────

export interface FinancialStrengthSectionFull extends FinancialStrengthSection {
  operating_leverage?: OperatingLeverageSection;
  free_cash_flow?: FreeCashFlowSection;
  working_capital?: WorkingCapitalSection;
  capital_structure?: CapitalStructureSection;
  final_scoring?: FinalScoringSection;
}

export interface OFactorResponse {
  industry_overview?: IndustryOverviewSection;
  competition?: CompetitionSection;
  financial_strength?: FinancialStrengthSectionFull;
  customer_traction?: CustomerTractionSection;
}

export interface OFactorResponseWrapper {
  success: boolean;
  data: OFactorResponse;
}

// ─── Industry KPI Timeseries (from peer-data endpoint) ────────────────────────

export interface IndustryKpiDataPoint {
  period: string;
  value: number;
}

export interface IndustryKpiEntry {
  kpi_abbr: string;
  quarters_present: number;
  data: IndustryKpiDataPoint[];
}

export interface IndustryKpiTimeseries {
  meta?: { section_id?: string; title?: string };
  timeseries: IndustryKpiEntry[];
}
