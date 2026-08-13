"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Save, Loader2 } from "lucide-react";
import {
  HtmlSkill,
  HtmlSkillConfig,
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
  QTR_OPTIONS,
  ANNUAL_OPTIONS,
  MARKET_DATA_MONTHS_OPTIONS,
} from "./types";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";

const ALL_TRANSCRIPT_SIGNAL_TYPES = Object.keys(TRANSCRIPT_SIGNAL_TYPE_LABELS) as TranscriptSignalType[];
const ALL_PPT_SIGNAL_TYPES = Object.keys(PPT_SIGNAL_TYPE_LABELS) as PptSignalType[];
const ALL_ANNUAL_REPORT_SIGNAL_TYPES = Object.keys(ANNUAL_REPORT_SIGNAL_TYPE_LABELS) as AnnualReportSignalType[];
const ALL_MARKET_DATA_SIGNAL_TYPES = Object.keys(MARKET_DATA_SIGNAL_TYPE_LABELS) as MarketDataSignalType[];
const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as PluginCategory[];

interface Props {
  skill: HtmlSkill;
  // When set, this panel edits & saves this saved config bundle instead of the skill's own top-level
  // fields — driven by whichever config is picked in the run screen's "Use config" dropdown.
  config: HtmlSkillConfig | null;
  ticker: TestTicker;
  historic: boolean;
  saving: boolean;
  saveError: string | null;
  onSave: (updates: Record<string, unknown>) => void;
  onDirtyChange?: (dirty: boolean) => void;
  hideHeader?: boolean;
}

export interface SkillDetailHandle {
  save: () => void;
}

export const SkillDetail = forwardRef<SkillDetailHandle, Props>(function SkillDetail(
  { skill, config, ticker, historic, saving, saveError, onSave, onDirtyChange, hideHeader },
  ref
) {
  const isConfig = config !== null;
  const [name, setName] = useState(isConfig ? config.name : skill.name);
  const [dataExtractionPrompt, setDataExtractionPrompt] = useState(isConfig ? config.data_extraction_prompt : (skill.data_extraction_prompt ?? ""));
  const [htmlTemplatePrompt, setHtmlTemplatePrompt] = useState(isConfig ? config.html_template_prompt : (skill.html_template_prompt ?? ""));
  const [useTemplateEngine, setUseTemplateEngine] = useState<boolean>(isConfig ? (config.use_template_engine ?? true) : (skill.use_template_engine ?? true));
  const [enableDataValidation, setEnableDataValidation] = useState<boolean>(isConfig ? (config.enable_data_validation ?? true) : (skill.enable_data_validation ?? true));
  const [dataValidationLoops, setDataValidationLoops] = useState(isConfig ? config.data_validation_loops : (skill.data_validation_loops ?? 1));
  const [enableHtmlValidation, setEnableHtmlValidation] = useState<boolean>(isConfig ? (config.enable_html_validation ?? false) : (skill.enable_html_validation ?? false));
  const [extractionModel, setExtractionModel] = useState<string | null>(isConfig ? config.extraction_model : skill.extraction_model);
  const [factValidationModel, setFactValidationModel] = useState<string | null>(isConfig ? config.fact_validation_model : skill.fact_validation_model);
  const [htmlTemplateModel, setHtmlTemplateModel] = useState<string | null>(isConfig ? config.html_template_model : skill.html_template_model);
  const [visualQaModel, setVisualQaModel] = useState<string | null>(isConfig ? config.visual_qa_model : skill.visual_qa_model);
  
  const [category, setCategory] = useState<PluginCategory>(skill.category);
  const [transcriptSignalTypes, setTranscriptSignalTypes] = useState<TranscriptSignalType[]>(isConfig ? config.transcript_signal_types : skill.transcript_signal_types);
  const [pptSignalTypes, setPptSignalTypes] = useState<PptSignalType[]>(isConfig ? config.ppt_signal_types : skill.ppt_signal_types);
  const [annualReportSignalTypes, setAnnualReportSignalTypes] = useState<AnnualReportSignalType[]>(isConfig ? config.annual_report_signal_types : skill.annual_report_signal_types);
  const [marketDataSignalTypes, setMarketDataSignalTypes] = useState<MarketDataSignalType[]>((isConfig ? config.market_data_signal_types : skill.market_data_signal_types) ?? []);

  const [activeTab, setActiveTab] = useState<"extraction" | "template" | "fact_validation" | "visual_qa">("extraction");
  const [maxTokens, setMaxTokens] = useState<number | null>(isConfig ? config.max_tokens : skill.max_tokens);
  const [maxTranscriptQtrs, setMaxTranscriptQtrs] = useState<number | null>(isConfig ? config.max_transcript_qtrs : skill.max_transcript_qtrs);
  const [maxPptQtrs, setMaxPptQtrs] = useState<number | null>(isConfig ? config.max_ppt_qtrs : skill.max_ppt_qtrs);
  const [maxAnnualReportYears, setMaxAnnualReportYears] = useState<number | null>(isConfig ? config.max_annual_report_years : skill.max_annual_report_years);
  const [maxMarketDataMonths, setMaxMarketDataMonths] = useState<number | null>((isConfig ? config.max_market_data_months : skill.max_market_data_months) ?? null);
  const [historicMaxTranscriptQtrs, setHistoricMaxTranscriptQtrs] = useState<number | null>(isConfig ? config.historic_max_transcript_qtrs : skill.historic_max_transcript_qtrs);
  const [historicMaxPptQtrs, setHistoricMaxPptQtrs] = useState<number | null>(isConfig ? config.historic_max_ppt_qtrs : skill.historic_max_ppt_qtrs);
  const [historicMaxAnnualReportYears, setHistoricMaxAnnualReportYears] = useState<number | null>(isConfig ? config.historic_max_annual_report_years : skill.historic_max_annual_report_years);
  const [historicMaxMarketDataMonths, setHistoricMaxMarketDataMonths] = useState<number | null>(isConfig ? config.historic_max_market_data_months : skill.historic_max_market_data_months);
  const [stripHtml, setStripHtml] = useState<boolean | null>(isConfig ? config.strip_html : skill.strip_html);
  const [maxBaseAnalyses, setMaxBaseAnalyses] = useState(skill.max_base_analyses);
  const [isActive, setIsActive] = useState(skill.is_active);
  const [dirty, setDirty] = useState(false);
  const [transcriptCounts, setTranscriptCounts] = useState<Record<string, number>>({});
  const [pptCounts, setPptCounts] = useState<Record<string, number>>({});
  const [annualReportCounts, setAnnualReportCounts] = useState<Record<string, number>>({});
  const [countsBaseMissing, setCountsBaseMissing] = useState(false);

  // No reset-on-skill/config-change effect needed — the parent remounts this component via
  // key={`${skill.slug}::${configKey}`}, so the useState initializers above already run fresh
  // whenever the skill or the selected config changes.

  // Per-type breakdown badges next to each signal toggle. /signals/count/:ticker previews counts within
  // the currently-edited window (historic_max_* in Historic, base max_* in Incremental). Passing
  // slug + historic=false makes it pin/base-aware for Incremental; omitting historic defaults to the
  // unscoped historic-style count.
  useEffect(() => {
    setTranscriptCounts({});
    setPptCounts({});
    setAnnualReportCounts({});
    setCountsBaseMissing(false);
    if (!ticker) return;

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
    authFetch(`${BACKEND_URL}${API_BASE}/signals/count/${ticker}?${params}`)
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
    const windowFields = {
      transcript_signal_types: transcriptSignalTypes, ppt_signal_types: pptSignalTypes,
      annual_report_signal_types: annualReportSignalTypes, market_data_signal_types: marketDataSignalTypes,
      max_transcript_qtrs: maxTranscriptQtrs, max_ppt_qtrs: maxPptQtrs,
      max_annual_report_years: maxAnnualReportYears, max_market_data_months: maxMarketDataMonths,
      historic_max_transcript_qtrs: historicMaxTranscriptQtrs, historic_max_ppt_qtrs: historicMaxPptQtrs,
      historic_max_annual_report_years: historicMaxAnnualReportYears, historic_max_market_data_months: historicMaxMarketDataMonths,
    };
    
    const pipelineFields = {
      data_extraction_prompt: dataExtractionPrompt,
      html_template_prompt: htmlTemplatePrompt,
      use_template_engine: useTemplateEngine,
      enable_data_validation: enableDataValidation,
      data_validation_loops: enableDataValidation ? dataValidationLoops : 0,
      enable_html_validation: enableHtmlValidation,
      extraction_model: extractionModel,
      fact_validation_model: factValidationModel,
      html_template_model: htmlTemplateModel,
      visual_qa_model: visualQaModel,
    };

    if (isConfig) {
      onSave({
        name, ...windowFields, ...pipelineFields,
        max_tokens: maxTokens, strip_html: stripHtml,
      });
    } else {
      onSave({
        name, category, ...windowFields, ...pipelineFields,
        max_tokens: maxTokens,
        strip_html: stripHtml ?? true, max_base_analyses: maxBaseAnalyses,
        is_active: isActive,
      });
    }
    setDirty(false);
    onDirtyChange?.(false);
  }

  // Ensure the parent always gets the latest handleSave to avoid stale closures
  useImperativeHandle(ref, () => ({ save: handleSave }), [
    name, category, dataExtractionPrompt, htmlTemplatePrompt, useTemplateEngine, enableDataValidation,
    dataValidationLoops, enableHtmlValidation, extractionModel, factValidationModel,
    htmlTemplateModel, visualQaModel, transcriptSignalTypes, pptSignalTypes,
    annualReportSignalTypes, marketDataSignalTypes, maxTokens, maxTranscriptQtrs,
    maxPptQtrs, maxAnnualReportYears, maxMarketDataMonths, historicMaxTranscriptQtrs,
    historicMaxPptQtrs, historicMaxAnnualReportYears, historicMaxMarketDataMonths,
    stripHtml, maxBaseAnalyses, isActive, isConfig
  ]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-[var(--qc-border-default)] px-5 py-3.5 shrink-0">
          <div>
            <h2 className="text-[15px] font-medium text-[var(--qc-ink)]">{skill.name}</h2>
            <p className="text-[11px] text-ink-3 font-mono mt-0.5">{skill.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            {saveError && <span className="text-[11px] text-down">{saveError}</span>}
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Key + Name — config mode only; key is immutable once created */}
        {isConfig && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                Key <span className="normal-case font-normal text-[10px] text-ink-3">(immutable)</span>
              </label>
              <input
                type="text"
                value={config.key}
                disabled
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-secondary px-3 py-2 text-[13px] font-mono text-ink-3 outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); mark(); }}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
              />
            </div>
          </div>
        )}

        <div className={isConfig ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
          {!isConfig && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value as PluginCategory); mark(); }}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
              Max Tokens
            </label>
            <input
              type="number"
              value={maxTokens ?? ""}
              placeholder={isConfig ? `Default (${skill.max_tokens})` : undefined}
              onChange={(e) => {
                if (isConfig) setMaxTokens(e.target.value === "" ? null : Number(e.target.value));
                else setMaxTokens(Number(e.target.value));
                mark();
              }}
              className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
            />
          </div>
        </div>

        {/* Signal windows — bound to the historic_max_* fields when Historic is selected, the base max_* fields when Incremental is selected. Each mode saves to its own backend fields. */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
              Signal Windows
            </span>
            <span className={`rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${historic ? "bg-warn-soft text-warn" : "bg-secondary text-ink-2"}`}>
              editing {historic ? "historic" : "incremental"} window
            </span>
            {!historic && countsBaseMissing && (
              <span className="text-[11px] text-warn">No base yet — run Historic first</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-ink-3 mb-1.5">Transcript Qtrs</label>
              <select
                value={(historic ? historicMaxTranscriptQtrs : maxTranscriptQtrs) ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? null : Number(e.target.value);
                  if (historic) setHistoricMaxTranscriptQtrs(v); else setMaxTranscriptQtrs(v);
                  mark();
                }}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
              >
                {QTR_OPTIONS.map((o) => (
                  <option key={String(o.value)} value={o.value ?? ""}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-ink-3 mb-1.5">PPT Qtrs</label>
              <select
                value={(historic ? historicMaxPptQtrs : maxPptQtrs) ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? null : Number(e.target.value);
                  if (historic) setHistoricMaxPptQtrs(v); else setMaxPptQtrs(v);
                  mark();
                }}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
              >
                {QTR_OPTIONS.map((o) => (
                  <option key={String(o.value)} value={o.value ?? ""}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-ink-3 mb-1.5">Annual Report Yrs</label>
              <select
                value={(historic ? historicMaxAnnualReportYears : maxAnnualReportYears) ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? null : Number(e.target.value);
                  if (historic) setHistoricMaxAnnualReportYears(v); else setMaxAnnualReportYears(v);
                  mark();
                }}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
              >
                {ANNUAL_OPTIONS.map((o) => (
                  <option key={String(o.value)} value={o.value ?? ""}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-ink-3 mb-1.5">Market Data Months</label>
              <select
                value={(historic ? historicMaxMarketDataMonths : maxMarketDataMonths) ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? null : Number(e.target.value);
                  if (historic) setHistoricMaxMarketDataMonths(v); else setMaxMarketDataMonths(v);
                  mark();
                }}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
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
          <div className={isConfig ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                Strip Base HTML
              </label>
              {isConfig ? (
                <div className="flex rounded-md border border-[var(--qc-border-default)] overflow-hidden">
                  {[
                    { label: `Default (${skill.strip_html ? "on" : "off"})`, value: null },
                    { label: "On", value: true },
                    { label: "Off", value: false },
                  ].map((o) => (
                    <button
                      key={String(o.value)}
                      onClick={() => { setStripHtml(o.value); mark(); }}
                      className={`flex-1 px-2 py-2 text-[12px] font-medium transition-colors ${
                        stripHtml === o.value ? "bg-ink text-[var(--qc-on-dark)]" : "bg-card text-ink-3 hover:text-ink"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => { setStripHtml(!stripHtml); mark(); }}
                  className={`w-full rounded-md border px-3 py-2 text-[13px] text-left transition-colors ${
                    stripHtml
                      ? "border-ink bg-ink text-[var(--qc-on-dark)]"
                      : "border-[var(--qc-border-default)] bg-card text-ink-3"
                  }`}
                >
                  {stripHtml ? "On — plain text" : "Off — raw HTML"}
                </button>
              )}
            </div>
            {!isConfig && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                  Max Base Analyses
                </label>
                <input
                  type="number"
                  min={0}
                  value={maxBaseAnalyses}
                  onChange={(e) => { setMaxBaseAnalyses(Number(e.target.value)); mark(); }}
                  className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
                />
              </div>
            )}
          </div>
        )}

        {/* Signal types — four source-specific sections */}
        <div className="space-y-3">
          {/* Transcript */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Transcript Signal Types
              </label>
              <button
                onClick={() => {
                  const allSelected = ALL_TRANSCRIPT_SIGNAL_TYPES.every((t) => transcriptSignalTypes.includes(t));
                  setTranscriptSignalTypes(allSelected ? [] : [...ALL_TRANSCRIPT_SIGNAL_TYPES]);
                  mark();
                }}
                className="text-[10px] font-medium text-ink-3 hover:text-ink transition-colors"
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
                        ? "bg-ink text-[var(--qc-on-dark)] border-ink"
                        : "bg-secondary text-ink-3 border-hair hover:border-ink hover:text-ink"
                    }`}
                  >
                    {TRANSCRIPT_SIGNAL_TYPE_LABELS[type]}
                    {count !== undefined && (
                      <span className={`rounded-sm px-1 py-px text-[9px] font-semibold leading-none tabular-nums ${active ? "bg-white/20 text-[var(--qc-on-dark)]" : "bg-secondary text-ink-3"}`}>
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
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                PPT Signal Types
              </label>
              <button
                onClick={() => {
                  const allSelected = ALL_PPT_SIGNAL_TYPES.every((t) => pptSignalTypes.includes(t));
                  setPptSignalTypes(allSelected ? [] : [...ALL_PPT_SIGNAL_TYPES]);
                  mark();
                }}
                className="text-[10px] font-medium text-ink-3 hover:text-ink transition-colors"
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
                        ? "bg-ink text-[var(--qc-on-dark)] border-ink"
                        : "bg-secondary text-ink-3 border-hair hover:border-ink hover:text-ink"
                    }`}
                  >
                    {PPT_SIGNAL_TYPE_LABELS[type]}
                    {count !== undefined && (
                      <span className={`rounded-sm px-1 py-px text-[9px] font-semibold leading-none tabular-nums ${active ? "bg-white/20 text-[var(--qc-on-dark)]" : "bg-secondary text-ink-3"}`}>
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
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Annual Report Signal Types
              </label>
              <button
                onClick={() => {
                  const allSelected = ALL_ANNUAL_REPORT_SIGNAL_TYPES.every((t) => annualReportSignalTypes.includes(t));
                  setAnnualReportSignalTypes(allSelected ? [] : [...ALL_ANNUAL_REPORT_SIGNAL_TYPES]);
                  mark();
                }}
                className="text-[10px] font-medium text-ink-3 hover:text-ink transition-colors"
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
                        ? "bg-ink text-[var(--qc-on-dark)] border-ink"
                        : "bg-secondary text-ink-3 border-hair hover:border-ink hover:text-ink"
                    }`}
                  >
                    {ANNUAL_REPORT_SIGNAL_TYPE_LABELS[type]}
                    {count !== undefined && (
                      <span className={`rounded-sm px-1 py-px text-[9px] font-semibold leading-none tabular-nums ${active ? "bg-white/20 text-[var(--qc-on-dark)]" : "bg-secondary text-ink-3"}`}>
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
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Market Data Signal Types
              </label>
              <button
                onClick={() => {
                  const allSelected = ALL_MARKET_DATA_SIGNAL_TYPES.every((t) => marketDataSignalTypes.includes(t));
                  setMarketDataSignalTypes(allSelected ? [] : [...ALL_MARKET_DATA_SIGNAL_TYPES]);
                  mark();
                }}
                className="text-[10px] font-medium text-ink-3 hover:text-ink transition-colors"
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
                        ? "bg-ink text-[var(--qc-on-dark)] border-ink"
                        : "bg-secondary text-ink-3 border-hair hover:border-ink hover:text-ink"
                    }`}
                  >
                    {MARKET_DATA_SIGNAL_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabbed Pipeline Configuration */}
        <div className="flex-1 flex flex-col min-h-[400px]">
          <div className="flex border-b border-[var(--qc-border-default)] mb-4">
            <button
              onClick={() => setActiveTab("extraction")}
              className={`px-4 py-2 text-[12px] font-semibold tracking-wide border-b-2 transition-colors ${
                activeTab === "extraction" ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink-2"
              }`}
            >
              Data Extraction
            </button>
            <button
              onClick={() => setActiveTab("template")}
              className={`px-4 py-2 text-[12px] font-semibold tracking-wide border-b-2 transition-colors ${
                activeTab === "template" ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink-2"
              }`}
            >
              HTML Template
            </button>
            <button
              onClick={() => setActiveTab("fact_validation")}
              className={`px-4 py-2 text-[12px] font-semibold tracking-wide border-b-2 transition-colors ${
                activeTab === "fact_validation" ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink-2"
              }`}
            >
              Fact Validation
            </button>
            <button
              onClick={() => setActiveTab("visual_qa")}
              className={`px-4 py-2 text-[12px] font-semibold tracking-wide border-b-2 transition-colors ${
                activeTab === "visual_qa" ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink-2"
              }`}
            >
              Visual QA
            </button>
          </div>

          {activeTab === "extraction" && (
            <div className="flex-1 flex flex-col space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                  Extraction Model
                </label>
                <select
                  value={extractionModel ?? ""}
                  onChange={(e) => { setExtractionModel(isConfig ? (e.target.value || null) : e.target.value); mark(); }}
                  className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
                >
                  {isConfig && <option value="">Default ({MODEL_OPTIONS.find((o) => o.value === skill.extraction_model)?.label ?? skill.extraction_model})</option>}
                  {MODEL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                  Extraction Prompt
                </label>
                <textarea
                  value={dataExtractionPrompt}
                  onChange={(e) => { setDataExtractionPrompt(e.target.value); mark(); }}
                  className="w-full flex-1 rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2.5 text-[12px] font-mono text-[var(--qc-ink)] leading-relaxed outline-none focus:border-hair-strong resize-none"
                  placeholder="Enter the data extraction prompt..."
                />
              </div>
            </div>
          )}

          {activeTab === "template" && (
            <div className="flex-1 flex flex-col space-y-3">
              <div className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={useTemplateEngine}
                  onChange={(e) => { setUseTemplateEngine(e.target.checked); mark(); }}
                  className="rounded border-[var(--qc-border-default)] text-ink focus:ring-ink"
                />
                <span className="text-[12px] font-medium text-ink-2">Use Template Engine (Bypass LLM)</span>
              </div>
              {!useTemplateEngine && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                    Template Model
                  </label>
                  <select
                    value={htmlTemplateModel ?? ""}
                    onChange={(e) => { setHtmlTemplateModel(isConfig ? (e.target.value || null) : e.target.value); mark(); }}
                    className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
                  >
                    {isConfig && <option value="">Default ({MODEL_OPTIONS.find((o) => o.value === skill.html_template_model)?.label ?? skill.html_template_model})</option>}
                    {MODEL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex-1 flex flex-col">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                  HTML Template Prompt
                </label>
                <textarea
                  value={htmlTemplatePrompt}
                  onChange={(e) => { setHtmlTemplatePrompt(e.target.value); mark(); }}
                  className="w-full flex-1 rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2.5 text-[12px] font-mono text-[var(--qc-ink)] leading-relaxed outline-none focus:border-hair-strong resize-none"
                  placeholder="Enter the HTML template prompt..."
                />
              </div>
            </div>
          )}

          {activeTab === "fact_validation" && (
            <div className="flex-1 flex flex-col space-y-6">
              <div className="text-[13px] text-ink-3 bg-blue-soft border border-blue/30 rounded-md p-3 mb-2">
                This stage automatically runs to validate extracted facts against the original source text. The prompt is hardcoded in the backend pipeline.
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDataValidation}
                    onChange={(e) => { setEnableDataValidation(e.target.checked); mark(); }}
                    className="rounded border-[var(--qc-border-default)] text-ink focus:ring-ink"
                  />
                  <span className="text-[12px] font-medium text-ink-2">Enable Fact Validation</span>
                </label>
                
                {enableDataValidation && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                        Validation Passes (Loops)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={dataValidationLoops}
                        onChange={(e) => { setDataValidationLoops(Number(e.target.value)); mark(); }}
                        className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                        Fact Validation Model
                      </label>
                      <select
                        value={factValidationModel ?? ""}
                        onChange={(e) => { setFactValidationModel(isConfig ? (e.target.value || null) : e.target.value); mark(); }}
                        className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
                      >
                        {isConfig && <option value="">Default ({MODEL_OPTIONS.find((o) => o.value === skill.fact_validation_model)?.label ?? skill.fact_validation_model})</option>}
                        {MODEL_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "visual_qa" && (
            <div className="flex-1 flex flex-col space-y-6">
              <div className="text-[13px] text-ink-3 bg-blue-soft border border-blue/30 rounded-md p-3 mb-2">
                This stage renders the generated HTML and visually inspects it to catch UI bugs or layout issues. The prompt is hardcoded in the backend pipeline.
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableHtmlValidation}
                    onChange={(e) => { setEnableHtmlValidation(e.target.checked); mark(); }}
                    className="rounded border-[var(--qc-border-default)] text-ink focus:ring-ink"
                  />
                  <span className="text-[12px] font-medium text-ink-2">Enable Visual QA</span>
                </label>
                
                {enableHtmlValidation && (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                      Visual QA Model
                    </label>
                    <select
                      value={visualQaModel ?? ""}
                      onChange={(e) => { setVisualQaModel(isConfig ? (e.target.value || null) : e.target.value); mark(); }}
                      className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
                    >
                      {isConfig && <option value="">Default ({MODEL_OPTIONS.find((o) => o.value === skill.visual_qa_model)?.label ?? skill.visual_qa_model})</option>}
                      {MODEL_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
