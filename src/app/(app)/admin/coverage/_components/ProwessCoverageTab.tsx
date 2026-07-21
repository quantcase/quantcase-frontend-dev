"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, AlertCircle, Info, ChevronDown, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { rawFetch, rawPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { TagMultiPicker } from "@/components/molecules/tag-multi-picker";
import { MetricTile } from "@/components/molecules/metric-tile";
import { CompanySourcePicker } from "./CompanySourcePicker";
import {
  TickerSource,
  ProwessCoverageOptionsResponse,
  ProwessCoverageDefaultKpiSets,
  ProwessCoverageRequest,
  ProwessCoverageResponse,
  ProwessCoverageKpiSet,
  ProwessCoverageTickerRow,
} from "./types";

const BASE = `${BACKEND_URL}/admin/prowess/coverage`;
const PAGE_SIZE = 100;

const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";
const INPUT_CLS =
  "rounded-md border border-hair px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:border-hair-strong";

const GROUP_LABEL: Record<string, string> = {
  pnl: "P&L",
  balanceSheet: "Balance Sheet",
  cashflow: "Cashflow",
  custom: "Custom KPIs",
};

function groupLabel(key: string): string {
  return GROUP_LABEL[key] ?? key;
}

// present/total across every KPI×period cell actually returned for this ticker — not tied to
// kpiSets, since each KPI can carry a different set of periods (full history, ticker-specific).
function countCoverage(row: ProwessCoverageTickerRow) {
  let total = 0;
  let present = 0;
  Object.values(row.prowess ?? {}).forEach((group) => {
    (["annual", "quarterly"] as const).forEach((period) => {
      Object.values(group?.[period] ?? {}).forEach((history) => {
        Object.values(history ?? {}).forEach((v) => {
          total += 1;
          if (v) present += 1;
        });
      });
    });
  });
  return { present, total };
}

// Union of every period label across the given KPI abbrs, so a KPI missing entirely from the
// history map still gets a column — its row cells just render as "no data" (·) for each period.
function collectPeriods(kpiHistory: Record<string, Record<string, boolean>> | undefined, abbrs: string[]): string[] {
  const set = new Set<string>();
  abbrs.forEach((abbr) => Object.keys(kpiHistory?.[abbr] ?? {}).forEach((p) => set.add(p)));
  return Array.from(set).sort();
}

// ── Per-group annual/quarterly period × KPI matrix — year/quarter-wise full history ──────────

function PeriodMatrix({
  periodType,
  abbrs,
  kpiHistory,
}: {
  periodType: "annual" | "quarterly";
  abbrs: string[];
  kpiHistory: Record<string, Record<string, boolean>>;
}) {
  const periods = useMemo(() => collectPeriods(kpiHistory, abbrs), [kpiHistory, abbrs]);
  if (abbrs.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-ink-3 mb-1">{periodType === "annual" ? "Annual" : "Quarterly"}</p>
      {periods.length === 0 ? (
        <p className="text-[11px] text-ink-3">No periods on record for any KPI in this group.</p>
      ) : (
        <div className="rounded-md border border-hair overflow-auto max-h-[220px]">
          <table className="text-[10px] border-collapse w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-secondary border-b border-hair">
                <th className="sticky left-0 z-20 bg-secondary px-2 py-1 text-left font-semibold uppercase tracking-wider text-ink-3">
                  Period
                </th>
                {abbrs.map((abbr) => (
                  <th key={abbr} className="px-2 py-1 text-center font-mono font-semibold text-ink-3 whitespace-nowrap">
                    {abbr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card">
              {periods.map((p) => (
                <tr key={p} className="border-b border-hair last:border-0">
                  <td className="sticky left-0 bg-card px-2 py-1 font-mono text-ink-3 whitespace-nowrap">{p}</td>
                  {abbrs.map((abbr) => {
                    const present = !!kpiHistory?.[abbr]?.[p];
                    return (
                      <td key={abbr} className={`px-2 py-1 text-center ${present ? "text-up font-medium" : "text-ink-3"}`}>
                        {present ? "✓" : "·"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TickerDetail({ row, kpiSets }: { row: ProwessCoverageTickerRow; kpiSets: Record<string, ProwessCoverageKpiSet> }) {
  return (
    <div className="border-t border-hair px-3 py-3 bg-secondary space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <MetricTile label="NSE Rows" value={row.nse.rowCount.toLocaleString("en-IN")} />
        <MetricTile label="First Date" value={row.nse.firstDate ? formatDate(row.nse.firstDate) : "—"} />
        <MetricTile label="Last Date" value={row.nse.lastDate ? formatDate(row.nse.lastDate) : "—"} />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {Object.entries(kpiSets).map(([group, set]) => (
          <div key={group} className="rounded-md border border-hair bg-card px-3 py-2 space-y-2">
            <p className="text-[11px] font-medium text-ink">{groupLabel(group)}</p>
            <PeriodMatrix periodType="annual" abbrs={set.annual} kpiHistory={row.prowess?.[group]?.annual ?? {}} />
            <PeriodMatrix periodType="quarterly" abbrs={set.quarterly} kpiHistory={row.prowess?.[group]?.quarterly ?? {}} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TickerRow({ row, kpiSets }: { row: ProwessCoverageTickerRow; kpiSets: Record<string, ProwessCoverageKpiSet> }) {
  const [open, setOpen] = useState(false);
  const { present, total } = useMemo(() => countCoverage(row), [row]);

  return (
    <div className="rounded-[8px] border border-hair bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-3 py-2 hover:bg-secondary transition-colors text-left"
      >
        <span className="font-mono text-[12px] font-medium text-ink w-24 shrink-0">{row.symbol}</span>
        {row.prowessName ? (
          <span className="text-[11px] text-ink-3 truncate max-w-[220px]">{row.prowessName}</span>
        ) : (
          <span
            title="Unmatched to any Prowess company name — every prowess.* flag below is false for this ticker."
            className="flex items-center gap-1 rounded-sm bg-down-soft border border-down-soft px-1.5 py-0.5 text-[10px] font-medium text-down shrink-0"
          >
            <XCircle className="size-3" /> Unmatched
          </span>
        )}
        <span className="text-[11px] text-ink-3 ml-auto shrink-0">
          Periods present: <span className="text-ink font-medium">{present}</span>/{total}
        </span>
        <span className="text-[11px] text-ink-3 shrink-0">NSE: {row.nse.rowCount.toLocaleString("en-IN")}</span>
        <ChevronDown className={`size-3.5 text-ink-3 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && <TickerDetail row={row} kpiSets={kpiSets} />}
    </div>
  );
}

// ── Main tab ───────────────────────────────────────────────────────────────

export function ProwessCoverageTab() {
  // Picker options
  const [defaultTickers, setDefaultTickers] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [companyGroups, setCompanyGroups] = useState<ProwessCoverageOptionsResponse["companyGroups"]>([]);
  const [defaultKpiSets, setDefaultKpiSets] = useState<ProwessCoverageDefaultKpiSets | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Company selection — owned by this tab only
  const [source, setSource] = useState<TickerSource>("default");
  const [tickers, setTickers] = useState<string[]>([]);
  const [groupSlug, setGroupSlug] = useState("");
  const [groupCounts, setGroupCounts] = useState<Record<string, number | "loading" | "error">>({});
  const [startFrom, setStartFrom] = useState("");

  // KPI selection
  const [kpiMode, setKpiMode] = useState<"default" | "custom">("default");
  const [customKpis, setCustomKpis] = useState<string[]>([]);

  // Preview
  const [preview, setPreview] = useState<ProwessCoverageResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewedKey, setPreviewedKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [leastCoveredFirst, setLeastCoveredFirst] = useState(false);

  useEffect(() => {
    rawFetch<ProwessCoverageOptionsResponse>(`${BASE}/options`, {
      onStart: () => { setOptionsLoading(true); setOptionsError(null); },
      onSuccess: (res) => {
        setDefaultTickers(res.defaultTickers ?? []);
        setCompanies(res.companies ?? []);
        setCompanyGroups(res.companyGroups ?? []);
        setDefaultKpiSets(res.defaultKpiSets ?? null);
      },
      onError: setOptionsError,
      onComplete: () => setOptionsLoading(false),
    });
  }, []);

  // Resolve live ticker counts for the group dropdown, lazily once "Saved group" is picked
  useEffect(() => {
    if (source !== "group") return;
    companyGroups.forEach((g) => {
      if (g.slug in groupCounts) return;
      setGroupCounts((p) => ({ ...p, [g.slug]: "loading" }));
      rawFetch<{ data: { count: number } }>(`${BACKEND_URL}/admin/company-groups/${g.slug}/resolve`, {
        onSuccess: (res) => setGroupCounts((p) => ({ ...p, [g.slug]: res.data.count })),
        onError: () => setGroupCounts((p) => ({ ...p, [g.slug]: "error" })),
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, companyGroups]);

  const suggestedKpis = useMemo(() => {
    if (!defaultKpiSets) return [];
    const all = new Set<string>();
    (Object.values(defaultKpiSets) as ProwessCoverageKpiSet[]).forEach((set) => {
      set.annual.forEach((a) => all.add(a));
      set.quarterly.forEach((a) => all.add(a));
    });
    return Array.from(all).sort();
  }, [defaultKpiSets]);

  const body = useMemo<ProwessCoverageRequest>(() => {
    const b: ProwessCoverageRequest = { pageSize: PAGE_SIZE };
    if (source === "all") b.all = true;
    else if (source === "group" && groupSlug) b.groupSlug = groupSlug;
    else if (source === "manual" && tickers.length > 0) b.tickers = tickers;
    if (startFrom.trim()) b.startFrom = startFrom.trim().toUpperCase();
    if (kpiMode === "custom" && customKpis.length > 0) b.kpis = customKpis;
    return b;
  }, [source, groupSlug, tickers, startFrom, kpiMode, customKpis]);

  const bodyKey = JSON.stringify(body);
  const kpiSelectionUsable = kpiMode === "default" || customKpis.length > 0;
  const canPreview = kpiSelectionUsable && !previewLoading;

  function doPreview(targetPage = 1) {
    if (!kpiSelectionUsable) return;
    const key = bodyKey;
    const reqBody: ProwessCoverageRequest = { ...body, page: targetPage };
    rawPost<ProwessCoverageResponse>(`${BASE}/preview`, {
      onStart: () => { setPreviewLoading(true); setPreviewError(null); },
      onSuccess: (res) => { setPreview(res); setPreviewedKey(key); setPage(targetPage); },
      onError: setPreviewError,
      onComplete: () => setPreviewLoading(false),
    }, reqBody);
  }

  const rows = useMemo(() => {
    const list = preview?.perTicker ?? [];
    if (!leastCoveredFirst || !preview) return list;
    return [...list].sort((a, b) => countCoverage(a).present - countCoverage(b).present);
  }, [preview, leastCoveredFirst]);

  const hasNextPage = (preview?.tickers.length ?? 0) === PAGE_SIZE;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Intro */}
      <div className="rounded-md border border-hair bg-secondary px-4 py-3">
        <p className="text-[13px] text-ink font-medium">Prowess Coverage — raw DB availability</p>
        <p className="text-[12px] text-ink-3 mt-1">
          Per-ticker check of what&rsquo;s physically stored in <code>prowess_values_new</code> /{" "}
          <code>nse_equity_new</code> for a chosen KPI set. This is a raw-values-only report — no
          fallback chains or computed formulas run here.
        </p>
        <p className="flex items-start gap-1.5 text-[11px] text-blue bg-blue-soft border border-blue-soft rounded-md px-2.5 py-1.5 mt-2">
          <Info className="size-3.5 shrink-0 mt-px" />
          A KPI can show missing (false) here and still appear on the screener or an insight page —
          those pages layer fallback chains and computed formulas on top of the raw value, which this
          report doesn&rsquo;t evaluate. Treat a false here as &ldquo;no raw row in this table,&rdquo;
          not &ldquo;unavailable everywhere.&rdquo;
        </p>
      </div>

      {optionsError && !optionsLoading && (
        <div className="flex items-center gap-2 rounded-md border border-down-soft bg-down-soft px-4 py-3 text-sm text-down">
          <AlertCircle className="size-4 shrink-0" /> {optionsError}
        </div>
      )}

      <CompanySourcePicker
        source={source}
        onSourceChange={setSource}
        tickers={tickers}
        onTickersChange={setTickers}
        companies={companies}
        defaultTickerCount={defaultTickers.length}
        groupSlug={groupSlug}
        onGroupSlugChange={setGroupSlug}
        companyGroups={companyGroups}
        groupCounts={groupCounts}
        loading={optionsLoading}
      />

      {/* KPI selection */}
      <div className="rounded-[10px] border border-hair bg-card p-4 space-y-3">
        <div>
          <label className={LABEL_CLS}>KPI Set</label>
          <div className="inline-flex rounded-md border border-hair p-0.5 bg-secondary">
            {(["default", "custom"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setKpiMode(m)}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors ${
                  kpiMode === m ? "bg-card text-ink shadow-sm" : "text-ink-3 hover:text-ink"
                }`}
              >
                {m === "default" ? "Default (P&L / Balance Sheet / Cashflow)" : "Custom KPIs"}
              </button>
            ))}
          </div>
        </div>

        {kpiMode === "default" ? (
          defaultKpiSets && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.entries(defaultKpiSets) as [string, ProwessCoverageKpiSet][]).map(([group, set]) => (
                <div key={group} className="rounded-md border border-hair bg-secondary px-3 py-2">
                  <p className="text-[11px] font-medium text-ink">{groupLabel(group)}</p>
                  <p className="text-[11px] text-ink-3 mt-0.5">
                    {set.annual.length} annual · {set.quarterly.length} quarterly
                  </p>
                </div>
              ))}
            </div>
          )
        ) : (
          <div>
            <TagMultiPicker
              options={suggestedKpis}
              selected={customKpis}
              onChange={setCustomKpis}
              placeholder="Add a KPI abbr…"
            />
            <p className="text-[11px] text-ink-3 mt-1.5">
              Overrides the 3 default sets entirely — every KPI here is checked as one &ldquo;custom&rdquo;
              group against both annual and quarterly.
            </p>
          </div>
        )}
      </div>

      {/* Start From */}
      <div>
        <label className={LABEL_CLS}>Start From (optional)</label>
        <input
          value={startFrom}
          onChange={(e) => setStartFrom(e.target.value.toUpperCase())}
          placeholder="e.g. MSUMI"
          className={`${INPUT_CLS} w-full max-w-xs uppercase`}
        />
        <p className="text-[11px] text-ink-3 mt-1">Alphabetical cursor — resume a long scan over &ldquo;All companies&rdquo;.</p>
      </div>

      {previewError && (
        <div className="flex items-center gap-2 rounded-md border border-down-soft bg-down-soft px-4 py-3 text-sm text-down">
          <AlertCircle className="size-4 shrink-0" /> {previewError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => doPreview(1)}
          disabled={!canPreview}
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {previewLoading && <Loader2 className="size-3.5 animate-spin" />}
          Preview
        </button>
        {kpiMode === "custom" && customKpis.length === 0 && (
          <span className="text-[11px] text-warn">Add at least one KPI abbr to preview.</span>
        )}
      </div>

      {/* Results */}
      {preview && (
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Preview</span>
              <span className="text-[10px] text-ink-3">{preview.tickers.length} companies on this page</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => doPreview(page - 1)}
                  disabled={page <= 1 || previewLoading || previewedKey !== bodyKey}
                  className="flex items-center justify-center size-6 rounded border border-hair text-ink-3 hover:text-ink hover:border-ink disabled:opacity-40 disabled:hover:border-hair disabled:hover:text-ink-3 transition-colors"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <span className="text-[11px] text-ink-3">Page {page}</span>
                <button
                  onClick={() => doPreview(page + 1)}
                  disabled={!hasNextPage || previewLoading || previewedKey !== bodyKey}
                  className="flex items-center justify-center size-6 rounded border border-hair text-ink-3 hover:text-ink hover:border-ink disabled:opacity-40 disabled:hover:border-hair disabled:hover:text-ink-3 transition-colors"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
              <label className="flex items-center gap-1.5 text-[11px] text-ink-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={leastCoveredFirst}
                  onChange={(e) => setLeastCoveredFirst(e.target.checked)}
                  className="accent-[var(--qc-ink)]"
                />
                Least covered first
              </label>
            </div>
          </div>

          {rows.length === 0 ? (
            <p className="text-[12px] text-ink-3">No companies matched this page.</p>
          ) : (
            <div className="space-y-1.5">
              {rows.map((row) => (
                <TickerRow key={row.symbol} row={row} kpiSets={preview.kpiSets} />
              ))}
            </div>
          )}

          <p className="flex items-center gap-1.5 text-[11px] text-ink-3">
            <span className="text-up font-medium">✓</span> row present in DB for that period
            <span className="mx-1">·</span>
            <span className="text-ink-3">·</span> no row for that period
          </p>
        </div>
      )}
    </div>
  );
}
