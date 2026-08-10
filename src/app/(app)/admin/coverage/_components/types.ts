// ── L1 multi-dispatch — shapes per "Pipeline Dispatch — L1 Multi — Admin Guide" ──

// Shared "which companies?" source picker — common to L1/L2/L3, each tab keeps its own selection
export type TickerSource = "default" | "manual" | "group" | "all";

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
  fiscal_year: string;
  quarter: string;
  hasTranscript: boolean;
  hasPpt: boolean;
  hasTranscriptSignal: boolean;
  hasPptSignal: boolean;
}

export interface L1PreviewAnnualItem {
  id: string;
  fiscal_year: string;
  hasUrl: boolean;
  hasSignal: boolean;
}

export interface L1PreviewTicker {
  symbol: string;
  calls: { shown: number; total: number; items: L1PreviewCallItem[] };
  annualReports: { shown: number; total: number; items: L1PreviewAnnualItem[] };
}

export interface L1PreviewResponse {
  /** Total across ALL pages — not tickers.length (that's just this page). */
  tickerCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  tickers: string[];
  perTicker: L1PreviewTicker[];
}

export interface L1RunTriggerResponse {
  success: boolean;
  message: string;
  run_id: string;
}

export interface L1RunTickerError {
  source: "transcript" | "ppt" | "annual_report";
  /** Present for transcript/ppt errors. */
  callId?: string;
  /** Present for annual_report errors instead of callId. */
  reportId?: string;
  fiscal_year: string;
  /** Absent for annual_report errors. */
  quarter?: string;
  error: string;
}

export interface L1RunTickerSummary {
  symbol: string;
  queued: number;
  skipped: number;
  noSource: number;
  failed: number;
  /** Omitted entirely when this ticker had no failures — check `.length`, don't assume the key exists. */
  errors?: L1RunTickerError[];
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

// ── L2 multi-dispatch — shapes per "Company Group ↔ Config tagging & L2 batch runs" ──

export interface L2Skill {
  slug: string;
  name: string;
}

export interface L2ConfigKeyOption {
  key: string;
  name: string;
}

export interface L2CompanyGroupOption extends L1CompanyGroupOption {
  config_key: string | null;
}

export interface L2OptionsResponse {
  skills: L2Skill[];
  companies: string[];
  companyGroups: L2CompanyGroupOption[];
  configKeys: L2ConfigKeyOption[];
}

export interface L2DispatchOptions {
  slug: string;
  groupSlug?: string;
  tickers?: string[];
  all?: boolean;
  historic?: boolean;
  force?: boolean;
}

// Preview is now a fast signal-availability report (one query for the whole batch) rather than
// a per-ticker prompt build — no more ok/error/noSource per ticker, just counts (0 if nothing exists).
export interface L2PeriodCount {
  fiscal_year: string;
  /** Present for transcript/ppt periods; absent for annual_report periods. */
  quarter?: string;
  count: number;
}

export interface L2SourceCoverage {
  total: number;
  periods: L2PeriodCount[];
}

export interface L2PreviewTickerRow {
  ticker: string;
  transcript: L2SourceCoverage;
  ppt: L2SourceCoverage;
  annual_report: L2SourceCoverage;
}

export interface L2PreviewResponse {
  slug: string;
  /** Total across ALL pages — not perTicker.length (that's just this page). */
  tickerCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  perTicker: L2PreviewTickerRow[];
}

export interface L2RunTriggerResponse {
  success: boolean;
  message: string;
  run_id: string;
}

export interface L2RunTickerSummary {
  ticker: string;
  status: string;
  callId?: string;
  jobId?: string;
}

export interface L2RunMetadata {
  queued: number;
  noSource: number;
  failed: number;
  tickerCount: number;
  perTicker: L2RunTickerSummary[];
}

export interface L2Run {
  job_id: string;
  status: L1RunStatus;
  started_at?: string | null;
  ended_at: string | null;
  records_processed: number | null;
  error: string | null;
  metadata: L2RunMetadata | null;
}

export interface L2RunsResponse {
  count: number;
  runs: L2Run[];
}

// ── L3/L4 multi-dispatch — shapes per "L3 multi-dispatch — Admin Guide" ──────
// layerId lets the same endpoints target either lens (l3: management/opportunity/deal)
// or the top-level summary (l4) — "L3" here is just the pipeline-numbering slot.

export type L3LayerId = "l3" | "l4";

export interface L3OptionsResponse {
  defaultTickers: string[];
  companies: string[];
  companyGroups: L1CompanyGroupOption[];
  layerTypes: Record<L3LayerId, string[]>;
}

export interface L3DispatchOptions {
  layerId?: L3LayerId;
  types?: string[];
  groupSlug?: string;
  tickers?: string[];
  all?: boolean;
  startFrom?: string;
  force?: boolean;
  page?: number;
  pageSize?: number;
}

export interface L3TypeAvailability {
  type: string;
  available: string[];
  missing: string[];
  ready: boolean;
}

export interface L3PreviewTickerRow {
  ticker: string;
  types: L3TypeAvailability[];
}

export interface L3PreviewResponse {
  layerId: L3LayerId;
  types: string[];
  /** Total across ALL pages — not perTicker.length (that's just this page). */
  tickerCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  perTicker: L3PreviewTickerRow[];
}

export interface L3RunTriggerResponse {
  success: boolean;
  message: string;
  run_id: string;
}

export interface L3RunTickerJob {
  type: string;
  jobId: string;
}

export interface L3RunTickerSummary {
  ticker: string;
  status: string;
  /** Present when status is "queued". */
  jobs?: L3RunTickerJob[];
  /** Present when status is "failed". */
  error?: string;
}

export interface L3RunMetadata {
  queued: number;
  failed: number;
  tickerCount: number;
  layerId: L3LayerId;
  types: string[];
  perTicker: L3RunTickerSummary[];
}

export interface L3Run {
  id: string;
  status: "running" | "completed" | "failed";
  started_at?: string | null;
  ended_at: string | null;
  records_processed: number | null;
  error: string | null;
  metadata: L3RunMetadata | null;
}

export interface L3RunsResponse {
  count: number;
  runs: L3Run[];
}

// ── BSE Discovery — shapes per "BSE Discovery — Admin Flow" ──────────────────

export interface BseDiscoveryRunTriggerResponse {
  success: boolean;
  run_id: string;
  slug: string;
  job_type: string;
}

export interface BseDiscoveryRunMetadata {
  companies: number;
  total_urls: number;
}

export interface BseDiscoveryRun {
  id: string;
  status: "running" | "completed" | "failed";
  started_at?: string | null;
  ended_at: string | null;
  records_processed: number | null;
  error: string | null;
  metadata: BseDiscoveryRunMetadata | null;
}

export interface BseDiscoveryRunsResponse {
  count: number;
  runs: BseDiscoveryRun[];
}

export type BseDocType = "transcript" | "ppt" | "annual_report";
export type BseUrlSource = "bse_original" | "resolved";

/**
 * PDF-resolution status. `resolved` = PDF downloaded & parsed; `pending` = 404/timeout (BSE CDN
 * propagation delay, will resolve on a later run); `non_pdf` = downloaded but not a PDF. Null for
 * any URL discovered before metadata capture existed — populates as runs re-encounter it.
 */
export type BseUrlStatus = "resolved" | "pending" | "non_pdf";

export interface BseSuggested {
  company: string | null;
  fiscal_year: string;
  /** Always null for annual_report rows. */
  quarter: string | null;
}

export interface BseDiscoveredUrl {
  scrip_cd: number;
  company_name: string;
  scrape_date: string;
  doc_type: BseDocType;
  url: string;
  source: BseUrlSource;
  suggested: BseSuggested;
  /** This exact URL is already saved in earnings_calls/annual_reports. */
  alreadyApproved: boolean;
  /** PDF page count. Null if not yet resolved (see `status`). */
  page_count: number | null;
  /** PDF file size in bytes. Null if unknown. */
  file_size: number | null;
  /** PDF-resolution status. Null on rows discovered before metadata capture existed. */
  status: BseUrlStatus | null;
  /** Soft-deleted — hidden from the list unless showDismissed is on. */
  dismissed: boolean;
  dismissed_reason: string | null;
  dismissed_at: string | null;
  /** What's currently stored for (company, fiscal_year, quarter), if anything. Null if nothing's there yet or suggested.company couldn't be matched. */
  existingUrl: string | null;
  /** Whether approving this candidate would replace existingUrl. */
  willOverwrite: boolean;
}

/** Query filters for GET /admin/bse-discovery/urls. Numeric bounds exclude rows with unknown metadata. */
export interface BseDiscoveryUrlFilters {
  days: number;
  hideApproved: boolean;
  showDismissed: boolean;
  minPages?: number;
  maxPages?: number;
  /** Bytes. */
  minSize?: number;
  maxSize?: number;
  status?: BseUrlStatus;
}

export interface BseDiscoveryUrlsResponse {
  count: number;
  urls: BseDiscoveredUrl[];
}

export interface BseDismissResponse {
  success: true;
  dismissed: {
    url: string;
    reason: string | null;
    dismissed_at: string;
  };
}

export interface BseUndismissResponse {
  success: true;
}

/** GET /admin/bse-discovery/preview?url=<candidateUrl>&page=<n> — fetched on-demand per row. */
export interface BsePreviewResponse {
  url: string;
  page: number;
  totalPages: number;
  text: string;
}

export interface BseDiscoveryApproveBody {
  docType: BseDocType;
  url: string;
  company: string;
  fiscal_year: string;
  /** Required for transcript/ppt, omitted for annual_report. */
  quarter?: string;
  call_date?: string;
}

export interface BseDiscoveryApproveResponse {
  success: true;
  record: Record<string, unknown>;
}

// ── Manual PDF upload (no crawlable URL) ─────────────────────────────────────

export interface DocumentUploadResponse {
  success: true;
  url: string;
  record: Record<string, unknown>;
}

// ── KPI Dedup — Phase 6 (per-industry cap) ──────────────────────────────────

export interface KpiPhase6Industry {
  industry: string;
  companyCount: number;
  /** Current total KPIs tagged to this industry. */
  kpiCount: number;
  cap: number;
  /** Over cap in this industry alone — informational only, not what actually gets deleted. */
  overCapCount: number;
  /** What will actually be deleted, after excluding KPIs protected by other industries. */
  actualDeleteCount: number;
  /** kpiCount - actualDeleteCount — the "after" number for this industry. */
  remainingCount: number;
}

export interface KpiPhase6Result {
  dryRun: boolean;
  industriesProcessed: number;
  totalOverCapSlots: number;
  totalKpisBefore: number;
  deletableCount: number;
  remainingCount: number;
  /** First 50 deletable KPI abbrs, for spot-checking. */
  deletableSample: string[];
  industries: KpiPhase6Industry[];
  /** Only present on the /run response, once deletes actually happened. */
  deletedCount?: number;
}

// ── Truncated chunk jobs — split & retry ─────────────────────────────────────

export type PipelineJobQueue = "summarization_v2" | "summarization_v2_ppt" | "summarization_v2_annual_report";

export interface TruncatedJob {
  queue: PipelineJobQueue;
  id: string;
  docId: string;
  url: string;
  pageStart: number;
  pageEnd: number;
  pages: string;
  lineageId: string;
  chunkIndex: number;
  totalChunks: number;
  attemptsMade: number;
  failedReason: string;
  finishedOn: string;
}

export interface TruncatedJobsResponse {
  count: number;
  jobs: TruncatedJob[];
}

export interface SplitRetryNewJob {
  id: string;
  pages: string;
  chunkIndex: string;
}

export interface SplitRetryResult {
  queue: PipelineJobQueue;
  originalJobId: string;
  originalRange: string;
  /** Absent when success is false. */
  newJobs?: SplitRetryNewJob[];
  success: boolean;
  /** Set when success is false — e.g. already at the 1-page floor, or the job raced out from under the request. */
  error?: string;
}

export interface SplitRetryResponse {
  processed: number;
  succeeded: number;
  failed: number;
  results: SplitRetryResult[];
}

// ── Pipeline signal browser ──────────────────────────────────────────────────

export type SignalSourceDocType = "transcript" | "ppt" | "annual_report";

export interface PipelineSignal {
  id: string;
  callId: string;
  ticker: string;
  company: string;
  fiscalYear: string;
  quarter: string;
  sourceDocType: SignalSourceDocType;
  signalType: string;
  lineageId: string;
  sourceHash: string;
  isInvalidated: boolean;
  createdAt: string;
  extractorModel: string;
  promptV: string;
}

export interface PipelineSignalsResponse {
  total: number;
  size: number;
  signals: PipelineSignal[];
}

// ── Prowess ingestion — CSV upload ───────────────────────────────────────────
// KPI catalogue types (Kpi, KpisResponse, KpiCreateResponse) now live under
// admin/kpis/_components/types.ts — see /admin/kpis.

export type ProwessMode = "annual" | "quarterly" | "daily" | "index";

export interface ProwessInsertStatsFinancial {
  attempted: number;
  inserted: number;
  skipped: number;
}

export interface ProwessInsertStatsMarket {
  attempted: number;
  inserted: number;
}

export interface ProwessFinancialReportBase {
  table: "prowess_values_new";
  inserted: boolean;
  companiesInCsv: number;
  columnsInCsv: number;
  /** CSV column name → matched KPI abbr. */
  dynamicIndicatorsMatched: Record<string, string>;
  /**
   * CSV columns that didn't match any known KPI — create it (§ KPI Catalogue) and re-preview.
   * success:true no longer implies every column matched — this (and rowsByKpi) is the real
   * signal of ingestion quality, not the success flag.
   */
  unmatchedColumns: string[];
  totalRows: number;
  rowsByKpi: Record<string, number>;
  /** Only present once /run has actually inserted. */
  insertStats?: ProwessInsertStatsFinancial;
}

export interface ProwessAnnualReport extends ProwessFinancialReportBase {
  mode: "annual";
  /** One file = one section now — "C" (Consolidated) or "S" (Standalone). */
  sourceType: "C" | "S";
  /** Fiscal years spanned by this file, e.g. ["FY2015", ..., "FY2026"]. */
  fiscalYears: string[];
}

export interface ProwessQuarterlyReport extends ProwessFinancialReportBase {
  mode: "quarterly";
  /** Not always present in the backend response — guard with `?? {}` before reading. */
  rowsBySourceType?: Record<string, number>;
}

export type ProwessFinancialReport = ProwessAnnualReport | ProwessQuarterlyReport;

export interface ProwessMarketReport {
  mode: "daily" | "index";
  table: "nse_equity_new";
  inserted: boolean;
  type: "ohlcv";
  recordsParsed: number;
  /** Companies/indices the parser couldn't map — review, not necessarily an error. */
  skippedName: number;
  /** Only present once /run has actually inserted. */
  insertStats?: ProwessInsertStatsMarket;
}

export type ProwessIngestReport = ProwessFinancialReport | ProwessMarketReport;

export interface ProwessIngestResponse {
  success: true;
  data: ProwessIngestReport;
}

// ── Prowess Coverage — raw DB availability report (no calculations) ─────────
// GET /admin/prowess/coverage/options + POST /admin/prowess/coverage/preview.
// Reports only what's physically stored in prowess_values_new/nse_equity_new —
// a false/null here can still be true elsewhere in the app once fallbacks or
// computed formulas are applied on top of the raw value.

export interface ProwessCoverageKpiSet {
  annual: string[];
  quarterly: string[];
}

export interface ProwessCoverageDefaultKpiSets {
  pnl: ProwessCoverageKpiSet;
  balanceSheet: ProwessCoverageKpiSet;
  cashflow: ProwessCoverageKpiSet;
}

export interface ProwessCoverageOptionsResponse {
  defaultTickers: string[];
  companies: string[];
  companyGroups: L1CompanyGroupOption[];
  defaultKpiSets: ProwessCoverageDefaultKpiSets;
}

export interface ProwessCoverageRequest {
  groupSlug?: string;
  tickers?: string[];
  all?: boolean;
  startFrom?: string;
  /** Overrides the 3 default sets entirely — checked as one "custom" group against both annual & quarterly. */
  kpis?: string[];
  page?: number;
  pageSize?: number;
}

export interface ProwessCoverageNse {
  rowCount: number;
  firstDate: string | null;
  lastDate: string | null;
}

/** Period label (annual: "FY2021"; quarterly: "FY2025-Q4") → present in DB for this KPI/ticker. */
export type ProwessCoverageHistory = Record<string, boolean>;

/** KPI abbr → full per-period presence history. */
export type ProwessCoverageKpiHistory = Record<string, ProwessCoverageHistory>;

export interface ProwessCoverageGroup {
  annual: ProwessCoverageKpiHistory;
  quarterly: ProwessCoverageKpiHistory;
}

export interface ProwessCoverageTickerRow {
  symbol: string;
  /** Null if this ticker couldn't be matched to a Prowess company name — every prowess.* flag will be false. */
  prowessName: string | null;
  nse: ProwessCoverageNse;
  /** Keyed by "pnl"/"balanceSheet"/"cashflow", or "custom" when the request passed an explicit `kpis` list. */
  prowess: Record<string, ProwessCoverageGroup>;
}

export interface ProwessCoverageResponse {
  /** This page's tickers only — no cross-page total is returned by this endpoint. */
  tickers: string[];
  kpiSets: Record<string, ProwessCoverageKpiSet>;
  perTicker: ProwessCoverageTickerRow[];
}

// ── Prowess Daily — direct CMIE batch trigger (async submit → poll → resolve) ──
// Alternative to the CSV upload above — no file needed, backend submits a fixed query file to
// CMIE's live Prowess batch API and the frontend polls until it resolves. Ingestion into
// nse_equity_new happens automatically server-side the moment status flips to "completed" —
// there's no separate confirm/upload step here.

export type ProwessBatchStatus = "pending" | "completed" | "failed";

export interface ProwessBatchFile {
  file: string;
  type: string;
  recordsParsed: number;
  /** Typically large (thousands) — this query's domain is Prowess's whole company universe, most
   * not NSE-listed/tracked by this app, so a high count here is normal, not an error. */
  skippedName: number;
  nrowExpected: number;
}

export interface ProwessBatchResult {
  files: ProwessBatchFile[];
  totalRowsIngested: number;
}

export interface ProwessBatch {
  token: string;
  status: ProwessBatchStatus;
  /** Present once status is "completed". */
  result?: ProwessBatchResult | null;
  /** Present when status is "failed" — human-readable, safe to surface directly. */
  error?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProwessBatchTriggerResponse {
  success: true;
  data: ProwessBatch & { sendResponse?: Record<string, unknown> };
}

export interface ProwessBatchCheckResponse {
  success: true;
  data: ProwessBatch;
}

/** GET /admin/prowess/batch/:token — read-only DB state, no live CMIE call (unlike /check). */
export interface ProwessBatchGetResponse {
  success: true;
  data: ProwessBatch;
}

/** GET /admin/prowess/batch[?status=pending] — recent/pending batch list. */
export interface ProwessBatchListResponse {
  success: true;
  data: ProwessBatch[];
}

export interface ProwessBatchAbortResponse {
  success: true;
  data?: unknown;
}

// ── Scheduler jobs — auto/manual cron control for the Daily Runs tabs ────────
// GET/PUT /admin/scheduler-jobs/:slug, POST /admin/scheduler-jobs/:slug/run,
// GET /admin/scheduler-jobs/:slug/runs?limit=. Cron is always parsed in Asia/Kolkata
// server-side — the frontend sends/shows IST times as-is, no timezone conversion.
// NOTE: GET/PUT /:slug return the job object directly (no success/data envelope) —
// use rawFetch/rawPut, not apiAuthGet/apiAuthPut.

export type SchedulerJobSlug = "bse-discovery" | "prowess-daily-batch";

export interface SchedulerJob {
  id: string;
  slug: SchedulerJobSlug;
  name: string;
  description: string;
  job_type: string;
  cron_expression: string;
  is_active: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type SchedulerRunStatus = "running" | "completed" | "failed";

export interface SchedulerJobRun {
  id: string;
  job_id: string;
  status: SchedulerRunStatus;
  started_at: string | null;
  ended_at: string | null;
  records_processed: number | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
}

/** GET /admin/scheduler-jobs/:slug/runs?limit= — raw {count, runs} envelope, no success/data wrapper. */
export interface SchedulerJobRunsResponse {
  count: number;
  runs: SchedulerJobRun[];
}

/** POST /admin/scheduler-jobs/:slug/run — the one scheduler-jobs endpoint that DOES use success. */
export interface SchedulerJobTriggerResponse {
  success: true;
  message: string;
  run_id: string;
}
