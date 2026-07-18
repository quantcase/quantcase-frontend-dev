// ── KPI Catalogue — shapes per "KPI definitions — /admin/kpis" (formulas, fallbacks) ──

export type KpiFrequency = "annual" | "quarterly" | "daily";

export interface Kpi {
  id?: string;
  abbr: string;
  full_form: string;
  /** Omit/null = raw leaf, value comes from a Prowess CSV column. Present = computed metric. */
  formula_expression?: string | null;
  frequency?: KpiFrequency | null;
  /** Ordered — tried in turn if this metric resolves null. */
  fallback_abbrs?: string[];
  unit_label?: string;
  kpi_type: string;
  denomination: string;
  description?: string;
  prowess_name?: string;
}

export interface KpisResponse {
  success: boolean;
  data: Kpi[];
}

export interface KpiResponse {
  success: boolean;
  data: Kpi;
}

// ── Formula authoring — validate-formula + preview ────────────────────────────

export interface ReferencedAbbr {
  abbr: string;
  exists: boolean;
  full_form?: string;
}

export interface ValidateFormulaResult {
  valid: boolean;
  error?: string | null;
  referenced_abbrs: ReferencedAbbr[];
}

export interface ValidateFormulaResponse {
  success: boolean;
  data: ValidateFormulaResult;
}

export interface PreviewTraceItem {
  abbr: string;
  value: number | null;
  source: string;
  fallbackAbbr?: string | null;
}

export interface PreviewPeriod {
  frequency: string;
  /** Already formatted (e.g. "FY2025") — render as-is, no date parsing. */
  fiscal_year: string;
  /** Already formatted (e.g. "Q4") — render as-is, no date parsing. */
  quarter: string;
}

export interface PreviewResult {
  abbr: string;
  value: number | null;
  source: string;
  fallbackAbbr?: string | null;
  /**
   * For source "computed", this is the most recent period among the formula's direct inputs —
   * an "as of" period, not a guaranteed single ground-truth date (a multi-term formula's inputs
   * can in principle land on different periods with sparse data).
   */
  period?: PreviewPeriod | null;
  formula_expression?: string | null;
  frequency?: KpiFrequency | null;
  trace: PreviewTraceItem[];
}

export interface PreviewResponse {
  success: boolean;
  data: PreviewResult;
}
