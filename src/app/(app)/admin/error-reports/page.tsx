"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { apiAuthGet, apiAuthPatch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import {
  ERROR_REPORT_CATEGORIES,
  type ErrorReportStatus,
  type ErrorReportWithUser,
  type ListErrorReportsResponse,
} from "@/types/error-reports";

const BASE = `${BACKEND_URL}/admin/error-reports`;

const STATUS_OPTIONS: { value: ErrorReportStatus; label: string; color: string }[] = [
  { value: "open", label: "Open", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "in_progress", label: "In progress", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "resolved", label: "Resolved", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "wont_fix", label: "Won't fix", color: "text-zinc-500 bg-zinc-50 border-zinc-200" },
];

function statusMeta(status: ErrorReportStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
}

function ReportRow({ report, onUpdated }: { report: ErrorReportWithUser; onUpdated: (r: ErrorReportWithUser) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(report.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const meta = statusMeta(report.status);
  const categoryLabel = ERROR_REPORT_CATEGORIES.find((c) => c.value === report.category)?.label ?? report.category;

  function updateStatus(status: ErrorReportStatus) {
    setSaving(true);
    apiAuthPatch<{ success: true; data: ErrorReportWithUser }>(
      `${BASE}/${report.id}`,
      {
        onSuccess: (res) => onUpdated({ ...res.data, user: report.user }),
        onError: () => {},
        onComplete: () => setSaving(false),
      },
      { status }
    );
  }

  function saveNotes() {
    setSaving(true);
    apiAuthPatch<{ success: true; data: ErrorReportWithUser }>(
      `${BASE}/${report.id}`,
      {
        onSuccess: (res) => onUpdated({ ...res.data, user: report.user }),
        onError: () => {},
        onComplete: () => setSaving(false),
      },
      { adminNotes: notes }
    );
  }

  return (
    <div className="rounded-[8px] border border-[#E2E2E2] bg-white overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors"
      >
        <span className={cn("shrink-0 text-[10px] font-semibold uppercase tracking-wider rounded-sm border px-1.5 py-0.5", meta.color)}>
          {meta.label}
        </span>
        <span className="shrink-0 text-[10px] uppercase tracking-wider font-semibold text-[#888888] bg-[#F5F5F5] rounded-sm px-1.5 py-0.5">
          {categoryLabel}
        </span>
        <span className="flex-1 min-w-0 truncate text-[13px] text-[#0F172B]">{report.message}</span>
        <span className="shrink-0 text-[11px] text-[#888888]">{report.user?.email ?? report.user_email ?? "—"}</span>
        <span className="shrink-0 text-[11px] text-[#888888]">{formatDate(report.created_at)}</span>
      </button>

      {expanded && (
        <div className="border-t border-[#E2E2E2] px-4 py-3 space-y-3 bg-[#FAFAFA]">
          <p className="text-[13px] text-[#0F172B] whitespace-pre-wrap">{report.message}</p>

          {report.error_message && (
            <div className="rounded-md border border-[#E2E2E2] bg-white px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1">Captured error</p>
              <p className="text-[12px] font-mono text-[#0F172B] break-words">{report.error_message}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-[#888888]">
            {report.page_url && (
              <a href={report.page_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#0F172B] transition-colors">
                <ExternalLink className="size-3" />
                {report.page_url}
              </a>
            )}
            {report.user_agent && <span className="truncate max-w-[360px]">{report.user_agent}</span>}
          </div>

          {report.metadata && Object.keys(report.metadata).length > 0 && (
            <div className="rounded-md border border-[#E2E2E2] bg-white px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1">Metadata</p>
              <pre className="text-[11px] font-mono text-[#0F172B] whitespace-pre-wrap break-words">
                {JSON.stringify(report.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                disabled={saving || s.value === report.status}
                onClick={() => updateStatus(s.value)}
                className={cn(
                  "text-[11px] font-medium rounded-md border px-2.5 py-1 transition-colors disabled:cursor-default",
                  s.value === report.status
                    ? s.color
                    : "text-[#888888] bg-white border-[#E2E2E2] hover:border-[#0F172B] hover:text-[#0F172B]"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
              Admin notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-[#E2E2E2] px-3 py-2 text-sm text-[#0F172B] focus:outline-none focus:ring-1 focus:ring-[#0F172B] resize-none bg-white"
              placeholder="Internal notes…"
            />
            <button
              onClick={saveNotes}
              disabled={saving || notes === (report.admin_notes ?? "")}
              className="flex items-center gap-1.5 rounded-md bg-[#0F172B] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="size-3 animate-spin" />}
              Save notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminErrorReportsPage() {
  const [reports, setReports] = useState<ErrorReportWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ErrorReportStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), size: "20" });
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);

    apiAuthGet<ListErrorReportsResponse>(`${BASE}?${params.toString()}`, {
      onStart: () => setLoading(true),
      onSuccess: (res) => {
        setReports(res.data);
        setTotalPages(res.pagination.totalPages);
      },
      onError: (err) => setError(err),
      onComplete: () => setLoading(false),
    });
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function handleUpdated(updated: ErrorReportWithUser) {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  return (
    <div className="p-6 space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-[400] text-[var(--qc-ink)]">Error Reports</h1>
          <p className="text-[14px] text-[var(--qc-ink-2)] mt-0.5">
            User-submitted issue reports, newest first.
          </p>
        </div>
        <button
          onClick={() => {
            setPage(1);
            load();
          }}
          className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-3 py-2 text-sm font-medium text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] transition-colors"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as ErrorReportStatus | "");
          }}
          className="rounded-md border border-[#E2E2E2] px-3 py-2 text-sm text-[#0F172B] bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172B]"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setPage(1);
            setCategoryFilter(e.target.value);
          }}
          className="rounded-md border border-[#E2E2E2] px-3 py-2 text-sm text-[#0F172B] bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172B]"
        >
          <option value="">All categories</option>
          {ERROR_REPORT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      {loading && reports.length === 0 ? (
        <div className="flex items-center gap-2 text-[13px] text-[#888888] py-8 justify-center">
          <Loader2 className="size-4 animate-spin" />
          Loading reports…
        </div>
      ) : reports.length === 0 ? (
        <div className="text-[13px] text-[#888888] py-8 text-center">No error reports found.</div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <ReportRow key={report.id} report={report} onUpdated={handleUpdated} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-[#E2E2E2] px-3 py-1.5 text-xs font-medium text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-[12px] text-[#888888]">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-md border border-[#E2E2E2] px-3 py-1.5 text-xs font-medium text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
