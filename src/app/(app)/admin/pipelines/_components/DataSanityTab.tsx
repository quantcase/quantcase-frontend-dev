"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { rawFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { AutocompleteInput, AutocompleteOption } from "@/components/molecules/autocomplete-input";
import { TabToggle } from "@/components/molecules/tab-toggle";

type Granularity = "annual" | "quarterly";

interface Indicator {
  id: string;
  name: string;
  computationType: string;
  unit: string;
  desc?: string;
  formula?: unknown;
  inputs?: unknown;
}

// Entry in the new data[] array (raw / formula / delta types)
interface PeriodDataEntry {
  fiscal_year: string;
  quarter: string;
  value?: number;
  source: string;
  formula?: unknown;
  inputs?: unknown;
  inputValues?: Record<string, number | DeltaEntry>;
}

// cagr / average period row
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

interface FiscalPeriod {
  fiscal_year: string;
  quarter: string;
}

interface IndicatorDetail {
  success: boolean;
  ticker: string;
  company?: string;
  metricId: string;
  name: string;
  unit: string;
  bfsi: boolean;
  granularity?: Granularity;
  // New array format (raw / formula / delta types)
  data?: PeriodDataEntry[];
  // Legacy single-value (kept for cagr / average types, which are unchanged)
  value?: number;
  source?: string;
  formula?: unknown;
  inputs?: unknown;
  inputValues?: Record<string, number | DeltaEntry>;
  currentPeriod?: FiscalPeriod;
  prevPeriod?: FiscalPeriod;
  // cagr
  seriesUsed?: PeriodEntry[];
  allPeriods?: PeriodEntry[];
  spanYears?: number;
  // average
  periods?: PeriodEntry[];
  windowSize?: number;
}

// Backend now returns values already in the correct unit (Cr, %, etc.)
function fmtNum(v: number | null | undefined, unit: string): string {
  if (v == null) return "—";
  if (unit === "Cr") return `${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`;
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
    return <code className="text-xs font-mono text-ink">{formula}</code>;
  }
  if (typeof formula === "object" && formula !== null) {
    return (
      <div className="space-y-0.5">
        {Object.entries(formula as Record<string, string>).map(([k, v]) => (
          <div key={k} className="flex gap-2 text-xs">
            <span className="text-ink-3 uppercase font-medium w-16 shrink-0">{k}:</span>
            <code className="font-mono text-ink">{v}</code>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function InputValuesTable({
  inputValues,
  unit,
}: {
  inputValues: Record<string, number | DeltaEntry>;
  unit: string;
}) {
  const hasDelta = Object.values(inputValues).some(isDeltaEntry);

  if (hasDelta) {
    return (
      <div className="rounded-md border border-[var(--qc-border-default)] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-secondary border-b border-[var(--qc-border-default)]">
              <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Component</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-ink-3">Current</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-ink-3">Previous</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-ink-3">Delta</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(inputValues).map(([k, v]) => {
              const e = v as DeltaEntry;
              const deltaColor =
                e.delta == null ? "text-ink-3" :
                e.delta > 0 ? "text-up" :
                e.delta < 0 ? "text-down" : "text-ink-3";
              return (
                <tr key={k} className="border-b last:border-0">
                  <td className="px-3 py-2 font-mono text-ink">{k}</td>
                  <td className="px-3 py-2 text-right text-ink">{fmtNum(e.curr, unit)}</td>
                  <td className="px-3 py-2 text-right text-ink-3">{fmtNum(e.prev, unit)}</td>
                  <td className={`px-3 py-2 text-right font-medium ${deltaColor}`}>{fmtNum(e.delta, unit)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[var(--qc-border-default)] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-secondary border-b border-[var(--qc-border-default)]">
            <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Input</th>
            <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-ink-3">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(inputValues).map(([k, v]) => (
            <tr key={k} className="border-b last:border-0">
              <td className="px-3 py-2 font-mono text-ink">{k}</td>
              <td className="px-3 py-2 text-right text-ink">{fmtNum(v as number, unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PeriodSection({ entry, unit }: { entry: PeriodDataEntry; unit: string }) {
  return (
    <div className="space-y-2">
      {/* Period header row */}
      <div className="flex items-center justify-between py-1 border-b border-[var(--qc-border-default)]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-ink">
            {entry.fiscal_year} {entry.quarter}
          </span>
          <span className="text-[10px] text-ink-3">{entry.source}</span>
        </div>
        {entry.value != null && (
          <span className="text-[15px] font-[500] text-ink">{fmtNum(entry.value, unit)}</span>
        )}
      </div>

      {/* Formula */}
      {!!entry.formula && (
        <div className="bg-secondary rounded-md px-3 py-2">
          <FormulaDisplay formula={entry.formula} />
        </div>
      )}

      {/* Input values */}
      {entry.inputValues && (
        <InputValuesTable inputValues={entry.inputValues} unit={unit} />
      )}
    </div>
  );
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
      <div className="text-[10px] uppercase tracking-wider text-ink-3 font-medium mb-1">
        {label}
        {note && <span className="normal-case tracking-normal ml-1 text-ink-3">({note})</span>}
      </div>
      <div className="rounded-md border border-[var(--qc-border-default)] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-secondary border-b border-[var(--qc-border-default)]">
              <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Period</th>
              <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Fiscal Year</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-ink-3">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.period} className="border-b last:border-0">
                <td className="px-3 py-2 font-mono text-ink">{row.period}</td>
                <td className="px-3 py-2 text-ink-3">{row.fiscal_year}</td>
                <td className="px-3 py-2 text-right text-ink">{fmtNum(row.value, unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetailView({ data }: { data: IndicatorDetail }) {
  const hasArrayData = Array.isArray(data.data) && data.data.length > 0;
  const hasSeriesUsed = !hasArrayData && !!data.seriesUsed;
  const hasPeriodRows = !hasArrayData && !hasSeriesUsed && !!data.periods;

  return (
    <div className="rounded-[10px] border border-[var(--qc-border-default)] bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-3 font-medium">
            {data.ticker} · {data.metricId}
          </div>
          <div className="text-[18px] font-[500] text-ink mt-0.5">{data.name}</div>
          {data.company && (
            <div className="text-[12px] text-ink-3 mt-0.5">{data.company}</div>
          )}
        </div>
        {/* Show top-level value only for cagr/average (unchanged types) */}
        {!hasArrayData && data.value != null && (
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-ink-3">Value</div>
            <div className="text-[22px] font-[500] text-ink">{fmtNum(data.value, data.unit)}</div>
          </div>
        )}
      </div>

      {/* Meta row */}
      <div className="flex gap-6 text-[12px] flex-wrap">
        <span>
          <span className="text-ink-3">Unit: </span>
          <span className="text-ink font-medium">{data.unit}</span>
        </span>
        {data.granularity && (
          <span>
            <span className="text-ink-3">Granularity: </span>
            <span className="text-ink font-medium capitalize">{data.granularity}</span>
          </span>
        )}
        <span>
          <span className="text-ink-3">BFSI: </span>
          <span className="text-ink font-medium">{data.bfsi ? "Yes" : "No"}</span>
        </span>
        {/* Legacy single-period meta */}
        {!hasArrayData && data.currentPeriod && (
          <span>
            <span className="text-ink-3">Current: </span>
            <span className="text-ink font-medium">
              {data.currentPeriod.fiscal_year} {data.currentPeriod.quarter}
            </span>
          </span>
        )}
        {!hasArrayData && data.prevPeriod && (
          <span>
            <span className="text-ink-3">Previous: </span>
            <span className="text-ink font-medium">
              {data.prevPeriod.fiscal_year} {data.prevPeriod.quarter}
            </span>
          </span>
        )}
        {!hasArrayData && data.source && (
          <span>
            <span className="text-ink-3">Source: </span>
            <span className="text-ink font-medium">{data.source}</span>
          </span>
        )}
      </div>

      {/* New array-based periods (raw / formula / delta types) */}
      {hasArrayData && (
        <div className="space-y-4">
          {data.data!.map((entry, i) => (
            <PeriodSection key={`${entry.fiscal_year}-${entry.quarter}-${i}`} entry={entry} unit={data.unit} />
          ))}
        </div>
      )}

      {/* CAGR type (unchanged) */}
      {hasSeriesUsed && data.seriesUsed && (
        <div className="space-y-3">
          <PeriodTable
            rows={data.seriesUsed}
            unit={data.unit}
            label="Series Used (CAGR)"
            note={data.spanYears != null ? `${data.spanYears}y span` : undefined}
          />
          {data.allPeriods && data.allPeriods.length > data.seriesUsed.length && (
            <PeriodTable rows={data.allPeriods} unit={data.unit} label="All Periods" />
          )}
        </div>
      )}

      {/* Average type (unchanged) */}
      {hasPeriodRows && data.periods && (
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
  const [granularity, setGranularity] = useState<Granularity>("annual");
  const [periods, setPeriods] = useState(1);

  const [detail, setDetail] = useState<IndicatorDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    rawFetch<{ success: boolean; count: number; indicators: Indicator[] }>(
      `${BACKEND_URL}/admin/indicators`,
      {
        onStart: () => { setLoadingIndicators(true); setIndicatorError(null); },
        onSuccess: (res) => setIndicators(res.indicators ?? []),
        onError: (err) => setIndicatorError(err),
        onComplete: () => setLoadingIndicators(false),
      }
    );
  }, []);

  // Re-fetch when granularity or periods changes (only if a metric is already selected)
  useEffect(() => {
    const t = ticker.trim().toUpperCase();
    if (!t || !selectedMetricId) return;
    doFetch(t, selectedMetricId, granularity, periods);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granularity, periods]);

  const options: AutocompleteOption[] = indicators.map((ind) => ({
    value: ind.id,
    label: ind.name,
    subtitle: ind.desc ?? `${ind.computationType} · ${ind.unit}`,
  }));

  function doFetch(t: string, metricId: string, gran: Granularity, p: number) {
    rawFetch<IndicatorDetail>(
      `${BACKEND_URL}/admin/indicators/${t}/${metricId}?granularity=${gran}&periods=${p}`,
      {
        onStart: () => { setLoadingDetail(true); setDetail(null); setDetailError(null); },
        onSuccess: (res) => setDetail(res),
        onError: (err) => setDetailError(err),
        onComplete: () => setLoadingDetail(false),
      }
    );
  }

  function fetchDetail(metricId: string) {
    const t = ticker.trim().toUpperCase();
    if (!t || !metricId) return;
    doFetch(t, metricId, granularity, periods);
  }

  function handleMetricSelect(valueOrLabel: string) {
    const match = indicators.find(
      (ind) => ind.id === valueOrLabel || ind.name === valueOrLabel
    );
    const metricId = match?.id ?? valueOrLabel;
    setSelectedMetricId(metricId);
    fetchDetail(metricId);
  }

  function handleTickerKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && selectedMetricId) fetchDetail(selectedMetricId);
  }

  function handlePeriodsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(20, Math.max(1, parseInt(e.target.value) || 1));
    setPeriods(v);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-ink-3 font-medium mb-1.5 block">
            Ticker
          </label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyDown={handleTickerKeyDown}
            placeholder="e.g. TCS"
            className="px-3 py-2 text-sm rounded-md border border-[var(--qc-border-default)] bg-card text-[var(--qc-text-heading)] placeholder:text-ink-3 focus:outline-none focus:border-hair-strong w-36 h-[58px]"
          />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="text-[10px] uppercase tracking-wider text-ink-3 font-medium mb-1.5 block">
            Indicator
            {loadingIndicators && (
              <span className="normal-case tracking-normal font-normal ml-1 text-ink-3">— loading…</span>
            )}
          </label>
          {indicatorError ? (
            <p className="text-sm text-down">{indicatorError}</p>
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
        <div>
          <label className="text-[10px] uppercase tracking-wider text-ink-3 font-medium mb-1.5 block">
            Granularity
          </label>
          <div className="h-[58px] flex items-center">
            <TabToggle
              options={["annual", "quarterly"]}
              value={granularity}
              onChange={(v) => setGranularity(v as Granularity)}
              variant="outline"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-ink-3 font-medium mb-1.5 block">
            Periods
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={periods}
            onChange={handlePeriodsChange}
            className="px-3 py-2 text-sm rounded-md border border-[var(--qc-border-default)] bg-card text-[var(--qc-text-heading)] focus:outline-none focus:border-hair-strong w-20 h-[58px] text-center"
          />
        </div>
      </div>

      {/* Loading / error */}
      {loadingDetail && (
        <div className="flex items-center gap-2 text-sm text-ink-3">
          <Loader2 className="size-4 animate-spin" /> Fetching provenance…
        </div>
      )}
      {detailError && !loadingDetail && (
        <div className="rounded-md border border-down bg-down-soft px-3 py-2 text-sm text-down">
          {detailError}
        </div>
      )}

      {/* Result */}
      {detail && !loadingDetail && <DetailView data={detail} />}
    </div>
  );
}
