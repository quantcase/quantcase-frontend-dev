"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";
import { apiAuthUpload } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { MetricTile } from "@/components/molecules/metric-tile";
import { KpiCatalogueModal } from "./KpiCatalogueModal";
import {
  ProwessFinancialReport,
  ProwessIngestReport,
  ProwessIngestResponse,
  ProwessMarketReport,
  ProwessMode,
} from "./types";

const BASE = `${BACKEND_URL}/admin/prowess/historic`;

const MODE_OPTIONS: { value: ProwessMode; label: string; table: string }[] = [
  { value: "annual", label: "Annual", table: "prowess_values_new" },
  { value: "quarterly", label: "Quarterly", table: "prowess_values_new" },
  { value: "daily", label: "Daily", table: "nse_equity_new" },
  { value: "index", label: "Index", table: "nse_equity_new" },
];

function isFinancialReport(r: ProwessIngestReport): r is ProwessFinancialReport {
  return r.mode === "annual" || r.mode === "quarterly";
}

function FinancialReportView({ report }: { report: ProwessFinancialReport }) {
  const sourceTypeEntries = Object.entries(report.rowsBySourceType);
  const kpiEntries = Object.entries(report.rowsByKpi);
  const indicatorEntries = Object.entries(report.dynamicIndicatorsMatched);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <MetricTile label="Companies in CSV" value={String(report.companiesInCsv)} />
        <MetricTile label="Columns in CSV" value={String(report.columnsInCsv)} />
        <MetricTile label="Total Rows" value={report.totalRows.toLocaleString("en-IN")} />
      </div>

      {report.insertStats && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="size-4 shrink-0" />
          Inserted {report.insertStats.inserted} of {report.insertStats.attempted} rows
          {report.insertStats.skipped > 0 ? ` — ${report.insertStats.skipped} skipped (already present)` : ""}.
        </div>
      )}

      {report.unmatchedColumns.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800 space-y-1.5">
          <p className="font-medium">
            {report.unmatchedColumns.length} column{report.unmatchedColumns.length === 1 ? "" : "s"} unmatched to any KPI
          </p>
          <p className="text-amber-700">
            These rows will be skipped on run. Add a KPI for each (matching its exact CSV column name as
            &quot;Prowess Name&quot;) via the KPI Catalogue, then re-run preview.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {report.unmatchedColumns.map((c) => (
              <span key={c} className="rounded-sm bg-white border border-amber-200 px-2 py-0.5 font-mono text-[11px]">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {sourceTypeEntries.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#888888] mb-1.5">Rows by Source Type</p>
          <div className="flex flex-wrap gap-1.5">
            {sourceTypeEntries.map(([k, v]) => (
              <span key={k} className="rounded-sm bg-[#F5F5F5] border border-[#E2E2E2] px-2 py-1 text-[11px] text-[#0F172B]">
                <span className="font-mono font-medium">{k}</span> — {v.toLocaleString("en-IN")}
              </span>
            ))}
          </div>
        </div>
      )}

      {indicatorEntries.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#888888] mb-1.5">Matched Indicators</p>
          <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden max-h-[180px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0">
                <tr className="bg-[#F5F5F5] border-b border-[#E2E2E2]">
                  <th className="px-3 py-1.5 text-left text-[10px] uppercase tracking-wider text-[#888888]">CSV Column</th>
                  <th className="px-3 py-1.5 text-left text-[10px] uppercase tracking-wider text-[#888888]">KPI Abbr</th>
                </tr>
              </thead>
              <tbody>
                {indicatorEntries.map(([col, abbr]) => (
                  <tr key={col} className="border-b border-[#F0F0F0] last:border-0">
                    <td className="px-3 py-1.5 text-[#0F172B]">{col}</td>
                    <td className="px-3 py-1.5 text-[#888888] font-mono">{abbr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {kpiEntries.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#888888] mb-1.5">Rows by KPI</p>
          <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden max-h-[180px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0">
                <tr className="bg-[#F5F5F5] border-b border-[#E2E2E2]">
                  <th className="px-3 py-1.5 text-left text-[10px] uppercase tracking-wider text-[#888888]">KPI</th>
                  <th className="px-3 py-1.5 text-right text-[10px] uppercase tracking-wider text-[#888888]">Rows</th>
                </tr>
              </thead>
              <tbody>
                {kpiEntries.map(([abbr, count]) => (
                  <tr key={abbr} className="border-b border-[#F0F0F0] last:border-0">
                    <td className="px-3 py-1.5 text-[#0F172B] font-mono">{abbr}</td>
                    <td className="px-3 py-1.5 text-right text-[#888888]">{count.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketReportView({ report }: { report: ProwessMarketReport }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <MetricTile label="Records Parsed" value={report.recordsParsed.toLocaleString("en-IN")} />
        <MetricTile label="Skipped (unmapped)" value={String(report.skippedName)} />
      </div>

      {report.insertStats && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="size-4 shrink-0" />
          Inserted {report.insertStats.inserted} of {report.insertStats.attempted} rows attempted.
        </div>
      )}

      {report.skippedName > 0 && (
        <p className="text-[12px] text-[#888888]">
          {report.skippedName} row{report.skippedName === 1 ? "" : "s"} referenced a company/index the parser
          couldn&apos;t map — review the CSV names, not necessarily an error.
        </p>
      )}
    </div>
  );
}

export function ProwessIngestionTab() {
  const [showKpiCatalogue, setShowKpiCatalogue] = useState(false);

  const [mode, setMode] = useState<ProwessMode>("annual");
  const [file, setFile] = useState<File | null>(null);
  const [rowLimit, setRowLimit] = useState("");

  const [previewReport, setPreviewReport] = useState<ProwessIngestReport | null>(null);
  const [previewedKey, setPreviewedKey] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const currentKey = JSON.stringify({ mode, name: file?.name, size: file?.size, rowLimit });
  const previewMatchesInputs = !!previewReport && previewedKey === currentKey;

  function resetDownstream() {
    setPreviewReport(null);
    setPreviewedKey(null);
    setPreviewError(null);
    setRunError(null);
  }

  function selectMode(m: ProwessMode) {
    setMode(m);
    resetDownstream();
  }

  function handleFileChange(f: File | null) {
    setFile(f);
    resetDownstream();
  }

  function handleRowLimitChange(v: string) {
    setRowLimit(v);
    resetDownstream();
  }

  function buildFormData(): FormData {
    const fd = new FormData();
    if (file) fd.append("file", file);
    fd.append("mode", mode);
    if (rowLimit.trim()) fd.append("rowLimit", rowLimit.trim());
    return fd;
  }

  function doPreview() {
    if (!file) return;
    const key = currentKey;
    apiAuthUpload<ProwessIngestResponse>(`${BASE}/preview`, {
      onStart: () => { setPreviewLoading(true); setPreviewError(null); },
      onSuccess: (res) => { setPreviewReport(res.data); setPreviewedKey(key); },
      onError: setPreviewError,
      onComplete: () => setPreviewLoading(false),
    }, buildFormData());
  }

  function handleRunClick() {
    if (!previewMatchesInputs) return;
    apiAuthUpload<ProwessIngestResponse>(`${BASE}/run`, {
      onStart: () => { setRunning(true); setRunError(null); },
      onSuccess: (res) => { setPreviewReport(res.data); },
      onError: setRunError,
      onComplete: () => setRunning(false),
    }, buildFormData());
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] text-[#888888] max-w-xl">
          Upload a Prowess CSV export to preview, then insert. Preview never writes to the DB — always
          review the report (and resolve any unmatched columns) before running.
        </p>
        <button
          onClick={() => setShowKpiCatalogue(true)}
          className="rounded-md border border-[#E2E2E2] bg-white px-3 py-1.5 text-[12px] font-medium text-[#0F172B] hover:border-[#0F172B] transition-colors shrink-0"
        >
          KPI Catalogue
        </button>
      </div>

      <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
        <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4 space-y-4">
          <div>
            <p className="block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">Mode</p>
            <div className="flex gap-2 flex-wrap">
              {MODE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectMode(opt.value)}
                  className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    mode === opt.value
                      ? "border-[#0F172B] bg-[#0F172B] text-white"
                      : "border-[#E2E2E2] text-[#0F172B] hover:border-[#0F172B]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#888888] mt-1.5">
              Target table: <span className="font-mono">{MODE_OPTIONS.find((o) => o.value === mode)?.table}</span>
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
              Prowess CSV
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              className="block w-full text-[12px] text-[#888888] cursor-pointer file:cursor-pointer file:mr-3 file:rounded-md file:border file:border-[#E2E2E2] file:bg-white file:px-3 file:py-1.5 file:text-[12px] file:font-medium file:text-[#0F172B] hover:file:border-[#0F172B] file:transition-colors"
            />
            {file && <p className="text-[11px] text-[#888888] mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
              Row Limit (optional)
            </label>
            <input
              value={rowLimit}
              onChange={(e) => handleRowLimitChange(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 500 for a smoke test"
              className="rounded-md border border-[#E2E2E2] px-3 py-2 text-sm font-mono text-[#0F172B] focus:outline-none focus:ring-1 focus:ring-[#0F172B] w-56"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-[#E2E2E2]">
            <button
              onClick={doPreview}
              disabled={!file || previewLoading}
              className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-4 py-2 text-sm font-medium text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-3"
            >
              {previewLoading && <Loader2 className="size-3.5 animate-spin" />}
              {previewReport ? "Re-run Preview" : "Preview"}
            </button>

            <button
              onClick={handleRunClick}
              disabled={!previewMatchesInputs || running}
              className="flex items-center gap-1.5 rounded-md bg-[#0F172B] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-3"
            >
              {running && <Loader2 className="size-3.5 animate-spin" />}
              {!running && <Upload className="size-3.5" />}
              Run Ingestion
            </button>

            <span className="text-[11px] text-[#888888] mt-3">
              {previewMatchesInputs ? "Preview matches current inputs." : "Run preview for these exact inputs first."}
            </span>
          </div>
        </div>
      </div>

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

      {previewReport && (
        isFinancialReport(previewReport)
          ? <FinancialReportView report={previewReport} />
          : <MarketReportView report={previewReport} />
      )}

      {showKpiCatalogue && <KpiCatalogueModal onClose={() => setShowKpiCatalogue(false)} />}
    </div>
  );
}
