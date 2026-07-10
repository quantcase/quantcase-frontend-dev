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
  /** What's currently stored for (company, fiscal_year, quarter), if anything. Null if nothing's there yet or suggested.company couldn't be matched. */
  existingUrl: string | null;
  /** Whether approving this candidate would replace existingUrl. */
  willOverwrite: boolean;
}

export interface BseDiscoveryUrlsResponse {
  count: number;
  urls: BseDiscoveredUrl[];
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
