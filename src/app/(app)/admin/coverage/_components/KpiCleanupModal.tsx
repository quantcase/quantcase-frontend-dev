"use client";

import { useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { rawPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { MetricTile } from "@/components/molecules/metric-tile";
import { KpiPhase6Result } from "./types";

const BASE = `${BACKEND_URL}/admin/kpi-dedup/phase6`;

function fmt(n: number): string {
  return n.toLocaleString("en-IN");
}

interface Props {
  onClose: () => void;
}

// Preview/Run are both expensive full-catalog scans — neither fires until the admin explicitly
// clicks a button inside the modal (no auto-fetch on open/mount).
export function KpiCleanupModal({ onClose }: Props) {
  const [result, setResult] = useState<KpiPhase6Result | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [confirmArmed, setConfirmArmed] = useState(false);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  function doPreview() {
    rawPost<{ success: boolean; data: KpiPhase6Result }>(`${BASE}/preview`, {
      onStart: () => { setPreviewLoading(true); setPreviewError(null); setConfirmArmed(false); setRunError(null); },
      onSuccess: (res) => setResult(res.data),
      onError: setPreviewError,
      onComplete: () => setPreviewLoading(false),
    });
  }

  function handleRunClick() {
    if (!confirmArmed) { setConfirmArmed(true); return; }
    rawPost<{ success: boolean; data: KpiPhase6Result }>(`${BASE}/run`, {
      onStart: () => { setRunning(true); setRunError(null); },
      onSuccess: (res) => { setResult(res.data); setConfirmArmed(false); },
      onError: setRunError,
      onComplete: () => setRunning(false),
    });
  }

  const canRun = !!result && result.dryRun && !previewLoading && !running;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[640px] max-h-[85vh] rounded-[10px] border border-[#E2E2E2] bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E2E2] px-5 py-3 shrink-0">
          <h3 className="text-[14px] font-medium text-[#0F172B]">KPI Cleanup — per-industry cap</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-[#888888] hover:text-[#0F172B] hover:border-[#E2E2E2] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-[12px] text-[#888888]">
            Caps how many KPIs stay tagged to each industry. A KPI is only deleted if it&apos;s over
            cap in every industry it belongs to. Both Preview and Run scan the full KPI catalog —
            they don&apos;t run automatically, only on the buttons below.
          </p>

          {previewError && !previewLoading && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" /> {previewError}
            </div>
          )}
          {runError && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" /> {runError}
            </div>
          )}

          {result?.dryRun === false && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Cleanup complete — {fmt(result.deletedCount ?? result.deletableCount)} KPIs deleted.
            </div>
          )}

          {previewLoading && !result && (
            <div className="flex items-center gap-2 text-sm text-[#888888]">
              <Loader2 className="size-4 animate-spin" /> Scanning KPI catalog…
            </div>
          )}

          {result && (
            <>
              {/* Headline */}
              <div className="rounded-[10px] border border-[#E2E2E2] bg-white p-4">
                <p className="text-[11px] uppercase tracking-wider text-[#888888] font-medium">
                  {result.dryRun ? "Preview" : "Result"}
                </p>
                <p className="text-[20px] font-[500] text-[#0F172B] mt-1">
                  {fmt(result.totalKpisBefore)} <span className="text-[#888888] mx-1">→</span> {fmt(result.remainingCount)}
                  <span className="text-[13px] text-[#888888] font-normal ml-2">after cleanup</span>
                </p>
              </div>

              {/* Metric tiles */}
              <div className="grid grid-cols-2 gap-3">
                <MetricTile label="Industries Processed" value={fmt(result.industriesProcessed)} />
                <MetricTile label={result.dryRun ? "Deletable" : "Deleted"} value={fmt(result.dryRun ? result.deletableCount : result.deletedCount ?? result.deletableCount)} />
              </div>

              {/* Industries table */}
              <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden max-h-[280px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0">
                    <tr className="bg-[#F5F5F5] border-b border-[#E2E2E2]">
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">Industry</th>
                      <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#888888]">KPIs</th>
                      <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#888888]">Cap</th>
                      <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#888888]">Deleting</th>
                      <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#888888]">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.industries.map((ind) => (
                      <tr key={ind.industry} className="border-b border-[#F0F0F0] last:border-0">
                        <td className="px-3 py-2 text-[#0F172B] font-medium">{ind.industry}</td>
                        <td className="px-3 py-2 text-right text-[#0F172B]">{fmt(ind.kpiCount)}</td>
                        <td className="px-3 py-2 text-right text-[#888888]">{fmt(ind.cap)}</td>
                        <td className="px-3 py-2 text-right text-red-600 font-medium">
                          {ind.actualDeleteCount > 0 ? fmt(ind.actualDeleteCount) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right text-[#0F172B]">{fmt(ind.remainingCount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap border-t border-[#E2E2E2] px-5 py-3 shrink-0">
          <button
            onClick={doPreview}
            disabled={previewLoading}
            className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-4 py-2 text-sm font-medium text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40"
          >
            {previewLoading && <Loader2 className="size-3.5 animate-spin" />}
            {result ? "Refresh Preview" : "Run Preview"}
          </button>

          <button
            onClick={handleRunClick}
            disabled={!canRun}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${
              confirmArmed ? "bg-red-600 hover:opacity-90" : "bg-[#0F172B] hover:opacity-90"
            }`}
          >
            {running && <Loader2 className="size-3.5 animate-spin" />}
            {confirmArmed ? "Confirm delete" : "Run Cleanup"}
          </button>

          {confirmArmed && (
            <button
              onClick={() => setConfirmArmed(false)}
              className="text-sm text-[#888888] hover:text-[#0F172B]"
            >
              Cancel
            </button>
          )}

          <span className="text-[11px] text-[#888888]">
            {confirmArmed
              ? `This permanently deletes ${result ? fmt(result.deletableCount) : ""} KPIs and can't be undone.`
              : "Run Preview first to see what would be deleted."}
          </span>
        </div>
      </div>
    </div>
  );
}
