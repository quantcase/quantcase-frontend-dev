"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { rawFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";

// ── Types ──────────────────────────────────────────────────────────────────

interface KpiValue {
  callId: string;
  period: string;
  value: number | null;
  abbrUsed?: string | null;
}

interface KpiEntry {
  description?: string;
  type?: string;
  formula?: string;
  source?: string;
  // timeseries KPIs
  values?: KpiValue[];
  // single-value KPIs (competition, customer_traction)
  value?: number | null;
  periodsUsed?: number;
  spanYears?: number;
  tickerCount?: number;
  validTickerCount?: number;
  tickers?: string[];
  [key: string]: unknown;
}

type KpiMap = Record<string, KpiEntry>;

interface KpiGroup {
  description?: string;
  raw_kpis?: KpiMap;
  derived_kpis?: KpiMap;
}

interface StatsResponse {
  success: boolean;
  callId: string;
  subjectTicker: string;
  industry: string;
  bfsi: boolean;
  formulae?: Record<string, string>;
  sections?: {
    industry?: KpiGroup & { filter?: string; peers_discovered?: string[] };
    competition?: { description?: string; subject?: KpiMap; industry?: KpiMap };
    financial_strength?: { description?: string; q4_only?: KpiGroup; last_10_quarters?: KpiGroup };
    customer_traction?: Record<string, KpiEntry | string | undefined>;
  };
}

// ── Null-detection helpers ─────────────────────────────────────────────────

function valuesNullCount(kpi: KpiEntry): { nulls: number; total: number } {
  if (!kpi.values) return { nulls: 0, total: 0 };
  const nulls = kpi.values.filter(v => v.value === null).length;
  return { nulls, total: kpi.values.length };
}

function isSingleValueNull(kpi: KpiEntry): boolean {
  return !kpi.values && kpi.value === null;
}

// ── Sub-components ─────────────────────────────────────────────────────────

/** Mini timeline: coloured period chips for a timeseries KPI */
function Timeline({ values }: { values: KpiValue[] }) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {values.map((v) => (
        <span
          key={v.callId}
          title={`${v.period}: ${v.value ?? "null"}`}
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold leading-none ${
            v.value !== null
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
              : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          }`}
        >
          {v.period.replace("FY", "").replace("-", " ")}
        </span>
      ))}
    </div>
  );
}

/** A table of KPIs from a raw_kpis / derived_kpis map */
function KpiMapTable({
  title,
  kpis,
  defaultNullOnly = true,
}: {
  title: string;
  kpis: KpiMap;
  defaultNullOnly?: boolean;
}) {
  const [nullOnly, setNullOnly] = useState(defaultNullOnly);
  const [open, setOpen] = useState(true);

  const entries = Object.entries(kpis);
  const nullEntries = entries.filter(([, k]) => {
    if (k.values) return valuesNullCount(k).nulls > 0;
    return isSingleValueNull(k);
  });

  const displayed = nullOnly ? nullEntries : entries;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          {open ? "▾" : "▸"} {title}
        </button>
        <span className="text-[10px] text-zinc-400">({entries.length} kpis,</span>
        <span className="text-[10px] font-semibold text-red-500">{nullEntries.length} with nulls)</span>
        {open && (
          <button
            onClick={() => setNullOnly(v => !v)}
            className="ml-auto text-[10px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors underline"
          >
            {nullOnly ? "show all" : "nulls only"}
          </button>
        )}
      </div>
      {open && (
        <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                <th className="px-3 py-2 text-left w-28">KPI</th>
                <th className="px-3 py-2 text-left">Description / Formula</th>
                <th className="px-3 py-2 text-left w-20">Type</th>
                <th className="px-3 py-2 text-left w-20">Nulls</th>
                <th className="px-3 py-2 text-left">Periods</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900">
              {displayed.map(([abbr, kpi]) => {
                const { nulls, total } = valuesNullCount(kpi);
                const allNull = nulls === total && total > 0;
                const someNull = nulls > 0 && nulls < total;
                return (
                  <tr
                    key={abbr}
                    className={`border-b border-zinc-100 dark:border-zinc-800 align-top ${
                      allNull
                        ? "bg-red-50/60 dark:bg-red-900/10"
                        : someNull
                        ? "bg-yellow-50/60 dark:bg-yellow-900/10"
                        : ""
                    }`}
                  >
                    <td className="px-3 py-2">
                      <span className={`font-mono font-bold text-xs ${allNull ? "text-red-600 dark:text-red-400" : someNull ? "text-yellow-600 dark:text-yellow-400" : "text-zinc-600 dark:text-zinc-400"}`}>
                        {abbr}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400 text-[11px] max-w-xs">
                      {kpi.description}
                      {kpi.formula && (
                        <div className="mt-0.5 font-mono text-[9px] text-zinc-400 break-all">{kpi.formula}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {kpi.type ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {total > 0 ? (
                        <span className={`text-[10px] font-bold font-mono ${nulls === 0 ? "text-emerald-600" : nulls === total ? "text-red-500" : "text-yellow-600"}`}>
                          {nulls}/{total}
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {kpi.values ? <Timeline values={kpi.values} /> : (
                        <span className={`text-[10px] font-mono ${kpi.value === null ? "text-red-500" : "text-emerald-600"}`}>
                          {kpi.value === null ? "null" : String(kpi.value)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-center text-xs text-emerald-600 dark:text-emerald-400">
                    All values present ✓
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** Single-value KPI map (competition subject/industry, customer_traction) */
function SingleValueTable({ title, kpis }: { title: string; kpis: KpiMap }) {
  const entries = Object.entries(kpis);
  if (entries.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">{title}</p>
      <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
              <th className="px-3 py-2 text-left w-32">Key</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left w-20">Type</th>
              <th className="px-3 py-2 text-left w-20">Value</th>
              <th className="px-3 py-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900">
            {entries.map(([key, kpi]) => {
              const isNull = kpi.value === null || kpi.value === undefined;
              return (
                <tr key={key} className={`border-b border-zinc-100 dark:border-zinc-800 ${isNull ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}>
                  <td className={`px-3 py-2 font-mono font-bold ${isNull ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400"}`}>
                    {key}
                  </td>
                  <td className="px-3 py-2 text-zinc-500 text-[11px]">
                    {kpi.description}
                    {kpi.formula && <div className="font-mono text-[9px] text-zinc-400 break-all mt-0.5">{kpi.formula}</div>}
                    {kpi.source && <div className="text-[9px] text-zinc-400 mt-0.5">source: {kpi.source}</div>}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{kpi.type ?? "—"}</span>
                  </td>
                  <td className={`px-3 py-2 font-mono text-[11px] font-bold ${isNull ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {isNull ? "null" : String(kpi.value)}
                  </td>
                  <td className="px-3 py-2 text-[10px] text-zinc-400 font-mono">
                    {kpi.periodsUsed !== undefined && <span>periods={kpi.periodsUsed} </span>}
                    {kpi.spanYears !== undefined && <span>span={kpi.spanYears}y </span>}
                    {kpi.tickerCount !== undefined && <span>tickers={kpi.validTickerCount}/{kpi.tickerCount}</span>}
                    {kpi.tickers && <div>{(kpi.tickers as string[]).join(", ")}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors"
      >
        <span className="text-zinc-400">{open ? "▾" : "▸"}</span>
        <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{title}</span>
      </button>
      {open && <div className="px-4 py-4">{children}</div>}
    </div>
  );
}

// ── Null counter helpers ───────────────────────────────────────────────────

function countNullsInGroup(group?: KpiGroup): number {
  if (!group) return 0;
  let n = 0;
  for (const kpi of Object.values(group.raw_kpis ?? {})) {
    n += valuesNullCount(kpi).nulls;
  }
  for (const kpi of Object.values(group.derived_kpis ?? {})) {
    n += valuesNullCount(kpi).nulls;
  }
  return n;
}

function countNullsInMap(map?: KpiMap): number {
  if (!map) return 0;
  return Object.values(map).filter(k => isSingleValueNull(k) || valuesNullCount(k).nulls > 0).length;
}

// ── Main ───────────────────────────────────────────────────────────────────

function StatsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [callId, setCallId] = useState(searchParams.get("callId") ?? "");
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = () => {
    if (!callId.trim()) return;
    setError(null);
    setData(null);
    router.replace(`?callId=${encodeURIComponent(callId.trim())}`);
    rawFetch<StatsResponse>(
      `${BACKEND_URL}/admin/opportunity/stats?callId=${encodeURIComponent(callId.trim())}`,
      {
        onStart: () => setLoading(true),
        onSuccess: (res) => setData(res),
        onError: (err) => setError(err),
        onComplete: () => setLoading(false),
      }
    );
  };

  const s = data?.sections;

  // Null summary counts
  const nullCounts = data ? {
    industry: countNullsInGroup(s?.industry),
    competition: countNullsInMap(s?.competition?.subject) + countNullsInMap(s?.competition?.industry),
    financial_strength:
      countNullsInGroup(s?.financial_strength?.q4_only) +
      countNullsInGroup(s?.financial_strength?.last_10_quarters),
    customer_traction: countNullsInMap(
      s?.customer_traction as KpiMap | undefined
    ),
  } : null;

  const totalNulls = nullCounts
    ? Object.values(nullCounts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Admin · Debug</p>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Opportunity Stats</h1>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={callId}
            onChange={(e) => setCallId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchStats()}
            placeholder="callId — e.g. ABB_FY2026_Q2"
            className="flex-1 max-w-xs px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <button
            onClick={fetchStats}
            disabled={loading || !callId.trim()}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Loading…" : "Fetch"}
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Meta + null summary */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{data.subjectTicker}</span>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span className="font-mono text-zinc-500">{data.callId}</span>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-zinc-500">{data.industry}</span>
              {data.bfsi && <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 font-semibold">BFSI</span>}
              <div className="ml-auto flex items-center gap-2">
                {nullCounts && Object.entries(nullCounts).map(([sec, count]) =>
                  count > 0 ? (
                    <span key={sec} className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold">
                      {sec.replace("_", " ")}: {count}
                    </span>
                  ) : null
                )}
                {totalNulls === 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">0 nulls</span>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-red-400"></span> all null</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-yellow-400"></span> partial nulls</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-emerald-400"></span> has value</span>
              <span className="text-zinc-300 dark:text-zinc-600">period chips: hover for value</span>
            </div>

            {/* 4.1 Industry */}
            {s?.industry && (
              <SectionPanel title={`4.1 Industry${s.industry.peers_discovered ? `  ·  peers: ${s.industry.peers_discovered.join(", ")}` : ""}${s.industry.filter ? `  ·  filter: ${s.industry.filter}` : ""}`}>
                {s.industry.raw_kpis && <KpiMapTable title="Raw KPIs" kpis={s.industry.raw_kpis} />}
                {s.industry.derived_kpis && <KpiMapTable title="Derived KPIs" kpis={s.industry.derived_kpis} />}
              </SectionPanel>
            )}

            {/* 4.2 Competition */}
            {s?.competition && (
              <SectionPanel title="4.2 Competition">
                {s.competition.subject && <SingleValueTable title="Subject" kpis={s.competition.subject} />}
                {s.competition.industry && <SingleValueTable title="Industry" kpis={s.competition.industry} />}
              </SectionPanel>
            )}

            {/* 4.3 Financial Strength */}
            {s?.financial_strength && (
              <SectionPanel title="4.3 Financial Strength">
                {s.financial_strength.q4_only && (
                  <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Q4 Only</p>
                    {s.financial_strength.q4_only.raw_kpis && <KpiMapTable title="Raw KPIs" kpis={s.financial_strength.q4_only.raw_kpis} />}
                    {s.financial_strength.q4_only.derived_kpis && <KpiMapTable title="Derived KPIs" kpis={s.financial_strength.q4_only.derived_kpis} />}
                  </div>
                )}
                {s.financial_strength.last_10_quarters && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Last 10 Quarters</p>
                    {s.financial_strength.last_10_quarters.raw_kpis && <KpiMapTable title="Raw KPIs" kpis={s.financial_strength.last_10_quarters.raw_kpis} />}
                    {s.financial_strength.last_10_quarters.derived_kpis && <KpiMapTable title="Derived KPIs" kpis={s.financial_strength.last_10_quarters.derived_kpis} />}
                  </div>
                )}
              </SectionPanel>
            )}

            {/* 4.4 Customer Traction */}
            {s?.customer_traction && (
              <SectionPanel title="4.4 Customer Traction">
                <SingleValueTable
                  title="KPIs"
                  kpis={Object.fromEntries(
                    Object.entries(s.customer_traction).filter(([k, v]) => k !== "description" && typeof v === "object" && v !== null)
                  ) as KpiMap}
                />
              </SectionPanel>
            )}

            {/* Formulae */}
            {data.formulae && (
              <SectionPanel title={`Formulae (${Object.keys(data.formulae).length})`}>
                <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-700">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                        <th className="px-3 py-2 text-left w-28">Name</th>
                        <th className="px-3 py-2 text-left">Expression</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900">
                      {Object.entries(data.formulae).map(([name, expr], i) => (
                        <tr key={name} className={`border-b border-zinc-100 dark:border-zinc-800 ${i % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-800/30"}`}>
                          <td className="px-3 py-2 font-mono font-bold text-blue-700 dark:text-blue-400">{name}</td>
                          <td className="px-3 py-2 font-mono text-[10px] text-zinc-500 break-all">{expr}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionPanel>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function OpportunityStatsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <span className="text-sm text-zinc-500">Loading…</span>
      </div>
    }>
      <StatsContent />
    </Suspense>
  );
}
