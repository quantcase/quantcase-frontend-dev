// ── Company Groups — shapes per "Company Groups — Admin Guide" ──────────────

export type FilterType = "manual" | "dynamic";

export interface ManualFilterConfig {
  tickers: string[];
}

export interface NameRangeFilter {
  from: string;
  to: string;
}

export type DocStatus = "present" | "pending" | "extracted";

export interface DocFilter {
  status: DocStatus;
  /** Restricts the check to each company's own N most recent periods. Omit for all-time. */
  lastN?: number;
}

// Transcript / PPT filters: look at the N most recent known quarters (a missing quarter still
// counts as one of the N slots), and require at least minCount of them to satisfy `status`.
// Omitting minCount defaults to `window` itself (all of them — "N consecutive"). Omitting both
// defaults to 1 ("ever, at least once").
export interface WindowedRule {
  window?: number;
  minCount?: number;
}

export interface WindowedDocFilter {
  status: DocStatus;
  window?: number;
  minCount?: number;
  /**
   * Optional compound form: multiple {window, minCount} clauses, ANDed together, for conditions a
   * single window/minCount pair can't express (e.g. "4 of last 8" AND "6 ever"). No UI for this yet
   * — the flat window/minCount fields above are shorthand for a single-clause rules array under the
   * hood. Set directly via PUT /:slug in the meantime if an admin needs a compound rule.
   */
  rules?: WindowedRule[];
}

export interface MarketCapFilter {
  min: number | null;
  max: number | null;
}

// All present keys are ANDed together — there is no OR between filters.
export interface DynamicFilterConfig {
  nameRange?: NameRangeFilter;
  transcript?: WindowedDocFilter;
  ppt?: WindowedDocFilter;
  annualReport?: DocFilter;
  marketCap?: MarketCapFilter;
  industries?: string[];
}

export type FilterConfig = ManualFilterConfig | DynamicFilterConfig;

export interface CompanyGroup {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  filter_type: FilterType;
  filter_config: FilterConfig;
  /** L2 skill config this group resolves to automatically (e.g. "t1"), or null if untagged. */
  config_key?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResolveResult {
  tickers: string[];
  count: number;
}

export function isManualConfig(g: Pick<CompanyGroup, "filter_type" | "filter_config">): g is CompanyGroup & { filter_config: ManualFilterConfig } {
  return g.filter_type === "manual";
}
