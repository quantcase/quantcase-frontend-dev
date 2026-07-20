// ── Screener display configuration — /admin/screen-configs (sections + items) ──
// Controls which metrics show in which screener page section, in what order, with what
// formatting. Historically independent of /admin/kpi-groups (the KPI catalogue's own display
// hierarchy) — but the 6 financials sections (financials.pnl.*, .balance-sheet.*, .cashflow.*)
// now source their row list from a KpiGroup branch via ScreenConfig.kpi_group_slug instead of
// ScreenConfigItem. Charts and Peers sections are unaffected and stay ScreenConfigItem-driven.

export type SeriesType = "line" | "bar";

/** The 12 sections wired into the live screener today. Free-text key is still allowed. */
export const KNOWN_SECTION_KEYS = [
  "financials.pnl.annual",
  "financials.pnl.quarterly",
  "financials.balance-sheet.annual",
  "financials.balance-sheet.quarterly",
  "financials.cashflow.annual",
  "financials.cashflow.quarterly",
  "charts.pe-ratio",
  "charts.sales-margin",
  "charts.ev-ebitda",
  "charts.price-to-book",
  "charts.mcap-sales",
  "peers.columns",
] as const;

export interface ScreenConfigItem {
  id: string;
  kpi_abbr: string;
  /** null/omitted = use the KPI's own display name. */
  label?: string | null;
  display_order: number;
  highlight?: boolean;
  /** Marks a row as having a drill-down (used on quarterly Revenue/Expenses today). */
  expandable?: boolean;
  /** Overrides the section's default decimal_places for just this metric. */
  decimal_places?: number | null;
  /** Only show this row for companies in a given group. null = show for everyone. */
  company_group_slug?: string | null;
  /** Charts only — which series type this metric renders as. */
  series_type?: SeriesType | null;
}

export interface ScreenConfig {
  /** Stable ID the backend looks up directly (e.g. "financials.pnl.annual") — immutable once created. */
  key: string;
  label: string;
  /** Free-text note of which API endpoint this powers — documentation only. */
  endpoint?: string | null;
  /** How many years/quarters/points to show, trailing. null = show everything available. */
  periods_shown?: number | null;
  /** Default rounding for every metric in this section, unless a specific item overrides it. */
  decimal_places?: number | null;
  /** Present (possibly empty) on GET /:key; absent on the list response. */
  items?: ScreenConfigItem[];
  /**
   * Slug of a KpiGroup branch (container node, not a leaf) whose children ARE this section's
   * row list. When set, `items` is ignored for display — rows are managed via /admin/kpi-groups
   * CRUD on that branch instead. null/omitted = this section is still ScreenConfigItem-driven.
   */
  kpi_group_slug?: string | null;
}

export interface ScreenConfigsResponse {
  success: boolean;
  data: ScreenConfig[];
}

export interface ScreenConfigResponse {
  success: boolean;
  data: ScreenConfig;
}

export interface ScreenConfigItemResponse {
  success: boolean;
  data: ScreenConfigItem;
}

export interface CompanyGroupOption {
  slug: string;
  name: string;
}

export const SERIES_TYPE_OPTIONS: { value: SeriesType; label: string }[] = [
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
];
