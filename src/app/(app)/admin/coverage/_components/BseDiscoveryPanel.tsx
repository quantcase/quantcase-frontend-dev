"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Upload,
  ChevronDown,
  FileText,
  FileWarning,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { rawFetch, rawPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import {
  BseDiscoveryRunTriggerResponse,
  BseDiscoveryRun,
  BseDiscoveryRunsResponse,
  BseDiscoveredUrl,
  BseUrlStatus,
  BseDiscoveryUrlsResponse,
  BseDiscoveryApproveBody,
  BseDiscoveryApproveResponse,
  BseDismissResponse,
  BseUndismissResponse,
} from "./types";
import { UploadPdfModal, UploadPrefill } from "./UploadPdfModal";
import { BsePreviewModal } from "./BsePreviewModal";

const BASE = `${BACKEND_URL}/admin/bse-discovery`;

const INPUT_CLS =
  "rounded-md border border-hair px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:border-hair-strong";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

const DOC_TYPE_LABEL: Record<BseDiscoveredUrl["doc_type"], string> = {
  transcript: "Transcript",
  ppt: "PPT",
  annual_report: "Annual Report",
};

const SOURCE_LABEL: Record<BseDiscoveredUrl["source"], string> = {
  bse_original: "BSE Original",
  resolved: "Resolved",
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-ink-3">
      {children}
    </span>
  );
}

function formatBytes(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** PDF-resolution status pill. `resolved` = green, `pending` = amber, `non_pdf` = red, null = neutral. */
function UrlStatusBadge({ status }: { status: BseUrlStatus | null }) {
  if (status === "resolved") {
    return (
      <span className="flex items-center gap-1 rounded-sm bg-up-soft border border-up-soft px-1.5 py-0.5 text-[10px] font-medium text-up">
        <CheckCircle2 className="size-3" /> Resolved
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="flex items-center gap-1 rounded-sm bg-warn-soft border border-warn-soft px-1.5 py-0.5 text-[10px] font-medium text-warn">
        <Clock className="size-3" /> Pending
      </span>
    );
  }
  if (status === "non_pdf") {
    return (
      <span className="flex items-center gap-1 rounded-sm bg-down-soft border border-down-soft px-1.5 py-0.5 text-[10px] font-medium text-down">
        <FileWarning className="size-3" /> Not a PDF
      </span>
    );
  }
  return (
    <span
      title="Discovered before metadata capture existed — will populate when a run re-encounters this URL."
      className="rounded-sm bg-secondary border border-hair px-1.5 py-0.5 text-[10px] font-medium text-ink-3"
    >
      Unresolved
    </span>
  );
}

// ── Run status ────────────────────────────────────────────────────────────

function RunStatusBadge({ status }: { status: BseDiscoveryRun["status"] }) {
  if (status === "completed") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-up">
        <CheckCircle2 className="size-3.5" /> Completed
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-down">
        <XCircle className="size-3.5" /> Failed
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-blue">
      <Clock className="size-3.5" /> Running
    </span>
  );
}

function RunHistoryRow({ run }: { run: BseDiscoveryRun }) {
  return (
    <div className="rounded-[8px] border border-hair bg-card px-3 py-2 flex items-center gap-4 flex-wrap">
      <span className="font-mono text-[11px] text-ink-3 w-40 truncate shrink-0">{run.id}</span>
      <RunStatusBadge status={run.status} />
      <span className="text-[11px] text-ink-3">
        {run.records_processed != null ? `${run.records_processed} processed` : "—"}
      </span>
      {run.metadata && (
        <span className="text-[11px] text-ink-3">
          {run.metadata.companies} companies, {run.metadata.total_urls} URLs
        </span>
      )}
      {run.ended_at && <span className="text-[11px] text-ink-3">ended {new Date(run.ended_at).toLocaleString()}</span>}
      {run.status === "failed" && run.error && <span className="text-[11px] text-down">{run.error}</span>}
    </div>
  );
}

// ── Discovered URL row ────────────────────────────────────────────────────

interface RowEdit {
  company: string;
  fiscal_year: string;
  quarter: string;
}

interface RowStatus {
  loading: boolean;
  error?: string;
  success?: boolean;
  /** Armed after a first click on an overwrite-warning row — second click actually approves. */
  armed?: boolean;
}

interface DismissStatus {
  loading?: boolean;
  error?: string;
}

function rowKey(u: BseDiscoveredUrl, idx: number): string {
  return `${u.url}::${u.doc_type}::${u.scrape_date}::${idx}`;
}

function UrlRow({
  u,
  edit,
  status,
  dismissStatus,
  onEdit,
  onApprove,
  onUploadInstead,
  onDismiss,
  onUndismiss,
}: {
  u: BseDiscoveredUrl;
  edit: RowEdit;
  status: RowStatus | undefined;
  dismissStatus: DismissStatus | undefined;
  onEdit: (field: keyof RowEdit, value: string) => void;
  onApprove: () => void;
  onUploadInstead: () => void;
  onDismiss: (reason: string) => void;
  onUndismiss: () => void;
}) {
  const isAnnual = u.doc_type === "annual_report";
  const canApprove =
    edit.company.trim() !== "" && edit.fiscal_year.trim() !== "" && (isAnnual || edit.quarter.trim() !== "");

  const armed = !!status?.armed;
  const needsOverwriteConfirm = u.willOverwrite && !status?.success;
  const buttonLabel = status?.success && !status?.loading
    ? "Approved"
    : needsOverwriteConfirm && armed
    ? "Confirm Overwrite"
    : "Approve";

  // On-demand preview — opened in a modal only when the admin clicks it, never upfront.
  const [previewOpen, setPreviewOpen] = useState(false);
  // Inline dismiss flow — clicking Dismiss reveals an optional-reason input + Confirm.
  const [dismissOpen, setDismissOpen] = useState(false);
  const [dismissReason, setDismissReason] = useState("");

  return (
    <div
      className={`rounded-[8px] border bg-card p-3 space-y-2.5 ${
        u.dismissed ? "border-hair opacity-60" : "border-hair"
      } ${u.alreadyApproved ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[13px] font-medium text-ink">{u.company_name}</span>
        <span className="text-[11px] text-ink-3 font-mono">#{u.scrip_cd}</span>
        <Badge>{DOC_TYPE_LABEL[u.doc_type]}</Badge>
        <Badge>{SOURCE_LABEL[u.source]}</Badge>
        <UrlStatusBadge status={u.status} />
        {u.alreadyApproved && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-up bg-up-soft border border-up rounded-sm px-1.5 py-0.5">
            <CheckCircle2 className="size-3" /> Already Approved
          </span>
        )}
        {u.dismissed && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-ink-3 bg-secondary border border-hair rounded-sm px-1.5 py-0.5">
            <Trash2 className="size-3" /> Dismissed
          </span>
        )}
        <span className="text-[11px] text-ink-3">{u.scrape_date}</span>
        <a
          href={u.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink transition-colors ml-auto"
        >
          View PDF <ExternalLink className="size-3" />
        </a>
      </div>

      {/* PDF metadata + preview trigger */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setPreviewOpen(true)}
          className="flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink transition-colors"
        >
          <ChevronDown className="size-3" /> Preview PDF text
        </button>
        {(u.page_count != null || u.file_size != null) && (
          <span className="flex items-center gap-2 text-[11px] text-ink-3">
            <FileText className="size-3" />
            {u.page_count != null && <span className="font-mono">{u.page_count} pp</span>}
            {u.page_count != null && u.file_size != null && <span className="text-hair">·</span>}
            {u.file_size != null && <span className="font-mono">{formatBytes(u.file_size)}</span>}
          </span>
        )}
      </div>

      {u.dismissed && u.dismissed_reason && (
        <p className="text-[11px] text-ink-3">
          <span className="font-medium">Reason:</span> {u.dismissed_reason}
        </p>
      )}

      {previewOpen && (
        <BsePreviewModal
          url={u.url}
          title={`${u.company_name} — ${DOC_TYPE_LABEL[u.doc_type]}`}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {u.willOverwrite && (
        <div className="rounded-md border border-warn bg-warn-soft px-2.5 py-2 space-y-1">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-warn">
            <AlertCircle className="size-3.5 shrink-0" /> This will overwrite the existing stored URL for this slot.
          </p>
          <p className="text-[11px] text-warn font-mono break-all">
            <span className="text-warn font-sans font-normal">old: </span>{u.existingUrl}
          </p>
          <p className="text-[11px] text-warn font-mono break-all">
            <span className="text-warn font-sans font-normal">new: </span>{u.url}
          </p>
        </div>
      )}

      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className={LABEL_CLS}>Company</label>
          <input
            value={edit.company}
            onChange={(e) => onEdit("company", e.target.value.toUpperCase())}
            placeholder="Ticker"
            className={`${INPUT_CLS} w-36 uppercase`}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Fiscal Year</label>
          <input
            value={edit.fiscal_year}
            onChange={(e) => onEdit("fiscal_year", e.target.value.toUpperCase())}
            placeholder="FY2027"
            className={`${INPUT_CLS} w-28 uppercase`}
          />
        </div>
        {!isAnnual && (
          <div>
            <label className={LABEL_CLS}>Quarter</label>
            <input
              value={edit.quarter}
              onChange={(e) => onEdit("quarter", e.target.value.toUpperCase())}
              placeholder="Q1"
              className={`${INPUT_CLS} w-20 uppercase`}
            />
          </div>
        )}

        <button
          onClick={onApprove}
          disabled={!canApprove || status?.loading}
          className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-medium text-[var(--qc-on-dark)] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${
            needsOverwriteConfirm && armed ? "bg-down hover:opacity-90" : "bg-ink hover:opacity-90"
          }`}
        >
          {status?.loading && <Loader2 className="size-3.5 animate-spin" />}
          {status?.success && !status.loading && <CheckCircle2 className="size-3.5" />}
          {buttonLabel}
        </button>

        {u.dismissed ? (
          <button
            onClick={onUndismiss}
            disabled={dismissStatus?.loading}
            className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-2 text-[13px] font-medium text-ink hover:border-ink transition-colors disabled:opacity-40"
          >
            {dismissStatus?.loading ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
            Restore
          </button>
        ) : (
          <button
            onClick={() => setDismissOpen((v) => !v)}
            disabled={dismissStatus?.loading}
            className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-2 text-[13px] font-medium text-ink-3 hover:text-down hover:border-down transition-colors disabled:opacity-40"
          >
            <Trash2 className="size-3.5" /> Dismiss
          </button>
        )}
      </div>

      {/* Inline dismiss reason (optional) */}
      {dismissOpen && !u.dismissed && (
        <div className="flex items-end gap-2 flex-wrap rounded-md border border-hair bg-secondary px-2.5 py-2">
          <div className="flex-1 min-w-[200px]">
            <label className={LABEL_CLS}>Reason (optional)</label>
            <input
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              placeholder="e.g. duplicate of transcript filing"
              className={`${INPUT_CLS} w-full`}
            />
          </div>
          <button
            onClick={() => { onDismiss(dismissReason.trim()); setDismissOpen(false); }}
            disabled={dismissStatus?.loading}
            className="flex items-center gap-1.5 rounded-md bg-down px-3 py-2 text-[13px] font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {dismissStatus?.loading && <Loader2 className="size-3.5 animate-spin" />}
            Confirm Dismiss
          </button>
          <button
            onClick={() => setDismissOpen(false)}
            className="rounded-md px-3 py-2 text-[13px] font-medium text-ink-3 hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {dismissStatus?.error && <p className="text-[11px] text-down">{dismissStatus.error}</p>}

      {u.suggested.company === null && (
        <p className="flex items-center gap-1.5 text-[11px] text-warn bg-warn-soft border border-warn rounded-md px-2.5 py-1.5">
          <AlertCircle className="size-3.5 shrink-0" />
          Couldn&rsquo;t match this to an existing ticker — enter it manually, or{" "}
          <button onClick={onUploadInstead} className="underline font-medium hover:opacity-80">
            upload the PDF instead
          </button>
          .
        </p>
      )}
      {status?.error && <p className="text-[11px] text-down">{status.error}</p>}
    </div>
  );
}

// ── Main panel ───────────────────────────────────────────────────────────

export function BseDiscoveryPanel() {
  // Trigger
  const [lookbackDays, setLookbackDays] = useState("");
  const [triggering, setTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  // Run history
  const [runs, setRuns] = useState<BseDiscoveryRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsError, setRunsError] = useState<string | null>(null);

  // Discovered URLs
  const [urlsDays, setUrlsDays] = useState("14");
  const [hideApproved, setHideApproved] = useState(false);
  const [showDismissed, setShowDismissed] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BseUrlStatus | "">("");
  const [minPages, setMinPages] = useState("");
  const [maxPages, setMaxPages] = useState("");
  const [minSizeMb, setMinSizeMb] = useState("");
  const [maxSizeMb, setMaxSizeMb] = useState("");
  const [urls, setUrls] = useState<BseDiscoveredUrl[]>([]);
  const [urlsLoading, setUrlsLoading] = useState(false);
  const [urlsError, setUrlsError] = useState<string | null>(null);

  // Per-row edit state and approve status, keyed by rowKey()
  const [edits, setEdits] = useState<Record<string, RowEdit>>({});
  const [approveStatus, setApproveStatus] = useState<Record<string, RowStatus>>({});
  const [dismissStatus, setDismissStatus] = useState<Record<string, DismissStatus>>({});

  // "Upload PDF instead" modal — undefined prefill means the standalone/global trigger
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadPrefill, setUploadPrefill] = useState<UploadPrefill | undefined>(undefined);

  const loadRuns = useCallback(() => {
    rawFetch<BseDiscoveryRunsResponse>(`${BASE}/runs?limit=20`, {
      onStart: () => setRunsLoading(true),
      onSuccess: (res) => setRuns(res.runs ?? []),
      onError: setRunsError,
      onComplete: () => setRunsLoading(false),
    });
  }, []);

  useEffect(() => { loadRuns(); }, [loadRuns]);

  const loadUrls = useCallback(() => {
    const days = urlsDays.trim() || "14";
    const params = new URLSearchParams({ days, hideApproved: String(hideApproved) });
    if (showDismissed) params.set("showDismissed", "true");
    if (statusFilter) params.set("status", statusFilter);
    if (minPages.trim()) params.set("minPages", minPages.trim());
    if (maxPages.trim()) params.set("maxPages", maxPages.trim());
    // UI takes MB for readability; the API filters on raw bytes.
    if (minSizeMb.trim()) params.set("minSize", String(Math.round(Number(minSizeMb) * 1024 * 1024)));
    if (maxSizeMb.trim()) params.set("maxSize", String(Math.round(Number(maxSizeMb) * 1024 * 1024)));
    rawFetch<BseDiscoveryUrlsResponse>(`${BASE}/urls?${params}`, {
      onStart: () => { setUrlsLoading(true); setUrlsError(null); },
      onSuccess: (res) => setUrls(res.urls ?? []),
      onError: setUrlsError,
      onComplete: () => setUrlsLoading(false),
    });
  }, [urlsDays, hideApproved, showDismissed, statusFilter, minPages, maxPages, minSizeMb, maxSizeMb]);

  // Cheap toggles (days, hideApproved, showDismissed) reload live; the numeric/status metadata
  // filters apply only on Apply/Enter/Refresh, so typing them doesn't fire a request per keystroke.
  // The ref keeps loadUrls current (with the latest filter values) without being an effect dep.
  const loadUrlsRef = useRef(loadUrls);
  loadUrlsRef.current = loadUrls;
  useEffect(() => { loadUrlsRef.current(); }, [urlsDays, hideApproved, showDismissed]);

  const activeRun = runs.find((r) => r.id === activeRunId) ?? null;
  const isRunLive = !!activeRunId && (!activeRun || activeRun.status === "running");

  useEffect(() => {
    if (!isRunLive) return;
    const iv = setInterval(loadRuns, 2000);
    return () => clearInterval(iv);
  }, [isRunLive, loadRuns]);

  // Once the triggered run finishes, pull the freshly discovered URLs in automatically.
  useEffect(() => {
    if (activeRun?.status === "completed") loadUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRun?.status]);

  function triggerRun() {
    const body = lookbackDays.trim() ? { config: { lookback_days: Number(lookbackDays) } } : undefined;
    rawPost<BseDiscoveryRunTriggerResponse>(`${BASE}/run`, {
      onStart: () => { setTriggering(true); setTriggerError(null); },
      onSuccess: (res) => { setActiveRunId(res.run_id); loadRuns(); },
      onError: setTriggerError,
      onComplete: () => setTriggering(false),
    }, body);
  }

  function getEdit(u: BseDiscoveredUrl, key: string): RowEdit {
    return (
      edits[key] ?? {
        company: u.suggested.company ?? "",
        fiscal_year: u.suggested.fiscal_year ?? "",
        quarter: u.suggested.quarter ?? "",
      }
    );
  }

  function setEditField(u: BseDiscoveredUrl, key: string, field: keyof RowEdit, value: string) {
    setEdits((prev) => ({ ...prev, [key]: { ...getEdit(u, key), [field]: value } }));
    setApproveStatus((prev) => ({ ...prev, [key]: { loading: false } }));
  }

  function approve(u: BseDiscoveredUrl, key: string) {
    const edit = getEdit(u, key);
    const body: BseDiscoveryApproveBody = {
      docType: u.doc_type,
      url: u.url,
      company: edit.company.trim(),
      fiscal_year: edit.fiscal_year.trim(),
    };
    if (u.doc_type !== "annual_report") body.quarter = edit.quarter.trim();

    rawPost<BseDiscoveryApproveResponse>(`${BASE}/approve`, {
      onStart: () => setApproveStatus((prev) => ({ ...prev, [key]: { loading: true } })),
      onSuccess: () => setApproveStatus((prev) => ({ ...prev, [key]: { loading: false, success: true } })),
      onError: (err) => setApproveStatus((prev) => ({ ...prev, [key]: { loading: false, error: err } })),
    }, body);
  }

  // Rows that would overwrite an existing URL need one extra click ("arm" then confirm) before
  // the real approve() call fires — everything else approves on the first click, as before.
  function handleApproveClick(u: BseDiscoveredUrl, key: string) {
    if (u.willOverwrite && !approveStatus[key]?.armed) {
      setApproveStatus((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { loading: false }), armed: true } }));
      return;
    }
    approve(u, key);
  }

  function dismiss(u: BseDiscoveredUrl, key: string, reason: string) {
    rawPost<BseDismissResponse>(`${BASE}/dismiss`, {
      onStart: () => setDismissStatus((prev) => ({ ...prev, [key]: { loading: true } })),
      onSuccess: () => { setDismissStatus((prev) => ({ ...prev, [key]: {} })); loadUrls(); },
      onError: (err) => setDismissStatus((prev) => ({ ...prev, [key]: { error: err } })),
    }, reason ? { url: u.url, reason } : { url: u.url });
  }

  function undismiss(u: BseDiscoveredUrl, key: string) {
    rawPost<BseUndismissResponse>(`${BASE}/undismiss`, {
      onStart: () => setDismissStatus((prev) => ({ ...prev, [key]: { loading: true } })),
      onSuccess: () => { setDismissStatus((prev) => ({ ...prev, [key]: {} })); loadUrls(); },
      onError: (err) => setDismissStatus((prev) => ({ ...prev, [key]: { error: err } })),
    }, { url: u.url });
  }

  function openUploadModal(prefill?: UploadPrefill) {
    setUploadPrefill(prefill);
    setUploadModalOpen(true);
  }

  const rowsWithKeys = useMemo(() => urls.map((u, idx) => ({ u, key: rowKey(u, idx) })), [urls]);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Intro */}
      <div className="rounded-md border border-hair bg-secondary px-4 py-3">
        <p className="text-[13px] text-ink font-medium">BSE discovery &amp; approval</p>
        <p className="text-[12px] text-ink-3 mt-1 leading-relaxed">
          Scrapes BSE and resolves cover-letter PDFs in the background (~1-2 min). Nothing lands in
          the real tables automatically — review each discovered URL below and Approve it
          explicitly. Approving is idempotent, so it&rsquo;s safe to click twice.
        </p>
      </div>

      {/* Trigger */}
      <div className="rounded-[10px] border border-hair bg-card p-4 space-y-3">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className={LABEL_CLS}>Lookback Days</label>
            <input
              type="number"
              min={1}
              value={lookbackDays}
              onChange={(e) => setLookbackDays(e.target.value)}
              placeholder="default"
              className={`${INPUT_CLS} w-28`}
            />
          </div>
          <button
            onClick={triggerRun}
            disabled={triggering || isRunLive}
            className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {(triggering || isRunLive) && <Loader2 className="size-3.5 animate-spin" />}
            Run Discovery
          </button>
          <button
            onClick={() => openUploadModal()}
            className="flex items-center gap-1.5 rounded-md border border-hair bg-card px-4 py-2 text-sm font-medium text-ink hover:border-[var(--qc-ink)] transition-colors"
          >
            <Upload className="size-3.5" /> Upload PDF Instead
          </button>
        </div>

        {triggerError && (
          <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">
            <AlertCircle className="size-3.5 shrink-0" /> {triggerError}
          </div>
        )}

        {activeRun && (
          <div className="flex items-center gap-2 rounded-md border border-blue bg-blue-soft px-3 py-2 text-[12px] text-blue">
            <Loader2 className="size-3.5 shrink-0 animate-spin" />
            Discovery running ({activeRun.id})… this takes ~1-2 minutes.
          </div>
        )}
      </div>

      {/* Run history */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Run History</span>
          <button
            onClick={loadRuns}
            disabled={runsLoading}
            className="flex items-center gap-1.5 text-[11px] text-ink-3 hover:text-ink disabled:opacity-40"
          >
            {runsLoading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
            Refresh
          </button>
        </div>

        {runsError && !runsLoading && (
          <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
            <AlertCircle className="size-4 shrink-0" /> {runsError}
          </div>
        )}

        {runs.length === 0 && !runsLoading && !runsError && <p className="text-[12px] text-ink-3">No runs yet.</p>}

        <div className="space-y-1.5">
          {runs.map((run) => <RunHistoryRow key={run.id} run={run} />)}
        </div>
      </div>

      {/* Discovered URLs */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
            Discovered URLs {urlsLoading && <span className="normal-case tracking-normal font-normal">— loading…</span>}
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-1.5 text-[11px] text-ink-3">
              <input
                type="checkbox"
                checked={hideApproved}
                onChange={(e) => setHideApproved(e.target.checked)}
              />
              Hide approved
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-ink-3">
              <input
                type="checkbox"
                checked={showDismissed}
                onChange={(e) => setShowDismissed(e.target.checked)}
              />
              Show dismissed
            </label>
            <label className="text-[11px] text-ink-3">Last</label>
            <input
              type="number"
              min={1}
              value={urlsDays}
              onChange={(e) => setUrlsDays(e.target.value)}
              className={`${INPUT_CLS} w-16 py-1`}
            />
            <label className="text-[11px] text-ink-3">days</label>
            <button
              onClick={loadUrls}
              disabled={urlsLoading}
              className="flex items-center gap-1.5 text-[11px] text-ink-3 hover:text-ink disabled:opacity-40"
            >
              {urlsLoading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              Refresh
            </button>
          </div>
        </div>

        {/* PDF metadata filters — applied on Refresh (or Enter). A numeric bound excludes rows whose
            metadata isn't known yet (null); use Status = Pending to find not-yet-downloaded candidates. */}
        <div className="flex items-end gap-3 flex-wrap rounded-md border border-hair bg-secondary px-3 py-2.5">
          <div>
            <label className={LABEL_CLS}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BseUrlStatus | "")}
              className={`${INPUT_CLS} py-1.5`}
            >
              <option value="">Any</option>
              <option value="resolved">Resolved</option>
              <option value="pending">Pending</option>
              <option value="non_pdf">Not a PDF</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Pages</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                value={minPages}
                onChange={(e) => setMinPages(e.target.value)}
                placeholder="min"
                className={`${INPUT_CLS} w-20 py-1.5`}
                onKeyDown={(e) => { if (e.key === "Enter") loadUrls(); }}
              />
              <span className="text-[11px] text-ink-3">–</span>
              <input
                type="number"
                min={0}
                value={maxPages}
                onChange={(e) => setMaxPages(e.target.value)}
                placeholder="max"
                className={`${INPUT_CLS} w-20 py-1.5`}
                onKeyDown={(e) => { if (e.key === "Enter") loadUrls(); }}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Size (MB)</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                step="0.1"
                value={minSizeMb}
                onChange={(e) => setMinSizeMb(e.target.value)}
                placeholder="min"
                className={`${INPUT_CLS} w-20 py-1.5`}
                onKeyDown={(e) => { if (e.key === "Enter") loadUrls(); }}
              />
              <span className="text-[11px] text-ink-3">–</span>
              <input
                type="number"
                min={0}
                step="0.1"
                value={maxSizeMb}
                onChange={(e) => setMaxSizeMb(e.target.value)}
                placeholder="max"
                className={`${INPUT_CLS} w-20 py-1.5`}
                onKeyDown={(e) => { if (e.key === "Enter") loadUrls(); }}
              />
            </div>
          </div>
          <button
            onClick={loadUrls}
            disabled={urlsLoading}
            className="rounded-md border border-hair bg-card px-3 py-2 text-[12px] font-medium text-ink hover:border-ink transition-colors disabled:opacity-40"
          >
            Apply filters
          </button>
          {(statusFilter || minPages || maxPages || minSizeMb || maxSizeMb) && (
            <button
              onClick={() => { setStatusFilter(""); setMinPages(""); setMaxPages(""); setMinSizeMb(""); setMaxSizeMb(""); }}
              className="text-[11px] text-ink-3 hover:text-ink transition-colors py-2"
            >
              Clear
            </button>
          )}
        </div>

        {urlsError && !urlsLoading && (
          <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
            <AlertCircle className="size-4 shrink-0" /> {urlsError}
          </div>
        )}

        {urls.length === 0 && !urlsLoading && !urlsError && (
          <p className="text-[12px] text-ink-3">No discovered URLs in this window.</p>
        )}

        <div className="space-y-1.5">
          {rowsWithKeys.map(({ u, key }) => (
            <UrlRow
              key={key}
              u={u}
              edit={getEdit(u, key)}
              status={approveStatus[key]}
              dismissStatus={dismissStatus[key]}
              onEdit={(field, value) => setEditField(u, key, field, value)}
              onApprove={() => handleApproveClick(u, key)}
              onDismiss={(reason) => dismiss(u, key, reason)}
              onUndismiss={() => undismiss(u, key)}
              onUploadInstead={() =>
                openUploadModal({
                  docType: u.doc_type,
                  fiscalYear: u.suggested.fiscal_year ?? undefined,
                  quarter: u.suggested.quarter ?? undefined,
                })
              }
            />
          ))}
        </div>
      </div>

      {uploadModalOpen && (
        <UploadPdfModal
          prefill={uploadPrefill}
          onClose={() => { setUploadModalOpen(false); setUploadPrefill(undefined); }}
        />
      )}
    </div>
  );
}
