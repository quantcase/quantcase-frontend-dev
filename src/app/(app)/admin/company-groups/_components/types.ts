// ── Company Groups — shapes per "Company Groups — Admin Guide" ──────────────

export type FilterType = "manual" | "dynamic";
export type MatchMode = "any" | "all";

export interface ManualFilterConfig {
  tickers: string[];
}

export interface CoverageFilter {
  transcript?: boolean;
  ppt?: boolean;
  annualReport?: boolean;
  match: MatchMode;
}

export interface MarketCapFilter {
  min: number | null;
  max: number | null;
}

export interface DynamicFilterConfig {
  coverage?: CoverageFilter;
  pendingExtraction?: CoverageFilter;
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
