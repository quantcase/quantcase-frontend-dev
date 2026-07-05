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

export interface MarketCapFilter {
  min: number | null;
  max: number | null;
}

// All present keys are ANDed together — there is no OR between filters.
export interface DynamicFilterConfig {
  nameRange?: NameRangeFilter;
  transcript?: DocFilter;
  ppt?: DocFilter;
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
