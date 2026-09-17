"use client";

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Bot,
  FileCode,
  Sliders,
  CheckSquare,
  Square,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  HtmlSkillConfig,
  TranscriptSignalType,
  PptSignalType,
  AnnualReportSignalType,
  MarketDataSignalType,
  TRANSCRIPT_SIGNAL_TYPE_LABELS,
  PPT_SIGNAL_TYPE_LABELS,
  ANNUAL_REPORT_SIGNAL_TYPE_LABELS,
  MARKET_DATA_SIGNAL_TYPE_LABELS,
  MODEL_OPTIONS,
  QTR_OPTIONS,
  ANNUAL_OPTIONS,
  MARKET_DATA_MONTHS_OPTIONS,
} from "@/app/(app)/admin/html-skills/_components/types";
import { LensSkillMeta, LensTierSummary } from "./types";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";

const ALL_TRANSCRIPT_SIGNAL_TYPES = Object.keys(TRANSCRIPT_SIGNAL_TYPE_LABELS) as TranscriptSignalType[];
const ALL_PPT_SIGNAL_TYPES = Object.keys(PPT_SIGNAL_TYPE_LABELS) as PptSignalType[];
const ALL_ANNUAL_REPORT_SIGNAL_TYPES = Object.keys(ANNUAL_REPORT_SIGNAL_TYPE_LABELS) as AnnualReportSignalType[];
const ALL_MARKET_DATA_SIGNAL_TYPES = Object.keys(MARKET_DATA_SIGNAL_TYPE_LABELS) as MarketDataSignalType[];

interface Props {
  tier: LensTierSummary;
  lens: LensSkillMeta;
  config: HtmlSkillConfig;
  onClose: () => void;
  onSaveSuccess: (updatedConfig: HtmlSkillConfig) => void;
}

type TabType = "prompts" | "models" | "lookbacks" | "signals" | "template";

export function LensConfigDrawer({ tier, lens, config, onClose, onSaveSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("prompts");

  // State initialized from config
  const [name, setName] = useState(config.name || "");
  const [dataExtractionPrompt, setDataExtractionPrompt] = useState(config.data_extraction_prompt || "");
  const [htmlTemplatePrompt, setHtmlTemplatePrompt] = useState(config.html_template_prompt || "");
  const [factValidationPrompt, setFactValidationPrompt] = useState(config.fact_validation_prompt || "");
  const [visualQaPrompt, setVisualQaPrompt] = useState(config.visual_qa_prompt || "");

  const [extractionModel, setExtractionModel] = useState<string | null>(config.extraction_model || null);
  const [htmlTemplateModel, setHtmlTemplateModel] = useState<string | null>(config.html_template_model || null);
  const [factValidationModel, setFactValidationModel] = useState<string | null>(config.fact_validation_model || null);
  const [visualQaModel, setVisualQaModel] = useState<string | null>(config.visual_qa_model || null);

  const [maxTranscriptQtrs, setMaxTranscriptQtrs] = useState<number | null>(config.max_transcript_qtrs ?? null);
  const [maxPptQtrs, setMaxPptQtrs] = useState<number | null>(config.max_ppt_qtrs ?? null);
  const [maxAnnualReportYears, setMaxAnnualReportYears] = useState<number | null>(config.max_annual_report_years ?? null);
  const [maxMarketDataMonths, setMaxMarketDataMonths] = useState<number | null>(config.max_market_data_months ?? null);

  const [historicMaxTranscriptQtrs, setHistoricMaxTranscriptQtrs] = useState<number | null>(config.historic_max_transcript_qtrs ?? null);
  const [historicMaxPptQtrs, setHistoricMaxPptQtrs] = useState<number | null>(config.historic_max_ppt_qtrs ?? null);
  const [historicMaxAnnualReportYears, setHistoricMaxAnnualReportYears] = useState<number | null>(config.historic_max_annual_report_years ?? null);
  const [historicMaxMarketDataMonths, setHistoricMaxMarketDataMonths] = useState<number | null>(config.historic_max_market_data_months ?? null);

  const [transcriptSignals, setTranscriptSignals] = useState<TranscriptSignalType[]>(config.transcript_signal_types ?? []);
  const [pptSignals, setPptSignals] = useState<PptSignalType[]>(config.ppt_signal_types ?? []);
  const [annualReportSignals, setAnnualReportSignals] = useState<AnnualReportSignalType[]>(config.annual_report_signal_types ?? []);
  const [marketDataSignals, setMarketDataSignals] = useState<MarketDataSignalType[]>(config.market_data_signal_types ?? []);

  const [useTemplateEngine, setUseTemplateEngine] = useState<boolean>(config.use_template_engine ?? true);
  const [htmlTemplateFilename, setHtmlTemplateFilename] = useState<string>(config.html_template_filename || "");
  const [enableDataValidation, setEnableDataValidation] = useState<boolean>(config.enable_data_validation ?? true);
  const [dataValidationLoops, setDataValidationLoops] = useState<number>(config.data_validation_loops ?? 1);
  const [enableHtmlValidation, setEnableHtmlValidation] = useState<boolean>(config.enable_html_validation ?? false);

  const [maxTokens, setMaxTokens] = useState<number | null>(config.max_tokens ?? null);
  const [stripHtml, setStripHtml] = useState<boolean | null>(config.strip_html ?? null);

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  // Mark dirty on any change
  const markDirty = () => setDirty(true);

  const toggleTranscriptSignal = (type: TranscriptSignalType) => {
    setTranscriptSignals((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
    markDirty();
  };

  const togglePptSignal = (type: PptSignalType) => {
    setPptSignals((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
    markDirty();
  };

  const toggleAnnualReportSignal = (type: AnnualReportSignalType) => {
    setAnnualReportSignals((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
    markDirty();
  };

  const toggleMarketDataSignal = (type: MarketDataSignalType) => {
    setMarketDataSignals((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
    markDirty();
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(label);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    const payload = {
      name,
      data_extraction_prompt: dataExtractionPrompt,
      html_template_prompt: htmlTemplatePrompt,
      fact_validation_prompt: factValidationPrompt,
      visual_qa_prompt: visualQaPrompt,
      extraction_model: extractionModel,
      html_template_model: htmlTemplateModel,
      fact_validation_model: factValidationModel,
      visual_qa_model: visualQaModel,
      max_transcript_qtrs: maxTranscriptQtrs,
      max_ppt_qtrs: maxPptQtrs,
      max_annual_report_years: maxAnnualReportYears,
      max_market_data_months: maxMarketDataMonths,
      historic_max_transcript_qtrs: historicMaxTranscriptQtrs,
      historic_max_ppt_qtrs: historicMaxPptQtrs,
      historic_max_annual_report_years: historicMaxAnnualReportYears,
      historic_max_market_data_months: historicMaxMarketDataMonths,
      transcript_signal_types: transcriptSignals,
      ppt_signal_types: pptSignals,
      annual_report_signal_types: annualReportSignals,
      market_data_signal_types: marketDataSignals,
      use_template_engine: useTemplateEngine,
      html_template_filename: htmlTemplateFilename.trim() || null,
      enable_data_validation: enableDataValidation,
      data_validation_loops: enableDataValidation ? dataValidationLoops : 0,
      enable_html_validation: enableHtmlValidation,
      max_tokens: maxTokens,
      strip_html: stripHtml,
    };

    try {
      const res = await authFetch(
        `${BACKEND_URL}/admin/pipeline-dispatch/lens-tier-configs/${tier.key}/${lens.slug}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      }

      setDirty(false);
      onSaveSuccess(json.config);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="flex flex-col w-full max-w-3xl bg-card border-l border-hair shadow-2xl h-full overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hair px-6 py-4 shrink-0 bg-secondary/20">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold text-ink">{lens.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink/5 border border-hair text-ink font-mono">
                {lens.slug}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                {lens.category}
              </span>
            </div>
            <p className="text-[12px] text-ink-3 mt-1">
              Editing Tier: <span className="font-semibold text-ink">{tier.name}</span> ({tier.key})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center justify-center size-8 rounded-md text-ink-3 hover:text-ink hover:bg-secondary transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-hair px-6 shrink-0 bg-secondary/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab("prompts")}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === "prompts"
                ? "border-ink text-ink"
                : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            <FileCode className="size-3.5" />
            Prompts
          </button>
          <button
            onClick={() => setActiveTab("models")}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === "models"
                ? "border-ink text-ink"
                : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            <Bot className="size-3.5" />
            Models & Limits
          </button>
          <button
            onClick={() => setActiveTab("lookbacks")}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === "lookbacks"
                ? "border-ink text-ink"
                : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            <Clock className="size-3.5" />
            Lookback Windows
          </button>
          <button
            onClick={() => setActiveTab("signals")}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === "signals"
                ? "border-ink text-ink"
                : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            <Sliders className="size-3.5" />
            Signal Types ({transcriptSignals.length + pptSignals.length + annualReportSignals.length})
          </button>
          <button
            onClick={() => setActiveTab("template")}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === "template"
                ? "border-ink text-ink"
                : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            Template & Validation
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {saveError && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-down/30 bg-down/5 text-down text-xs">
              <AlertCircle className="size-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* TAB 1: Prompts */}
          {activeTab === "prompts" && (
            <div className="space-y-6">
              {/* Data Extraction Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Data Extraction Prompt
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-ink-3 font-mono">
                      {dataExtractionPrompt.length} chars
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(dataExtractionPrompt, "extraction")}
                      className="flex items-center gap-1 text-xs text-ink-3 hover:text-ink transition-colors"
                    >
                      {copiedPrompt === "extraction" ? (
                        <Check className="size-3 text-up" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={dataExtractionPrompt}
                  onChange={(e) => {
                    setDataExtractionPrompt(e.target.value);
                    markDirty();
                  }}
                  rows={14}
                  className="w-full rounded-md border border-hair bg-secondary/10 p-3 font-mono text-xs text-ink outline-none focus:border-hair-strong leading-relaxed"
                  placeholder="Enter data extraction system prompt..."
                />
              </div>

              {/* HTML Template Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                    HTML Template / Render Prompt
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-ink-3 font-mono">
                      {htmlTemplatePrompt.length} chars
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(htmlTemplatePrompt, "template")}
                      className="flex items-center gap-1 text-xs text-ink-3 hover:text-ink transition-colors"
                    >
                      {copiedPrompt === "template" ? (
                        <Check className="size-3 text-up" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={htmlTemplatePrompt}
                  onChange={(e) => {
                    setHtmlTemplatePrompt(e.target.value);
                    markDirty();
                  }}
                  rows={10}
                  className="w-full rounded-md border border-hair bg-secondary/10 p-3 font-mono text-xs text-ink outline-none focus:border-hair-strong leading-relaxed"
                  placeholder="Enter HTML template rendering prompt..."
                />
              </div>

              {/* Fact Validation Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Fact Validation Prompt (Optional)
                  </label>
                </div>
                <textarea
                  value={factValidationPrompt}
                  onChange={(e) => {
                    setFactValidationPrompt(e.target.value);
                    markDirty();
                  }}
                  rows={4}
                  className="w-full rounded-md border border-hair bg-secondary/10 p-3 font-mono text-xs text-ink outline-none focus:border-hair-strong leading-relaxed"
                  placeholder="Optional fact validation prompt..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: Models & Limits */}
          {activeTab === "models" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-hair p-4 space-y-4 bg-card">
                <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Model Assignments</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1.5">Extraction Model</label>
                    <select
                      value={extractionModel || ""}
                      onChange={(e) => {
                        setExtractionModel(e.target.value || null);
                        markDirty();
                      }}
                      className="w-full rounded-md border border-hair px-3 py-2 text-xs text-ink bg-card"
                    >
                      <option value="">Default / Inherit</option>
                      {MODEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} ({opt.value})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink mb-1.5">HTML Template Model</label>
                    <select
                      value={htmlTemplateModel || ""}
                      onChange={(e) => {
                        setHtmlTemplateModel(e.target.value || null);
                        markDirty();
                      }}
                      className="w-full rounded-md border border-hair px-3 py-2 text-xs text-ink bg-card"
                    >
                      <option value="">Default / Inherit</option>
                      {MODEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} ({opt.value})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink mb-1.5">Fact Validation Model</label>
                    <select
                      value={factValidationModel || ""}
                      onChange={(e) => {
                        setFactValidationModel(e.target.value || null);
                        markDirty();
                      }}
                      className="w-full rounded-md border border-hair px-3 py-2 text-xs text-ink bg-card"
                    >
                      <option value="">Default / Inherit</option>
                      {MODEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} ({opt.value})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink mb-1.5">Visual QA Model</label>
                    <select
                      value={visualQaModel || ""}
                      onChange={(e) => {
                        setVisualQaModel(e.target.value || null);
                        markDirty();
                      }}
                      className="w-full rounded-md border border-hair px-3 py-2 text-xs text-ink bg-card"
                    >
                      <option value="">Default / Inherit</option>
                      {MODEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} ({opt.value})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-hair p-4 space-y-4 bg-card">
                <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Limits & Processing</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1.5">Max Output Tokens</label>
                    <input
                      type="number"
                      value={maxTokens ?? ""}
                      onChange={(e) => {
                        setMaxTokens(e.target.value ? parseInt(e.target.value, 10) : null);
                        markDirty();
                      }}
                      placeholder="e.g. 30000"
                      className="w-full rounded-md border border-hair px-3 py-2 text-xs text-ink bg-card"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="strip_html_chk"
                      checked={stripHtml ?? true}
                      onChange={(e) => {
                        setStripHtml(e.target.checked);
                        markDirty();
                      }}
                      className="rounded border-hair size-4"
                    />
                    <label htmlFor="strip_html_chk" className="text-xs font-medium text-ink select-none cursor-pointer">
                      Strip HTML tags from signals
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Lookback Windows */}
          {activeTab === "lookbacks" && (
            <div className="space-y-6">
              {/* Incremental */}
              <div className="rounded-lg border border-hair p-4 space-y-4 bg-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Incremental Mode Lookback Windows
                  </h3>
                  <span className="text-[11px] text-ink-3">Used for standard ongoing quarterly runs</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-ink-3 mb-1">Transcript Qtrs</label>
                    <select
                      value={maxTranscriptQtrs ?? "null"}
                      onChange={(e) => {
                        setMaxTranscriptQtrs(e.target.value === "null" ? null : parseInt(e.target.value, 10));
                        markDirty();
                      }}
                      className="w-full rounded-md border border-hair px-2.5 py-1.5 text-xs text-ink bg-card"
                    >
                      <option value="null">Uncapped (null)</option>
                      {QTR_OPTIONS.filter((o) => o.value !== null).map((q) => (
                        <option key={String(q.value)} value={q.value ?? ""}>{q.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-ink-3 mb-1">PPT Qtrs</label>
                    <select
                      value={maxPptQtrs ?? "null"}
                      onChange={(e) => {
                        setMaxPptQtrs(e.target.value === "null" ? null : parseInt(e.target.value, 10));
                        markDirty();
                      }}
                      className="w-full rounded-md border border-hair px-2.5 py-1.5 text-xs text-ink bg-card"
                    >
                      <option value="null">Uncapped (null)</option>
                      {QTR_OPTIONS.filter((o) => o.value !== null).map((q) => (
                        <option key={String(q.value)} value={q.value ?? ""}>{q.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-ink-3 mb-1">Annual Report Years</label>
                    <select
                      value={maxAnnualReportYears ?? "null"}
                      onChange={(e) => {
                        setMaxAnnualReportYears(e.target.value === "null" ? null : parseInt(e.target.value, 10));
                        markDirty();
                      }}
                      className="w-full rounded-md border border-hair px-2.5 py-1.5 text-xs text-ink bg-card"
                    >
                      <option value="null">Uncapped (null)</option>
                      {ANNUAL_OPTIONS.filter((o) => o.value !== null).map((y) => (
                        <option key={String(y.value)} value={y.value ?? ""}>{y.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-ink-3 mb-1">Market Data Months</label>
                    <select
                      value={maxMarketDataMonths ?? "null"}
                      onChange={(e) => {
                        setMaxMarketDataMonths(e.target.value === "null" ? null : parseInt(e.target.value, 10));
                        markDirty();
                      }}
                      className="w-full rounded-md border border-hair px-2.5 py-1.5 text-xs text-ink bg-card"
                    >
                      <option value="null">Uncapped (null)</option>
                      {MARKET_DATA_MONTHS_OPTIONS.filter((o) => o.value !== null).map((m) => (
                        <option key={String(m.value)} value={m.value ?? ""}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Historic */}
              <div className="rounded-lg border border-hair p-4 space-y-4 bg-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Historic Mode Lookback Windows
                  </h3>
                  <span className="text-[11px] text-ink-3">Used for full historic baseline initialization</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-ink-3 mb-1">Historic Transcript</label>
                    <select
                      value={historicMaxTranscriptQtrs ?? "null"}
                      onChange={(e) => {
                        setHistoricMaxTranscriptQtrs(e.target.value === "null" ? null : parseInt(e.target.value, 10));
                        markDirty();
                      }}
                      className="w-full rounded-md border border-hair px-2.5 py-1.5 text-xs text-ink bg-card"
                    >
                      <option value="null">Uncapped (null)</option>
                      {QTR_OPTIONS.filter((o) => o.value !== null).map((q) => (
                        <option key={String(q.value)} value={q.value ?? ""}>{q.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-ink-3 mb-1">Historic PPT</label>
                    <select
                      value={historicMaxPptQtrs ?? "null"}
                      onChange={(e) => {
                        setHistoricMaxPptQtrs(e.target.value === "null" ? null : parseInt(e.target.value, 10));
                        markDirty();
                      }}
                      className="w-full rounded-md border border-hair px-2.5 py-1.5 text-xs text-ink bg-card"
                    >
                      <option value="null">Uncapped (null)</option>
                      {QTR_OPTIONS.filter((o) => o.value !== null).map((q) => (
                        <option key={String(q.value)} value={q.value ?? ""}>{q.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-ink-3 mb-1">Historic Annual</label>
                    <select
                      value={historicMaxAnnualReportYears ?? "null"}
                      onChange={(e) => {
                        setHistoricMaxAnnualReportYears(e.target.value === "null" ? null : parseInt(e.target.value, 10));
                        markDirty();
                      }}
                      className="w-full rounded-md border border-hair px-2.5 py-1.5 text-xs text-ink bg-card"
                    >
                      <option value="null">Uncapped (null)</option>
                      {ANNUAL_OPTIONS.filter((o) => o.value !== null).map((y) => (
                        <option key={String(y.value)} value={y.value ?? ""}>{y.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-ink-3 mb-1">Historic Market Data</label>
                    <select
                      value={historicMaxMarketDataMonths ?? "null"}
                      onChange={(e) => {
                        setHistoricMaxMarketDataMonths(e.target.value === "null" ? null : parseInt(e.target.value, 10));
                        markDirty();
                      }}
                      className="w-full rounded-md border border-hair px-2.5 py-1.5 text-xs text-ink bg-card"
                    >
                      <option value="null">Uncapped (null)</option>
                      {MARKET_DATA_MONTHS_OPTIONS.filter((o) => o.value !== null).map((m) => (
                        <option key={String(m.value)} value={m.value ?? ""}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Signals */}
          {activeTab === "signals" && (
            <div className="space-y-6">
              {/* Transcript Signals */}
              <div className="rounded-lg border border-hair p-4 space-y-3 bg-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Transcript Signals ({transcriptSignals.length} of {ALL_TRANSCRIPT_SIGNAL_TYPES.length})
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setTranscriptSignals([...ALL_TRANSCRIPT_SIGNAL_TYPES]);
                        markDirty();
                      }}
                      className="text-ink hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-hair">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTranscriptSignals([]);
                        markDirty();
                      }}
                      className="text-ink-3 hover:text-ink hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {ALL_TRANSCRIPT_SIGNAL_TYPES.map((type) => {
                    const isChecked = transcriptSignals.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleTranscriptSignal(type)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md border text-left text-xs transition-colors ${
                          isChecked
                            ? "border-ink bg-secondary/30 text-ink font-medium"
                            : "border-hair bg-transparent text-ink-3 hover:text-ink hover:border-hair-strong"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="size-3.5 text-ink shrink-0" />
                        ) : (
                          <Square className="size-3.5 text-ink-3 shrink-0" />
                        )}
                        <span className="truncate">{TRANSCRIPT_SIGNAL_TYPE_LABELS[type]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PPT Signals */}
              <div className="rounded-lg border border-hair p-4 space-y-3 bg-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
                    PPT Signals ({pptSignals.length} of {ALL_PPT_SIGNAL_TYPES.length})
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setPptSignals([...ALL_PPT_SIGNAL_TYPES]);
                        markDirty();
                      }}
                      className="text-ink hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-hair">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPptSignals([]);
                        markDirty();
                      }}
                      className="text-ink-3 hover:text-ink hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {ALL_PPT_SIGNAL_TYPES.map((type) => {
                    const isChecked = pptSignals.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => togglePptSignal(type)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md border text-left text-xs transition-colors ${
                          isChecked
                            ? "border-ink bg-secondary/30 text-ink font-medium"
                            : "border-hair bg-transparent text-ink-3 hover:text-ink hover:border-hair-strong"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="size-3.5 text-ink shrink-0" />
                        ) : (
                          <Square className="size-3.5 text-ink-3 shrink-0" />
                        )}
                        <span className="truncate">{PPT_SIGNAL_TYPE_LABELS[type]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Annual Report Signals */}
              <div className="rounded-lg border border-hair p-4 space-y-3 bg-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Annual Report Signals ({annualReportSignals.length} of {ALL_ANNUAL_REPORT_SIGNAL_TYPES.length})
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setAnnualReportSignals([...ALL_ANNUAL_REPORT_SIGNAL_TYPES]);
                        markDirty();
                      }}
                      className="text-ink hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-hair">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAnnualReportSignals([]);
                        markDirty();
                      }}
                      className="text-ink-3 hover:text-ink hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {ALL_ANNUAL_REPORT_SIGNAL_TYPES.map((type) => {
                    const isChecked = annualReportSignals.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleAnnualReportSignal(type)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md border text-left text-xs transition-colors ${
                          isChecked
                            ? "border-ink bg-secondary/30 text-ink font-medium"
                            : "border-hair bg-transparent text-ink-3 hover:text-ink hover:border-hair-strong"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="size-3.5 text-ink shrink-0" />
                        ) : (
                          <Square className="size-3.5 text-ink-3 shrink-0" />
                        )}
                        <span className="truncate">{ANNUAL_REPORT_SIGNAL_TYPE_LABELS[type]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Market Data Signals */}
              <div className="rounded-lg border border-hair p-4 space-y-3 bg-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Market Data Signals ({marketDataSignals.length} of {ALL_MARKET_DATA_SIGNAL_TYPES.length})
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {ALL_MARKET_DATA_SIGNAL_TYPES.map((type) => {
                    const isChecked = marketDataSignals.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleMarketDataSignal(type)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md border text-left text-xs transition-colors ${
                          isChecked
                            ? "border-ink bg-secondary/30 text-ink font-medium"
                            : "border-hair bg-transparent text-ink-3 hover:text-ink hover:border-hair-strong"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="size-3.5 text-ink shrink-0" />
                        ) : (
                          <Square className="size-3.5 text-ink-3 shrink-0" />
                        )}
                        <span className="truncate">{MARKET_DATA_SIGNAL_TYPE_LABELS[type]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Template & Validation */}
          {activeTab === "template" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-hair p-4 space-y-4 bg-card">
                <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Template Engine Settings
                </h3>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk_use_tmpl"
                    checked={useTemplateEngine}
                    onChange={(e) => {
                      setUseTemplateEngine(e.target.checked);
                      markDirty();
                    }}
                    className="rounded border-hair size-4"
                  />
                  <label htmlFor="chk_use_tmpl" className="text-xs font-medium text-ink select-none cursor-pointer">
                    Use Handlebars Template Engine
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">
                    Handlebars Template Filename (.hbs)
                  </label>
                  <input
                    type="text"
                    value={htmlTemplateFilename}
                    onChange={(e) => {
                      setHtmlTemplateFilename(e.target.value);
                      markDirty();
                    }}
                    placeholder="e.g. 26_management_capital-allocation_full-t1.hbs"
                    className="w-full rounded-md border border-hair px-3 py-2 text-xs font-mono text-ink bg-card"
                  />
                  <p className="text-[11px] text-ink-3 mt-1">
                    File must exist under backend templates directory.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-hair p-4 space-y-4 bg-card">
                <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Validation Loop Controls
                </h3>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk_enable_data_val"
                    checked={enableDataValidation}
                    onChange={(e) => {
                      setEnableDataValidation(e.target.checked);
                      markDirty();
                    }}
                    className="rounded border-hair size-4"
                  />
                  <label htmlFor="chk_enable_data_val" className="text-xs font-medium text-ink select-none cursor-pointer">
                    Enable Fact Validation
                  </label>
                </div>

                {enableDataValidation && (
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1.5">
                      Validation Retry Loops
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={dataValidationLoops}
                      onChange={(e) => {
                        setDataValidationLoops(parseInt(e.target.value, 10) || 1);
                        markDirty();
                      }}
                      className="w-32 rounded-md border border-hair px-3 py-2 text-xs text-ink bg-card"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-hair">
                  <input
                    type="checkbox"
                    id="chk_enable_html_val"
                    checked={enableHtmlValidation}
                    onChange={(e) => {
                      setEnableHtmlValidation(e.target.checked);
                      markDirty();
                    }}
                    className="rounded border-hair size-4"
                  />
                  <label htmlFor="chk_enable_html_val" className="text-xs font-medium text-ink select-none cursor-pointer">
                    Enable Visual HTML Validation
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-hair px-6 py-3.5 shrink-0 bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {dirty ? (
              <span className="text-warn font-medium flex items-center gap-1">
                <span className="size-2 rounded-full bg-warn inline-block" />
                Unsaved changes
              </span>
            ) : (
              <span className="text-ink-3">All changes saved</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-hair px-4 py-2 text-xs font-medium text-ink-3 hover:text-ink hover:bg-secondary transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-xs font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40 shadow-xs"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
