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
        <div className="flex items-center gap-2 rounded-md border border-up bg-up-soft px-4 py-3 text-sm text-up">
          <CheckCircle2 className="size-4 shrink-0" />
          Inserted {report.insertStats.inserted} of {report.insertStats.attempted} rows
          {report.insertStats.skipped > 0 ? ` — ${report.insertStats.skipped} skipped (already present)` : ""}.
        </div>
      )}

      {report.unmatchedColumns.length > 0 && (
        <div className="rounded-md border border-warn bg-warn-soft px-4 py-3 text-[12px] text-warn space-y-1.5">
          <p className="font-medium">
            {report.unmatchedColumns.length} column{report.unmatchedColumns.length === 1 ? "" : "s"} unmatched to any KPI
          </p>
          <p className="text-warn">
            These rows will be skipped on run. Add a KPI for each (matching its exact CSV column name as
            &quot;Prowess Name&quot;) via the KPI Catalogue, then re-run preview.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {report.unmatchedColumns.map((c) => (
              <span key={c} className="rounded-sm bg-card border border-warn px-2 py-0.5 font-mono text-[11px]">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {sourceTypeEntries.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-3 mb-1.5">Rows by Source Type</p>
          <div className="flex flex-wrap gap-1.5">
            {sourceTypeEntries.map(([k, v]) => (
              <span key={k} className="rounded-sm bg-secondary border border-hair px-2 py-1 text-[11px] text-ink">
                <span className="font-mono font-medium">{k}</span> — {v.toLocaleString("en-IN")}
              </span>
            ))}
          </div>
        </div>
      )}

      {indicatorEntries.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-3 mb-1.5">Matched Indicators</p>
          <div className="rounded-[10px] border border-hair bg-card overflow-hidden max-h-[180px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0">
                <tr className="bg-secondary border-b border-hair">
                  <th className="px-3 py-1.5 text-left text-[10px] uppercase tracking-wider text-ink-3">CSV Column</th>
                  <th className="px-3 py-1.5 text-left text-[10px] uppercase tracking-wider text-ink-3">KPI Abbr</th>
                </tr>
              </thead>
              <tbody>
                {indicatorEntries.map(([col, abbr]) => (
                  <tr key={col} className="border-b border-hair last:border-0">
                    <td className="px-3 py-1.5 text-ink">{col}</td>
                    <td className="px-3 py-1.5 text-ink-3 font-mono">{abbr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {kpiEntries.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-3 mb-1.5">Rows by KPI</p>
          <div className="rounded-[10px] border border-hair bg-card overflow-hidden max-h-[180px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0">
                <tr className="bg-secondary border-b border-hair">
                  <th className="px-3 py-1.5 text-left text-[10px] uppercase tracking-wider text-ink-3">KPI</th>
                  <th className="px-3 py-1.5 text-right text-[10px] uppercase tracking-wider text-ink-3">Rows</th>
                </tr>
              </thead>
              <tbody>
                {kpiEntries.map(([abbr, count]) => (
                  <tr key={abbr} className="border-b border-hair last:border-0">
                    <td className="px-3 py-1.5 text-ink font-mono">{abbr}</td>
                    <td className="px-3 py-1.5 text-right text-ink-3">{count.toLocaleString("en-IN")}</td>
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
        <div className="flex items-center gap-2 rounded-md border border-up bg-up-soft px-4 py-3 text-sm text-up">
          <CheckCircle2 className="size-4 shrink-0" />
          Inserted {report.insertStats.inserted} of {report.insertStats.attempted} rows attempted.
        </div>
      )}

      {report.skippedName > 0 && (
        <p className="text-[12px] text-ink-3">
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
        <p className="text-[12px] text-ink-3 max-w-xl">
          Upload a Prowess CSV export to preview, then insert. Preview never writes to the DB — always
          review the report (and resolve any unmatched columns) before running.
        </p>
        <button
          onClick={() => setShowKpiCatalogue(true)}
          className="rounded-md border border-hair bg-card px-3 py-1.5 text-[12px] font-medium text-ink hover:border-[var(--qc-ink)] transition-colors shrink-0"
        >
          KPI Catalogue
        </button>
      </div>

      <div className="rounded-[10px] border border-hair bg-secondary p-2">
        <div className="rounded-[10px] bg-card border border-[rgba(226,226,226,0.10)] p-4 space-y-4">
          <div>
            <p className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">Mode</p>
            <div className="flex gap-2 flex-wrap">
              {MODE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectMode(opt.value)}
                  className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    mode === opt.value
                      ? "border-[var(--qc-ink)] bg-ink text-[var(--qc-on-dark)]"
                      : "border-hair text-ink hover:border-[var(--qc-ink)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-3 mt-1.5">
              Target table: <span className="font-mono">{MODE_OPTIONS.find((o) => o.value === mode)?.table}</span>
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
              Prowess CSV
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              className="block w-full text-[12px] text-ink-3 cursor-pointer file:cursor-pointer file:mr-3 file:rounded-md file:border file:border-hair file:bg-card file:px-3 file:py-1.5 file:text-[12px] file:font-medium file:text-ink hover:file:border-[var(--qc-ink)] file:transition-colors"
            />
            {file && <p className="text-[11px] text-ink-3 mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
              Row Limit (optional)
            </label>
            <input
              value={rowLimit}
              onChange={(e) => handleRowLimitChange(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 500 for a smoke test"
              className="rounded-md border border-hair px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:border-hair-strong w-56"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-hair">
            <button
              onClick={doPreview}
              disabled={!file || previewLoading}
              className="flex items-center gap-1.5 rounded-md border border-hair px-4 py-2 text-sm font-medium text-ink hover:border-[var(--qc-ink)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-3"
            >
              {previewLoading && <Loader2 className="size-3.5 animate-spin" />}
              {previewReport ? "Re-run Preview" : "Preview"}
            </button>

            <button
              onClick={handleRunClick}
              disabled={!previewMatchesInputs || running}
              className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-3"
            >
              {running && <Loader2 className="size-3.5 animate-spin" />}
              {!running && <Upload className="size-3.5" />}
              Run Ingestion
            </button>

            <span className="text-[11px] text-ink-3 mt-3">
              {previewMatchesInputs ? "Preview matches current inputs." : "Run preview for these exact inputs first."}
            </span>
          </div>
        </div>
      </div>

      {previewError && !previewLoading && (
        <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
          <AlertCircle className="size-4 shrink-0" /> {previewError}
        </div>
      )}
      {runError && (
        <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
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
