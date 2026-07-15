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
              ? "bg-up-soft text-up"
              : "bg-down-soft text-down"
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
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-2 hover:text-ink transition-colors"
        >
          {open ? "▾" : "▸"} {title}
        </button>
        <span className="text-[10px] text-ink-3">({entries.length} kpis,</span>
        <span className="text-[10px] font-semibold text-down">{nullEntries.length} with nulls)</span>
        {open && (
          <button
            onClick={() => setNullOnly(v => !v)}
            className="ml-auto text-[10px] text-ink-3 hover:text-ink-2 transition-colors underline"
          >
            {nullOnly ? "show all" : "nulls only"}
          </button>
        )}
      </div>
      {open && (
        <div className="overflow-x-auto rounded border border-hair">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary border-b border-hair text-[10px] font-semibold text-ink-2 uppercase tracking-wide">
                <th className="px-3 py-2 text-left w-28">KPI</th>
                <th className="px-3 py-2 text-left">Description / Formula</th>
                <th className="px-3 py-2 text-left w-20">Type</th>
                <th className="px-3 py-2 text-left w-20">Nulls</th>
                <th className="px-3 py-2 text-left">Periods</th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {displayed.map(([abbr, kpi]) => {
                const { nulls, total } = valuesNullCount(kpi);
                const allNull = nulls === total && total > 0;
                const someNull = nulls > 0 && nulls < total;
                return (
                  <tr
                    key={abbr}
                    className={`border-b border-hair align-top ${
                      allNull
                        ? "bg-down-soft"
                        : someNull
                        ? "bg-warn-soft"
                        : ""
                    }`}
                  >
                    <td className="px-3 py-2">
                      <span className={`font-mono font-bold text-xs ${allNull ? "text-down" : someNull ? "text-warn" : "text-ink-2"}`}>
                        {abbr}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-ink-2 text-[11px] max-w-xs">
                      {kpi.description}
                      {kpi.formula && (
                        <div className="mt-0.5 font-mono text-[9px] text-ink-3 break-all">{kpi.formula}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-secondary text-ink-2">
                        {kpi.type ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {total > 0 ? (
                        <span className={`text-[10px] font-bold font-mono ${nulls === 0 ? "text-up" : nulls === total ? "text-down" : "text-warn"}`}>
                          {nulls}/{total}
                        </span>
                      ) : (
                        <span className="text-[10px] text-ink-3">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {kpi.values ? <Timeline values={kpi.values} /> : (
                        <span className={`text-[10px] font-mono ${kpi.value === null ? "text-down" : "text-up"}`}>
                          {kpi.value === null ? "null" : String(kpi.value)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-center text-xs text-up">
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
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-2 mb-1.5">{title}</p>
      <div className="overflow-x-auto rounded border border-hair">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-secondary border-b border-hair text-[10px] font-semibold text-ink-2 uppercase tracking-wide">
              <th className="px-3 py-2 text-left w-32">Key</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left w-20">Type</th>
              <th className="px-3 py-2 text-left w-20">Value</th>
              <th className="px-3 py-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-card">
            {entries.map(([key, kpi]) => {
              const isNull = kpi.value === null || kpi.value === undefined;
              return (
                <tr key={key} className={`border-b border-hair ${isNull ? "bg-down-soft" : ""}`}>
                  <td className={`px-3 py-2 font-mono font-bold ${isNull ? "text-down" : "text-ink-2"}`}>
                    {key}
                  </td>
                  <td className="px-3 py-2 text-ink-2 text-[11px]">
                    {kpi.description}
                    {kpi.formula && <div className="font-mono text-[9px] text-ink-3 break-all mt-0.5">{kpi.formula}</div>}
                    {kpi.source && <div className="text-[9px] text-ink-3 mt-0.5">source: {kpi.source}</div>}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-secondary text-ink-2">{kpi.type ?? "—"}</span>
                  </td>
                  <td className={`px-3 py-2 font-mono text-[11px] font-bold ${isNull ? "text-down" : "text-up"}`}>
                    {isNull ? "null" : String(kpi.value)}
                  </td>
                  <td className="px-3 py-2 text-[10px] text-ink-3 font-mono">
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
    <div className="rounded-lg border border-hair overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-secondary border-b border-hair text-left hover:bg-secondary transition-colors"
      >
        <span className="text-ink-3">{open ? "▾" : "▸"}</span>
        <span className="font-semibold text-sm text-ink">{title}</span>
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
    <div className="min-h-screen bg-secondary p-6">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3 mb-1">Admin · Debug</p>
          <h1 className="text-xl font-bold text-ink">Opportunity Stats</h1>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={callId}
            onChange={(e) => setCallId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchStats()}
            placeholder="callId — e.g. ABB_FY2026_Q2"
            className="flex-1 max-w-xs px-3 py-2 text-sm rounded-lg border border-hair bg-card text-ink focus:outline-none focus:ring-2 focus:ring-blue font-mono"
          />
          <button
            onClick={fetchStats}
            disabled={loading || !callId.trim()}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue hover:bg-blue text-[var(--qc-on-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Loading…" : "Fetch"}
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-down-soft border border-hair text-sm text-down">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Meta + null summary */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg bg-card border border-hair text-xs">
              <span className="font-mono font-bold text-ink">{data.subjectTicker}</span>
              <span className="text-ink-3">·</span>
              <span className="font-mono text-ink-2">{data.callId}</span>
              <span className="text-ink-3">·</span>
              <span className="text-ink-2">{data.industry}</span>
              {data.bfsi && <span className="px-1.5 py-0.5 rounded bg-blue-soft text-blue font-semibold">BFSI</span>}
              <div className="ml-auto flex items-center gap-2">
                {nullCounts && Object.entries(nullCounts).map(([sec, count]) =>
                  count > 0 ? (
                    <span key={sec} className="text-[10px] font-mono px-2 py-0.5 rounded bg-down-soft text-down font-bold">
                      {sec.replace("_", " ")}: {count}
                    </span>
                  ) : null
                )}
                {totalNulls === 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-up-soft text-up">0 nulls</span>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] text-ink-3">
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-down"></span> all null</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-warn"></span> partial nulls</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-up"></span> has value</span>
              <span className="text-ink-3">period chips: hover for value</span>
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3 mb-2">Q4 Only</p>
                    {s.financial_strength.q4_only.raw_kpis && <KpiMapTable title="Raw KPIs" kpis={s.financial_strength.q4_only.raw_kpis} />}
                    {s.financial_strength.q4_only.derived_kpis && <KpiMapTable title="Derived KPIs" kpis={s.financial_strength.q4_only.derived_kpis} />}
                  </div>
                )}
                {s.financial_strength.last_10_quarters && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3 mb-2">Last 10 Quarters</p>
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
                <div className="overflow-x-auto rounded border border-hair">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-secondary border-b border-hair text-[10px] font-semibold text-ink-2 uppercase tracking-wide">
                        <th className="px-3 py-2 text-left w-28">Name</th>
                        <th className="px-3 py-2 text-left">Expression</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card">
                      {Object.entries(data.formulae).map(([name, expr], i) => (
                        <tr key={name} className={`border-b border-hair ${i % 2 === 0 ? "" : "bg-secondary"}`}>
                          <td className="px-3 py-2 font-mono font-bold text-blue">{name}</td>
                          <td className="px-3 py-2 font-mono text-[10px] text-ink-2 break-all">{expr}</td>
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
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <span className="text-sm text-ink-2">Loading…</span>
      </div>
    }>
      <StatsContent />
    </Suspense>
  );
}
