// ── KPI Catalogue — shapes per "KPI definitions — /admin/kpis" (formulas, fallbacks) ──

export type KpiFrequency = "annual" | "quarterly" | "daily";

export interface Kpi {
  id?: string;
  abbr: string;
  full_form: string;
  /** Omit/null = raw leaf, value comes from a Prowess CSV column. Present = computed metric. */
  formula_expression?: string | null;
  /** Legacy/unused — POST/PUT /admin/kpis silently ignores this now. Not editable in the form. */
  frequency?: KpiFrequency | null;
  /** Ordered — tried in turn if this metric resolves null. */
  fallback_abbrs?: string[];
  unit_label?: string;
  kpi_type?: string | null;
  denomination?: string | null;
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
  /** Which financial statement this value was resolved from, e.g. "consolidated"/"standalone". */
  source_type?: string | null;
  fallbackAbbr?: string | null;
}

/** Always one self-describing shape or the other — never a frequency/fields mismatch. */
export type PreviewPeriod =
  | { frequency: "daily"; date: string }
  | { frequency: "annual" | "quarterly"; fiscal_year: string; quarter: string };

export interface PreviewResult {
  abbr: string;
  value: number | null;
  source: string;
  /** Which financial statement this value was resolved from, e.g. "consolidated"/"standalone". */
  source_type?: string | null;
  fallbackAbbr?: string | null;
  period?: PreviewPeriod | null;
  formula_expression?: string | null;
  /** Echoes back the (now-required) `?frequency=` query param actually used to resolve this
   * preview — no longer a fixed property of the KPI itself. */
  frequency?: KpiFrequency | null;
  trace: PreviewTraceItem[];
}

export interface PreviewResponse {
  success: boolean;
  data: PreviewResult;
}
