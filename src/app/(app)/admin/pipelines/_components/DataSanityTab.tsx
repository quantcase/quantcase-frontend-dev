"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { rawFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { AutocompleteInput, AutocompleteOption } from "@/components/molecules/autocomplete-input";

interface Indicator {
  id: string;
  name: string;
  computationType: string;
  unit: string;
  desc?: string;
  formula?: unknown;
  inputs?: unknown;
}

interface PeriodEntry {
  period: string;
  fiscal_year: string;
  value: number;
}

interface DeltaEntry {
  curr: number | null;
  prev: number | null;
  delta: number | null;
}

interface IndicatorDetail {
  success: boolean;
  ticker: string;
  company?: string;
  metricId: string;
  name: string;
  unit: string;
  bfsi: boolean;
  value?: number;
  source: string;
  formula?: unknown;
  inputs?: unknown;
  inputValues?: Record<string, number | DeltaEntry>;
  seriesUsed?: PeriodEntry[];
  allPeriods?: PeriodEntry[];
  spanYears?: number;
  periods?: PeriodEntry[];
  windowSize?: number;
}

function fmtNum(v: number | null | undefined, unit: string): string {
  if (v == null) return "—";
  if (unit === "Cr") {
    const cr = v / 1e7;
    return `${cr.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`;
  }
  if (unit === "%") return `${v.toFixed(2)}%`;
  return v.toLocaleString("en-IN", { maximumFractionDigits: 4 });
}

function isDeltaEntry(v: unknown): v is DeltaEntry {
  return (
    typeof v === "object" &&
    v !== null &&
    "curr" in v &&
    "prev" in v &&
    "delta" in v
  );
}

function FormulaDisplay({ formula }: { formula: unknown }) {
  if (typeof formula === "string") {
    return <code className="text-xs font-mono text-[#0F172B]">{formula}</code>;
  }
  if (typeof formula === "object" && formula !== null) {
    return (
      <div className="space-y-0.5">
        {Object.entries(formula as Record<string, string>).map(([k, v]) => (
          <div key={k} className="flex gap-2 text-xs">
            <span className="text-[#888888] uppercase font-medium w-16 shrink-0">{k}:</span>
            <code className="font-mono text-[#0F172B]">{v}</code>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function PeriodTable({
  rows,
  unit,
  label,
  note,
}: {
  rows: PeriodEntry[];
  unit: string;
  label: string;
  note?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-1">
        {label}
        {note && <span className="normal-case tracking-normal ml-1 text-[#888888]">({note})</span>}
      </div>
      <div className="rounded-md border border-[var(--qc-border-default)] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[var(--qc-border-default)]">
              <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">Period</th>
              <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">Fiscal Year</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#888888]">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.period} className="border-b last:border-0">
                <td className="px-3 py-2 font-mono text-[#0F172B]">{row.period}</td>
                <td className="px-3 py-2 text-[#888888]">{row.fiscal_year}</td>
                <td className="px-3 py-2 text-right text-[#0F172B]">{fmtNum(row.value, unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetailView({ data }: { data: IndicatorDetail }) {
  const hasDelta =
    !!data.inputValues &&
    Object.values(data.inputValues).some(isDeltaEntry);
  const hasSeriesUsed = !!data.seriesUsed;
  const hasPeriods = !hasSeriesUsed && !!data.periods;

  return (
    <div className="rounded-[10px] border border-[var(--qc-border-default)] bg-white p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#888888] font-medium">
            {data.ticker} · {data.metricId}
          </div>
          <div className="text-[18px] font-[500] text-[#0F172B] mt-0.5">{data.name}</div>
          {data.company && (
            <div className="text-[12px] text-[#888888] mt-0.5">{data.company}</div>
          )}
        </div>
        {data.value != null && (
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-[#888888]">Value</div>
            <div className="text-[22px] font-[500] text-[#0F172B]">
              {fmtNum(data.value, data.unit)}
            </div>
          </div>
        )}
      </div>

      {/* Meta row */}
      <div className="flex gap-6 text-[12px] flex-wrap">
        <span>
          <span className="text-[#888888]">Source: </span>
          <span className="text-[#0F172B] font-medium">{data.source}</span>
        </span>
        <span>
          <span className="text-[#888888]">Unit: </span>
          <span className="text-[#0F172B] font-medium">{data.unit}</span>
        </span>
        <span>
          <span className="text-[#888888]">BFSI: </span>
          <span className="text-[#0F172B] font-medium">{data.bfsi ? "Yes" : "No"}</span>
        </span>
      </div>

      {/* Formula */}
      {!!data.formula && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-1">
            Formula
          </div>
          <div className="bg-[#F5F5F5] rounded-md px-3 py-2">
            <FormulaDisplay formula={data.formula} />
          </div>
        </div>
      )}

      {/* Formula type — inputValues: { key: number } */}
      {data.inputValues && !hasDelta && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-1">
            Input Values
          </div>
          <div className="rounded-md border border-[var(--qc-border-default)] overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[var(--qc-border-default)]">
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">
                    Input
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#888888]">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.inputValues).map(([k, v]) => (
                  <tr key={k} className="border-b last:border-0">
                    <td className="px-3 py-2 font-mono text-[#0F172B]">{k}</td>
                    <td className="px-3 py-2 text-right text-[#0F172B]">
                      {fmtNum(v as number, data.unit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delta type — inputValues: { key: { curr, prev, delta } } */}
      {data.inputValues && hasDelta && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-1">
            Input Components (Δ)
          </div>
          <div className="rounded-md border border-[var(--qc-border-default)] overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[var(--qc-border-default)]">
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">
                    Component
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#888888]">
                    Current
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#888888]">
                    Previous
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#888888]">
                    Delta
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.inputValues).map(([k, v]) => {
                  const e = v as DeltaEntry;
                  const deltaColor =
                    e.delta == null
                      ? "text-[#888888]"
                      : e.delta > 0
                      ? "text-emerald-600"
                      : e.delta < 0
                      ? "text-red-600"
                      : "text-[#888888]";
                  return (
                    <tr key={k} className="border-b last:border-0">
                      <td className="px-3 py-2 font-mono text-[#0F172B]">{k}</td>
                      <td className="px-3 py-2 text-right text-[#0F172B]">
                        {fmtNum(e.curr, data.unit)}
                      </td>
                      <td className="px-3 py-2 text-right text-[#888888]">
                        {fmtNum(e.prev, data.unit)}
                      </td>
                      <td className={`px-3 py-2 text-right font-medium ${deltaColor}`}>
                        {fmtNum(e.delta, data.unit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CAGR type */}
      {hasSeriesUsed && data.seriesUsed && (
        <div className="space-y-3">
          <PeriodTable
            rows={data.seriesUsed}
            unit={data.unit}
            label="Series Used (CAGR)"
            note={data.spanYears != null ? `${data.spanYears}y span` : undefined}
          />
          {data.allPeriods && data.allPeriods.length > data.seriesUsed.length && (
            <PeriodTable
              rows={data.allPeriods}
              unit={data.unit}
              label="All Periods"
            />
          )}
        </div>
      )}

      {/* Average type */}
      {hasPeriods && data.periods && (
        <PeriodTable
          rows={data.periods}
          unit={data.unit}
          label="Periods Used"
          note={data.windowSize != null ? `window ${data.windowSize}` : undefined}
        />
      )}
    </div>
  );
}

export function DataSanityTab() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loadingIndicators, setLoadingIndicators] = useState(false);
  const [indicatorError, setIndicatorError] = useState<string | null>(null);

  const [ticker, setTicker] = useState("");
  const [metricLabel, setMetricLabel] = useState("");
  const [selectedMetricId, setSelectedMetricId] = useState("");

  const [detail, setDetail] = useState<IndicatorDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    rawFetch<{ success: boolean; count: number; indicators: Indicator[] }>(
      `${BACKEND_URL}/admin/indicators`,
      {
        onStart: () => {
          setLoadingIndicators(true);
          setIndicatorError(null);
        },
        onSuccess: (res) => setIndicators(res.indicators ?? []),
        onError: (err) => setIndicatorError(err),
        onComplete: () => setLoadingIndicators(false),
      }
    );
  }, []);

  const options: AutocompleteOption[] = indicators.map((ind) => ({
    value: ind.id,
    label: ind.name,
    subtitle: ind.desc ?? `${ind.computationType} · ${ind.unit}`,
  }));

  function fetchDetail(metricId: string) {
    const t = ticker.trim().toUpperCase();
    if (!t || !metricId) return;
    rawFetch<IndicatorDetail>(
      `${BACKEND_URL}/admin/indicators/${t}/${metricId}`,
      {
        onStart: () => {
          setLoadingDetail(true);
          setDetail(null);
          setDetailError(null);
        },
        onSuccess: (res) => setDetail(res),
        onError: (err) => setDetailError(err),
        onComplete: () => setLoadingDetail(false),
      }
    );
  }

  function handleMetricSelect(metricId: string) {
    setSelectedMetricId(metricId);
    fetchDetail(metricId);
  }

  function handleTickerKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && selectedMetricId) fetchDetail(selectedMetricId);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-3 items-end">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-1.5 block">
            Ticker
          </label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyDown={handleTickerKeyDown}
            placeholder="e.g. TCS"
            className="px-3 py-2 text-sm rounded-md border border-[var(--qc-border-default)] bg-white text-[var(--qc-text-heading)] placeholder:text-[#888888] focus:outline-none focus:ring-1 focus:ring-[#0F172B] w-36 h-[58px]"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-1.5 block">
            Indicator
            {loadingIndicators && (
              <span className="normal-case tracking-normal font-normal ml-1 text-[#888888]">
                — loading…
              </span>
            )}
          </label>
          {indicatorError ? (
            <p className="text-sm text-red-600">{indicatorError}</p>
          ) : (
            <AutocompleteInput
              placeholder={loadingIndicators ? "Loading…" : "Search indicator…"}
              value={metricLabel}
              onChange={setMetricLabel}
              onSubmit={handleMetricSelect}
              options={options}
              maxSuggestions={22}
            />
          )}
        </div>
      </div>

      {/* Loading / error */}
      {loadingDetail && (
        <div className="flex items-center gap-2 text-sm text-[#888888]">
          <Loader2 className="size-4 animate-spin" /> Fetching provenance…
        </div>
      )}
      {detailError && !loadingDetail && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {detailError}
        </div>
      )}

      {/* Result */}
      {detail && !loadingDetail && <DetailView data={detail} />}
    </div>
  );
}
