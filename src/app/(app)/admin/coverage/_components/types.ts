// ── L1 multi-dispatch — shapes per "Pipeline Dispatch — L1 Multi — Admin Guide" ──

export interface L1DispatchOptions {
  tickers?: string[];
  all?: boolean;
  groupSlug?: string;
  startFrom?: string;
  limit?: number;
  latest?: number;
  force?: boolean;
  arOnly?: boolean;
  noAr?: boolean;
}

export interface L1CompanyGroupOption {
  slug: string;
  name: string;
  filter_type: "manual" | "dynamic";
}

export interface L1OptionsResponse {
  defaultTickers: string[];
  companies: string[];
  companyGroups: L1CompanyGroupOption[];
}

export interface L1PreviewCallItem {
  id: string;
  fiscal_year: number;
  quarter: string;
  hasTranscript: boolean;
  hasPpt: boolean;
}

export interface L1PreviewAnnualItem {
  id: string;
  fiscal_year: number;
  hasUrl: boolean;
}

export interface L1PreviewTicker {
  symbol: string;
  calls: { shown: number; total: number; items: L1PreviewCallItem[] };
  annualReports: { shown: number; total: number; items: L1PreviewAnnualItem[] };
}

export interface L1PreviewResponse {
  tickerCount: number;
  tickers: string[];
  perTicker: L1PreviewTicker[];
}

export interface L1RunTriggerResponse {
  success: boolean;
  message: string;
  run_id: string;
}

export interface L1RunTickerSummary {
  symbol: string;
  queued: number;
  skipped: number;
  noSource: number;
  failed: number;
}

export interface L1RunMetadata {
  queued: number;
  skipped: number;
  noSource: number;
  failed: number;
  tickerCount: number;
  perTicker: L1RunTickerSummary[];
}

export type L1RunStatus = "running" | "completed" | "failed";

export interface L1Run {
  id: string;
  status: L1RunStatus;
  started_at?: string | null;
  ended_at: string | null;
  records_processed: number | null;
  error: string | null;
  metadata: L1RunMetadata | null;
}

export interface L1RunsResponse {
  count: number;
  runs: L1Run[];
}
