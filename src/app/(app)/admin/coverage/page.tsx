"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { rawFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";

// ── Types ──────────────────────────────────────────────────────────────────────

interface FailedChunk {
  chunk?: string;
  error?: string;
  [key: string]: unknown;
}

interface CoverageRecord {
  fiscal_year: string;
  quarter?: string;
  url_present: boolean;
  signal_present: boolean;
  failed_chunks: FailedChunk[];
}

interface CompanyData {
  transcript: CoverageRecord[];
  ppt: CoverageRecord[];
  annual_report: CoverageRecord[];
}

interface CoverageResponse {
  filter: { from: string; to: string };
  companies: Record<string, CompanyData>;
}

interface SourceStat { total: number; gaps: number; }

interface ProcessedCompany {
  ticker: string;
  data: CompanyData;
  transcript: SourceStat;
  ppt: SourceStat;
  annual: SourceStat;
  totalGaps: number;
}

function hasGap(r: CoverageRecord): boolean {
  return !r.url_present || !r.signal_present || r.failed_chunks.length > 0;
}

function sourceStat(records: CoverageRecord[]): SourceStat {
  return { total: records.length, gaps: records.filter(hasGap).length };
}

function buildCompanies(data: CoverageResponse): ProcessedCompany[] {
  return Object.entries(data.companies)
    .map(([ticker, d]) => {
      const transcript = sourceStat(d.transcript ?? []);
      const ppt = sourceStat(d.ppt ?? []);
      const annual = sourceStat(d.annual_report ?? []);
      return { ticker, data: d, transcript, ppt, annual, totalGaps: transcript.gaps + ppt.gaps + annual.gaps };
    })
    .filter((c) => c.transcript.total + c.ppt.total + c.annual.total > 0)
    .sort((a, b) => b.totalGaps - a.totalGaps || a.ticker.localeCompare(b.ticker));
}

// ── Shared table cell helpers ──────────────────────────────────────────────────

function BoolCell({ value }: { value: boolean }) {
  return (
    <td className={`px-3 py-1.5 text-center text-[11px] font-medium ${value ? "text-emerald-600" : "text-red-600"}`}>
      {value ? "✓" : "✗"}
    </td>
  );
}

function ChunksCell({ chunks }: { chunks: FailedChunk[] }) {
  if (chunks.length === 0) {
    return <td className="px-3 py-1.5 text-center text-[11px] text-[#C8C8C8]">—</td>;
  }
  const title = chunks.map((c) => c.error ?? JSON.stringify(c)).join("\n");
  return (
    <td className="px-3 py-1.5 text-center text-[11px] font-medium text-red-600" title={title}>
      {chunks.length} failed
    </td>
  );
}

// ── Source table (unified for all three sources) ───────────────────────────────

const TH = "px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888]";
const TH_C = "px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#888888]";

function SourceTable({ records, label, quarterly }: { records: CoverageRecord[]; label: string; quarterly: boolean }) {
  if (records.length === 0) return null;
  const gaps = records.filter(hasGap).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">{label}</span>
        <span className="text-[10px] text-[#C8C8C8]">{records.length} records</span>
        {gaps > 0 && (
          <span className="text-[10px] font-semibold text-amber-600">{gaps} gap{gaps !== 1 ? "s" : ""}</span>
        )}
      </div>
      <div className="rounded-md border border-[#E2E2E2] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[#E2E2E2]">
              <th className={TH}>Year</th>
              {quarterly && <th className={TH}>Quarter</th>}
              <th className={TH_C}>URL</th>
              <th className={TH_C}>Signal</th>
              <th className={TH_C}>Chunks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0] bg-white">
            {records.map((r, i) => (
              <tr key={i} className={hasGap(r) ? "bg-amber-50/40 hover:bg-amber-50/60" : "hover:bg-[#FAFAFA]"}>
                <td className="px-3 py-1.5 font-mono text-[11px] text-[#888888]">{r.fiscal_year}</td>
                {quarterly && (
                  <td className="px-3 py-1.5 font-mono text-[11px] text-[#888888]">{r.quarter}</td>
                )}
                <BoolCell value={r.url_present} />
                <BoolCell value={r.signal_present} />
                <ChunksCell chunks={r.failed_chunks} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Source badge (collapsed card header) ──────────────────────────────────────

function SourceBadge({ label, s }: { label: string; s: SourceStat }) {
  if (s.total === 0) return (
    <span className="flex items-center gap-1">
      <span className="text-[10px] text-[#C8C8C8] font-medium uppercase">{label}</span>
      <span className="text-[10px] text-[#C8C8C8]">—</span>
    </span>
  );
  return (
    <span className="flex items-center gap-1">
      <span className="text-[10px] text-[#888888] font-medium uppercase">{label}</span>
      {s.gaps === 0
        ? <CheckCircle2 className="size-3 text-emerald-500" />
        : <span className={`text-[10px] font-semibold ${s.gaps > 10 ? "text-red-600" : "text-amber-600"}`}>{s.gaps}</span>
      }
    </span>
  );
}

// ── Company card ───────────────────────────────────────────────────────────────

function CompanyCard({ company }: { company: ProcessedCompany }) {
  const [open, setOpen] = useState(false);
  const hasAnyGap = company.totalGaps > 0;

  return (
    <div className={`rounded-[8px] border bg-white overflow-hidden ${hasAnyGap ? "border-[#E2E2E2]" : "border-[#F0F0F0]"}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-[#FAFAFA] transition-colors text-left"
      >
        <span className={`font-mono text-[13px] font-medium shrink-0 w-32 ${hasAnyGap ? "text-[#0F172B]" : "text-[#888888]"}`}>
          {company.ticker}
        </span>
        <div className="flex items-center gap-5 flex-1">
          <SourceBadge label="T" s={company.transcript} />
          <SourceBadge label="P" s={company.ppt} />
          <SourceBadge label="A" s={company.annual} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasAnyGap ? (
            <span className={`text-[11px] font-semibold ${company.totalGaps > 10 ? "text-red-600" : "text-amber-600"}`}>
              {company.totalGaps} gap{company.totalGaps !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-[11px] text-emerald-600 font-medium">clear</span>
          )}
          <ChevronDown className={`size-4 text-[#888888] transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-[#F0F0F0] px-4 py-4 bg-[#FAFAFA] space-y-5">
          <SourceTable records={company.data.transcript ?? []} label="Transcript" quarterly />
          <SourceTable records={company.data.ppt ?? []} label="PPT" quarterly />
          <SourceTable records={company.data.annual_report ?? []} label="Annual Report" quarterly={false} />
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CoveragePage() {
  const [inputFrom, setInputFrom] = useState("A");
  const [inputTo, setInputTo] = useState("Z");
  const [from, setFrom] = useState("A");
  const [to, setTo] = useState("Z");
  const [companies, setCompanies] = useState<ProcessedCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    rawFetch<CoverageResponse>(
      `${BACKEND_URL}/api/pipeline/coverage?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      {
        onStart: () => { setLoading(true); setError(null); },
        onSuccess: (res) => setCompanies(buildCompanies(res)),
        onError: setError,
        onComplete: () => setLoading(false),
      }
    );
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  function commit() {
    setFrom(inputFrom.trim().toUpperCase() || "A");
    setTo(inputTo.trim().toUpperCase() || "Z");
  }

  const withGaps = companies.filter((c) => c.totalGaps > 0);
  const healthy = companies.filter((c) => c.totalGaps === 0);
  const totalGaps = companies.reduce((a, c) => a + c.totalGaps, 0);

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <div>
        <h1 className="text-[22px] font-[400] text-[var(--qc-ink)]">Pipeline Coverage</h1>
        <p className="text-[14px] text-[var(--qc-ink-2)] mt-0.5">Signal and transcript coverage by ticker range</p>
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">From</label>
          <input
            value={inputFrom}
            onChange={(e) => setInputFrom(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            onBlur={commit}
            className="w-24 rounded-md border border-[#E2E2E2] px-3 py-2 text-sm font-mono text-[#0F172B] uppercase focus:outline-none focus:ring-1 focus:ring-[#0F172B]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">To</label>
          <input
            value={inputTo}
            onChange={(e) => setInputTo(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            onBlur={commit}
            className="w-24 rounded-md border border-[#E2E2E2] px-3 py-2 text-sm font-mono text-[#0F172B] uppercase focus:outline-none focus:ring-1 focus:ring-[#0F172B]"
          />
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-3 py-2 text-sm text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Refresh
        </button>
        {!loading && !error && companies.length > 0 && (
          <span className="text-[12px] text-[#888888] pb-2">
            {companies.length} companies ·{" "}
            <span className={totalGaps > 0 ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>
              {totalGaps > 0 ? `${totalGaps} gaps` : "all clear"}
            </span>
          </span>
        )}
      </div>

      {error && !loading && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 rounded-[8px] bg-[#F5F5F5] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && companies.length > 0 && (
        <div className="space-y-1.5">
          {withGaps.map((c) => <CompanyCard key={c.ticker} company={c} />)}

          {withGaps.length > 0 && healthy.length > 0 && (
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 border-t border-[#E2E2E2]" />
              <span className="text-[10px] uppercase tracking-wider text-[#888888] font-semibold shrink-0">
                {healthy.length} healthy
              </span>
              <div className="flex-1 border-t border-[#E2E2E2]" />
            </div>
          )}

          {healthy.map((c) => <CompanyCard key={c.ticker} company={c} />)}
        </div>
      )}
    </div>
  );
}
