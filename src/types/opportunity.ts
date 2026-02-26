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
        current_opm_fy24?: OFactorMetric;
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
    revenue_fy24?: OFactorMetric;
    ebitda_margin?: OFactorMetric;
    free_cash_flow?: OFactorMetric;
    net_debt_ebitda?: OFactorMetric;
    roce?: OFactorMetric;
  };
  text?: {
    key_takeaway?: string;
    revenue_growth?: {
      metrics?: {
        fy24_revenue?: OFactorMetric;
        five_year_cagr?: OFactorMetric;
        peak_growth?: OFactorMetric;
        growth_quality?: OFactorMetric;
      };
      drivers?: string[];
    };
    profitability?: {
      metrics?: {
        ebitda_margin_fy24?: OFactorMetric;
        pat_margin_fy24?: OFactorMetric;
        five_year_improvement?: OFactorMetric;
      };
      operating_leverage_drivers?: string[];
      strategic_initiative_drivers?: string[];
    };
    cash_flow?: {
      metrics?: {
        fcf_fy24?: OFactorMetric;
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
        new_adds_fy24?: OFactorMetric;
        churned_fy24?: OFactorMetric;
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

// ─── Root Response ────────────────────────────────────────────────────────────

export interface OFactorResponse {
  industry_overview?: IndustryOverviewSection;
  competition?: CompetitionSection;
  financial_strength?: FinancialStrengthSection;
  customer_traction?: CustomerTractionSection;
}

export interface OFactorResponseWrapper {
  success: boolean;
  data: OFactorResponse;
}
