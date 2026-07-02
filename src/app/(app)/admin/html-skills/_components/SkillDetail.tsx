"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Save, Loader2 } from "lucide-react";
import {
  HtmlSkill,
  TranscriptSignalType,
  PptSignalType,
  AnnualReportSignalType,
  MarketDataSignalType,
  PluginCategory,
  TRANSCRIPT_SIGNAL_TYPE_LABELS,
  PPT_SIGNAL_TYPE_LABELS,
  ANNUAL_REPORT_SIGNAL_TYPE_LABELS,
  MARKET_DATA_SIGNAL_TYPE_LABELS,
  CATEGORY_LABELS,
  MODEL_OPTIONS,
  TestTicker,
  SignalCountsResponse,
  API_BASE,
} from "./types";
import { BACKEND_URL } from "@/lib/constants";

const ALL_TRANSCRIPT_SIGNAL_TYPES = Object.keys(TRANSCRIPT_SIGNAL_TYPE_LABELS) as TranscriptSignalType[];
const ALL_PPT_SIGNAL_TYPES = Object.keys(PPT_SIGNAL_TYPE_LABELS) as PptSignalType[];
const ALL_ANNUAL_REPORT_SIGNAL_TYPES = Object.keys(ANNUAL_REPORT_SIGNAL_TYPE_LABELS) as AnnualReportSignalType[];
const ALL_MARKET_DATA_SIGNAL_TYPES = Object.keys(MARKET_DATA_SIGNAL_TYPE_LABELS) as MarketDataSignalType[];
const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as PluginCategory[];

interface Props {
  skill: HtmlSkill;
  ticker: TestTicker;
  historic: boolean;
  saving: boolean;
  saveError: string | null;
  onSave: (updates: Partial<Omit<HtmlSkill, "id" | "created_at" | "updated_at">>) => void;
  onDirtyChange?: (dirty: boolean) => void;
  hideHeader?: boolean;
}

export interface SkillDetailHandle {
  save: () => void;
}

const QTR_OPTIONS: { label: string; value: number | null }[] = [
  { label: "No limit", value: null },
  { label: "2 qtrs", value: 2 },
  { label: "4 qtrs", value: 4 },
  { label: "8 qtrs", value: 8 },
  { label: "12 qtrs", value: 12 },
  { label: "16 qtrs", value: 16 },
  { label: "20 qtrs", value: 20 },
  { label: "None", value: 0 },
];

const ANNUAL_OPTIONS: { label: string; value: number | null }[] = [
  { label: "No limit", value: null },
  { label: "1 yr", value: 1 },
  { label: "2 yrs", value: 2 },
  { label: "3 yrs", value: 3 },
  { label: "5 yrs", value: 5 },
  { label: "None", value: 0 },
];

const MARKET_DATA_MONTHS_OPTIONS: { label: string; value: number | null }[] = [
  { label: "No limit", value: null },
  { label: "6 mo", value: 6 },
  { label: "12 mo", value: 12 },
  { label: "24 mo", value: 24 },
  { label: "36 mo", value: 36 },
  { label: "None", value: 0 },
];

export const SkillDetail = forwardRef<SkillDetailHandle, Props>(function SkillDetail(
  { skill, ticker, historic, saving, saveError, onSave, onDirtyChange, hideHeader },
  ref
) {
  const [name, setName] = useState(skill.name);
  const [prompt, setPrompt] = useState(skill.skill_prompt ?? "");
  const [category, setCategory] = useState<PluginCategory>(skill.category);
  const [transcriptSignalTypes, setTranscriptSignalTypes] = useState<TranscriptSignalType[]>(skill.transcript_signal_types);
  const [pptSignalTypes, setPptSignalTypes] = useState<PptSignalType[]>(skill.ppt_signal_types);
  const [annualReportSignalTypes, setAnnualReportSignalTypes] = useState<AnnualReportSignalType[]>(skill.annual_report_signal_types);
  const [marketDataSignalTypes, setMarketDataSignalTypes] = useState<MarketDataSignalType[]>(skill.market_data_signal_types ?? []);
  const [model, setModel] = useState(skill.model);
  const [maxTokens, setMaxTokens] = useState(skill.max_tokens);
  const [maxTranscriptQtrs, setMaxTranscriptQtrs] = useState<number | null>(skill.max_transcript_qtrs);
  const [maxPptQtrs, setMaxPptQtrs] = useState<number | null>(skill.max_ppt_qtrs);
  const [maxAnnualReportYears, setMaxAnnualReportYears] = useState<number | null>(skill.max_annual_report_years);
  const [maxMarketDataMonths, setMaxMarketDataMonths] = useState<number | null>(skill.max_market_data_months ?? null);
  const [historicMaxTranscriptQtrs, setHistoricMaxTranscriptQtrs] = useState<number | null>(skill.historic_max_transcript_qtrs);
  const [historicMaxPptQtrs, setHistoricMaxPptQtrs] = useState<number | null>(skill.historic_max_ppt_qtrs);
  const [historicMaxAnnualReportYears, setHistoricMaxAnnualReportYears] = useState<number | null>(skill.historic_max_annual_report_years);
  const [historicMaxMarketDataMonths, setHistoricMaxMarketDataMonths] = useState<number | null>(skill.historic_max_market_data_months);
  const [stripHtml, setStripHtml] = useState(skill.strip_html);
  const [maxBaseAnalyses, setMaxBaseAnalyses] = useState(skill.max_base_analyses);
  const [isActive, setIsActive] = useState(skill.is_active);
  const [dirty, setDirty] = useState(false);
  const [transcriptCounts, setTranscriptCounts] = useState<Record<string, number>>({});
  const [pptCounts, setPptCounts] = useState<Record<string, number>>({});
  const [annualReportCounts, setAnnualReportCounts] = useState<Record<string, number>>({});
  const [countsBaseMissing, setCountsBaseMissing] = useState(false);

  // No reset-on-skill-change effect needed — the parent remounts this component via key={skill.slug},
  // so the useState(skill.xxx) initializers above already run fresh for every skill.

  // Per-type breakdown badges next to each signal toggle. /signals/count/:ticker previews counts within
  // the currently-edited window (historic_max_* in Historic, base max_* in Incremental). Passing
  // slug + historic=false makes it pin/base-aware for Incremental; omitting historic defaults to the
  // unscoped historic-style count.
  useEffect(() => {
    setTranscriptCounts({});
    setPptCounts({});
    setAnnualReportCounts({});
    setCountsBaseMissing(false);

    const effTranscriptQtrs = historic ? historicMaxTranscriptQtrs : maxTranscriptQtrs;
    const effPptQtrs = historic ? historicMaxPptQtrs : maxPptQtrs;
    const effAnnualYears = historic ? historicMaxAnnualReportYears : maxAnnualReportYears;
    const params = new URLSearchParams();
    if (effTranscriptQtrs !== null) params.set("max_transcript_qtrs", String(effTranscriptQtrs));
    if (effPptQtrs !== null) params.set("max_ppt_qtrs", String(effPptQtrs));
    if (effAnnualYears !== null) params.set("max_annual_report_years", String(effAnnualYears));
    if (transcriptSignalTypes.length) params.set("transcript_signal_types", transcriptSignalTypes.join(","));
    if (pptSignalTypes.length) params.set("ppt_signal_types", pptSignalTypes.join(","));
    if (annualReportSignalTypes.length) params.set("annual_report_signal_types", annualReportSignalTypes.join(","));
    if (!historic) {
      params.set("slug", skill.slug);
      params.set("historic", "false");
    }
    fetch(`${BACKEND_URL}${API_BASE}/signals/count/${ticker}?${params}`)
      .then(async (res) => {
        if (!res.ok) return;
        const json: SignalCountsResponse = await res.json();
        const toMap = (counts: SignalCountsResponse["by_source"]["transcript"]["signal_counts"]) => {
          const m: Record<string, number> = {};
          for (const { signal_type, count } of counts) m[signal_type] = count;
          return m;
        };
        setTranscriptCounts(toMap(json.by_source.transcript.signal_counts));
        setPptCounts(toMap(json.by_source.ppt.signal_counts));
        setAnnualReportCounts(toMap(json.by_source.annual_report.signal_counts));
        setCountsBaseMissing(!!json.base_missing);
      })
      .catch(() => {});
  }, [ticker, historic, skill.slug, maxTranscriptQtrs, maxPptQtrs, maxAnnualReportYears, historicMaxTranscriptQtrs, historicMaxPptQtrs, historicMaxAnnualReportYears, transcriptSignalTypes, pptSignalTypes, annualReportSignalTypes]);

  function mark() { setDirty(true); onDirtyChange?.(true); }

  function toggleTranscriptSignal(type: TranscriptSignalType) {
    setTranscriptSignalTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
    mark();
  }

  function togglePptSignal(type: PptSignalType) {
    setPptSignalTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
    mark();
  }

  function toggleAnnualReportSignal(type: AnnualReportSignalType) {
    setAnnualReportSignalTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
    mark();
  }

  function toggleMarketDataSignal(type: MarketDataSignalType) {
    setMarketDataSignalTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
    mark();
  }

  function handleSave() {
    onSave({
      name, skill_prompt: prompt, category,
      transcript_signal_types: transcriptSignalTypes, ppt_signal_types: pptSignalTypes,
      annual_report_signal_types: annualReportSignalTypes, market_data_signal_types: marketDataSignalTypes,
      model, max_tokens: maxTokens,
      max_transcript_qtrs: maxTranscriptQtrs, max_ppt_qtrs: maxPptQtrs,
      max_annual_report_years: maxAnnualReportYears, max_market_data_months: maxMarketDataMonths,
      historic_max_transcript_qtrs: historicMaxTranscriptQtrs, historic_max_ppt_qtrs: historicMaxPptQtrs,
      historic_max_annual_report_years: historicMaxAnnualReportYears, historic_max_market_data_months: historicMaxMarketDataMonths,
      strip_html: stripHtml, max_base_analyses: maxBaseAnalyses,
      is_active: isActive,
    });
    setDirty(false);
    onDirtyChange?.(false);
  }

  useImperativeHandle(ref, () => ({ save: handleSave }));

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-[var(--qc-border-default)] px-5 py-3.5 shrink-0">
          <div>
            <h2 className="text-[15px] font-medium text-[var(--qc-ink)]">{skill.name}</h2>
            <p className="text-[11px] text-[#888888] font-mono mt-0.5">{skill.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            {saveError && <span className="text-[11px] text-red-600">{saveError}</span>}
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="flex items-center gap-1.5 rounded-md bg-[#0F172B] px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Category + Model + Max Tokens — same regardless of run mode */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value as PluginCategory); mark(); }}
              className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => { setModel(e.target.value); mark(); }}
              className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
            >
              {MODEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
              Max Tokens
            </label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => { setMaxTokens(Number(e.target.value)); mark(); }}
              className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
            />
          </div>
        </div>

        {/* Signal windows — bound to the historic_max_* fields when Historic is selected, the base max_* fields when Incremental is selected. Each mode saves to its own backend fields. */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
              Signal Windows
            </span>
            <span className={`rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${historic ? "bg-amber-50 text-amber-700" : "bg-zinc-100 text-zinc-500"}`}>
              editing {historic ? "historic" : "incremental"} config
            </span>
            {!historic && countsBaseMissing && (
              <span className="text-[11px] text-amber-700">No base yet — run Historic first</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-[#888888] mb-1.5">Transcript Qtrs</label>
              <select
                value={(historic ? historicMaxTranscriptQtrs : maxTranscriptQtrs) ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? null : Number(e.target.value);
                  if (historic) setHistoricMaxTranscriptQtrs(v); else setMaxTranscriptQtrs(v);
                  mark();
                }}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
              >
                {QTR_OPTIONS.map((o) => (
                  <option key={String(o.value)} value={o.value ?? ""}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[#888888] mb-1.5">PPT Qtrs</label>
              <select
                value={(historic ? historicMaxPptQtrs : maxPptQtrs) ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? null : Number(e.target.value);
                  if (historic) setHistoricMaxPptQtrs(v); else setMaxPptQtrs(v);
                  mark();
                }}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
              >
                {QTR_OPTIONS.map((o) => (
                  <option key={String(o.value)} value={o.value ?? ""}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[#888888] mb-1.5">Annual Report Yrs</label>
              <select
                value={(historic ? historicMaxAnnualReportYears : maxAnnualReportYears) ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? null : Number(e.target.value);
                  if (historic) setHistoricMaxAnnualReportYears(v); else setMaxAnnualReportYears(v);
                  mark();
                }}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
              >
                {ANNUAL_OPTIONS.map((o) => (
                  <option key={String(o.value)} value={o.value ?? ""}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[#888888] mb-1.5">Market Data Months</label>
              <select
                value={(historic ? historicMaxMarketDataMonths : maxMarketDataMonths) ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? null : Number(e.target.value);
                  if (historic) setHistoricMaxMarketDataMonths(v); else setMaxMarketDataMonths(v);
                  mark();
                }}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
              >
                {MARKET_DATA_MONTHS_OPTIONS.map((o) => (
                  <option key={String(o.value)} value={o.value ?? ""}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Incremental base-context options — only relevant when previewing/running in incremental mode */}
        {!historic && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                Strip Base HTML
              </label>
              <button
                onClick={() => { setStripHtml(!stripHtml); mark(); }}
                className={`w-full rounded-md border px-3 py-2 text-[13px] text-left transition-colors ${
                  stripHtml
                    ? "border-[#0F172B] bg-[#0F172B] text-white"
                    : "border-[var(--qc-border-default)] bg-white text-[#888888]"
                }`}
              >
                {stripHtml ? "On — plain text" : "Off — raw HTML"}
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                Max Base Analyses
              </label>
              <input
                type="number"
                min={0}
                value={maxBaseAnalyses}
                onChange={(e) => { setMaxBaseAnalyses(Number(e.target.value)); mark(); }}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
              />
            </div>
          </div>
        )}

        {/* Signal types — four source-specific sections */}
        <div className="space-y-3">
          {/* Transcript */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888]">
                Transcript Signal Types
              </label>
              <button
                onClick={() => {
                  const allSelected = ALL_TRANSCRIPT_SIGNAL_TYPES.every((t) => transcriptSignalTypes.includes(t));
                  setTranscriptSignalTypes(allSelected ? [] : [...ALL_TRANSCRIPT_SIGNAL_TYPES]);
                  mark();
                }}
                className="text-[10px] font-medium text-[#888888] hover:text-[#0F172B] transition-colors"
              >
                {ALL_TRANSCRIPT_SIGNAL_TYPES.every((t) => transcriptSignalTypes.includes(t)) ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TRANSCRIPT_SIGNAL_TYPES.map((type) => {
                const active = transcriptSignalTypes.includes(type);
                const count = transcriptCounts[type];
                return (
                  <button
                    key={type}
                    onClick={() => toggleTranscriptSignal(type)}
                    className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                      active
                        ? "bg-[#0F172B] text-white border-[#0F172B]"
                        : "bg-[#F5F5F5] text-[#888888] border-[#E2E2E2] hover:border-[#0F172B] hover:text-[#0F172B]"
                    }`}
                  >
                    {TRANSCRIPT_SIGNAL_TYPE_LABELS[type]}
                    {count !== undefined && (
                      <span className={`rounded-sm px-1 py-px text-[9px] font-semibold leading-none tabular-nums ${active ? "bg-white/20 text-white" : "bg-[#E2E2E2] text-[#888888]"}`}>
                        {count.toLocaleString()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PPT */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888]">
                PPT Signal Types
              </label>
              <button
                onClick={() => {
                  const allSelected = ALL_PPT_SIGNAL_TYPES.every((t) => pptSignalTypes.includes(t));
                  setPptSignalTypes(allSelected ? [] : [...ALL_PPT_SIGNAL_TYPES]);
                  mark();
                }}
                className="text-[10px] font-medium text-[#888888] hover:text-[#0F172B] transition-colors"
              >
                {ALL_PPT_SIGNAL_TYPES.every((t) => pptSignalTypes.includes(t)) ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_PPT_SIGNAL_TYPES.map((type) => {
                const active = pptSignalTypes.includes(type);
                const count = pptCounts[type];
                return (
                  <button
                    key={type}
                    onClick={() => togglePptSignal(type)}
                    className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                      active
                        ? "bg-[#0F172B] text-white border-[#0F172B]"
                        : "bg-[#F5F5F5] text-[#888888] border-[#E2E2E2] hover:border-[#0F172B] hover:text-[#0F172B]"
                    }`}
                  >
                    {PPT_SIGNAL_TYPE_LABELS[type]}
                    {count !== undefined && (
                      <span className={`rounded-sm px-1 py-px text-[9px] font-semibold leading-none tabular-nums ${active ? "bg-white/20 text-white" : "bg-[#E2E2E2] text-[#888888]"}`}>
                        {count.toLocaleString()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Annual Report */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888]">
                Annual Report Signal Types
              </label>
              <button
                onClick={() => {
                  const allSelected = ALL_ANNUAL_REPORT_SIGNAL_TYPES.every((t) => annualReportSignalTypes.includes(t));
                  setAnnualReportSignalTypes(allSelected ? [] : [...ALL_ANNUAL_REPORT_SIGNAL_TYPES]);
                  mark();
                }}
                className="text-[10px] font-medium text-[#888888] hover:text-[#0F172B] transition-colors"
              >
                {ALL_ANNUAL_REPORT_SIGNAL_TYPES.every((t) => annualReportSignalTypes.includes(t)) ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ANNUAL_REPORT_SIGNAL_TYPES.map((type) => {
                const active = annualReportSignalTypes.includes(type);
                const count = annualReportCounts[type];
                return (
                  <button
                    key={type}
                    onClick={() => toggleAnnualReportSignal(type)}
                    className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                      active
                        ? "bg-[#0F172B] text-white border-[#0F172B]"
                        : "bg-[#F5F5F5] text-[#888888] border-[#E2E2E2] hover:border-[#0F172B] hover:text-[#0F172B]"
                    }`}
                  >
                    {ANNUAL_REPORT_SIGNAL_TYPE_LABELS[type]}
                    {count !== undefined && (
                      <span className={`rounded-sm px-1 py-px text-[9px] font-semibold leading-none tabular-nums ${active ? "bg-white/20 text-white" : "bg-[#E2E2E2] text-[#888888]"}`}>
                        {count.toLocaleString()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Market Data */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888]">
                Market Data Signal Types
              </label>
              <button
                onClick={() => {
                  const allSelected = ALL_MARKET_DATA_SIGNAL_TYPES.every((t) => marketDataSignalTypes.includes(t));
                  setMarketDataSignalTypes(allSelected ? [] : [...ALL_MARKET_DATA_SIGNAL_TYPES]);
                  mark();
                }}
                className="text-[10px] font-medium text-[#888888] hover:text-[#0F172B] transition-colors"
              >
                {ALL_MARKET_DATA_SIGNAL_TYPES.every((t) => marketDataSignalTypes.includes(t)) ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_MARKET_DATA_SIGNAL_TYPES.map((type) => {
                const active = marketDataSignalTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleMarketDataSignal(type)}
                    className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                      active
                        ? "bg-[#0F172B] text-white border-[#0F172B]"
                        : "bg-[#F5F5F5] text-[#888888] border-[#E2E2E2] hover:border-[#0F172B] hover:text-[#0F172B]"
                    }`}
                  >
                    {MARKET_DATA_SIGNAL_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Prompt */}
        <div className="flex-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
            Skill Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); mark(); }}
            rows={18}
            className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2.5 text-[12px] font-mono text-[var(--qc-ink)] leading-relaxed outline-none focus:ring-1 focus:ring-[var(--qc-ink)] resize-none"
            placeholder="Enter the instructional prompt for this skill…"
          />
        </div>
      </div>
    </div>
  );
});
