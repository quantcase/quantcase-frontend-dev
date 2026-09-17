"use client";

import { useState } from "react";
import { X, Check, Loader2, AlertCircle, Bot, Clock, CheckSquare, Square } from "lucide-react";
import { MODEL_OPTIONS, QTR_OPTIONS, ANNUAL_OPTIONS, MARKET_DATA_MONTHS_OPTIONS } from "@/app/(app)/admin/html-skills/_components/types";
import { LensSkillMeta, LensTierSummary, BulkUpdateTierPayload, BulkUpdateTierResponse } from "./types";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";

interface Props {
  tier: LensTierSummary;
  lenses: LensSkillMeta[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUpdateTierModal({ tier, lenses, onClose, onSuccess }: Props) {
  // Selected lenses to apply to (default: all 10)
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(lenses.map((l) => l.slug));

  // Toggles for whether to update models or time frames
  const [updateModels, setUpdateModels] = useState(true);
  const [updateLookbacks, setUpdateLookbacks] = useState(false);

  // Model values
  const [extractionModel, setExtractionModel] = useState<string>("");
  const [htmlTemplateModel, setHtmlTemplateModel] = useState<string>("");
  const [factValidationModel, setFactValidationModel] = useState<string>("");
  const [visualQaModel, setVisualQaModel] = useState<string>("");

  // Individual model checkboxes to selectively update
  const [applyExtractionModel, setApplyExtractionModel] = useState(true);
  const [applyHtmlTemplateModel, setApplyHtmlTemplateModel] = useState(false);
  const [applyFactValidationModel, setApplyFactValidationModel] = useState(false);
  const [applyVisualQaModel, setApplyVisualQaModel] = useState(false);

  // Time frame values (lookback caps)
  const [maxTranscriptQtrs, setMaxTranscriptQtrs] = useState<string>("keep");
  const [maxPptQtrs, setMaxPptQtrs] = useState<string>("keep");
  const [maxAnnualReportYears, setMaxAnnualReportYears] = useState<string>("keep");
  const [maxMarketDataMonths, setMaxMarketDataMonths] = useState<string>("keep");

  const [historicMaxTranscriptQtrs, setHistoricMaxTranscriptQtrs] = useState<string>("keep");
  const [historicMaxPptQtrs, setHistoricMaxPptQtrs] = useState<string>("keep");
  const [historicMaxAnnualReportYears, setHistoricMaxAnnualReportYears] = useState<string>("keep");
  const [historicMaxMarketDataMonths, setHistoricMaxMarketDataMonths] = useState<string>("keep");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSlug = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const selectAllSlugs = () => setSelectedSlugs(lenses.map((l) => l.slug));
  const deselectAllSlugs = () => setSelectedSlugs([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlugs.length === 0) {
      setError("Please select at least one lens to update.");
      return;
    }

    const updates: BulkUpdateTierPayload["updates"] = {};

    if (updateModels) {
      if (applyExtractionModel && extractionModel) updates.extraction_model = extractionModel;
      if (applyHtmlTemplateModel && htmlTemplateModel) updates.html_template_model = htmlTemplateModel;
      if (applyFactValidationModel && factValidationModel) updates.fact_validation_model = factValidationModel;
      if (applyVisualQaModel && visualQaModel) updates.visual_qa_model = visualQaModel;
    }

    if (updateLookbacks) {
      if (maxTranscriptQtrs !== "keep") updates.max_transcript_qtrs = maxTranscriptQtrs === "null" ? null : parseInt(maxTranscriptQtrs, 10);
      if (maxPptQtrs !== "keep") updates.max_ppt_qtrs = maxPptQtrs === "null" ? null : parseInt(maxPptQtrs, 10);
      if (maxAnnualReportYears !== "keep") updates.max_annual_report_years = maxAnnualReportYears === "null" ? null : parseInt(maxAnnualReportYears, 10);
      if (maxMarketDataMonths !== "keep") updates.max_market_data_months = maxMarketDataMonths === "null" ? null : parseInt(maxMarketDataMonths, 10);

      if (historicMaxTranscriptQtrs !== "keep") updates.historic_max_transcript_qtrs = historicMaxTranscriptQtrs === "null" ? null : parseInt(historicMaxTranscriptQtrs, 10);
      if (historicMaxPptQtrs !== "keep") updates.historic_max_ppt_qtrs = historicMaxPptQtrs === "null" ? null : parseInt(historicMaxPptQtrs, 10);
      if (historicMaxAnnualReportYears !== "keep") updates.historic_max_annual_report_years = historicMaxAnnualReportYears === "null" ? null : parseInt(historicMaxAnnualReportYears, 10);
      if (historicMaxMarketDataMonths !== "keep") updates.historic_max_market_data_months = historicMaxMarketDataMonths === "null" ? null : parseInt(historicMaxMarketDataMonths, 10);
    }

    if (Object.keys(updates).length === 0) {
      setError("Please select at least one field and specify a value to update.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await authFetch(`${BACKEND_URL}/admin/pipeline-dispatch/lens-tier-configs/bulk-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierKey: tier.key,
          slugs: selectedSlugs,
          updates,
        }),
      });

      const json: BulkUpdateTierResponse = await res.json();
      if (!res.ok) {
        throw new Error((json as unknown as { error?: string })?.error ?? `HTTP ${res.status}`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to bulk update tier configurations");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="flex flex-col w-full max-w-2xl rounded-xl border border-hair bg-card shadow-2xl overflow-hidden my-6 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hair px-6 py-4 shrink-0 bg-secondary/30">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">Bulk Update: {tier.name}</h2>
            <p className="text-[12px] text-ink-3 mt-0.5 font-mono">
              Tier Key: <span className="text-ink font-semibold">{tier.key}</span> · Applies only to selected lenses
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-8 rounded-md text-ink-3 hover:text-ink hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-down/30 bg-down/5 text-down text-xs">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Lens Selector */}
          <div className="rounded-lg border border-hair p-4 bg-secondary/20 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Apply to Lenses ({selectedSlugs.length} of {lenses.length} selected)
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllSlugs}
                  className="text-ink hover:underline font-medium"
                >
                  Select All
                </button>
                <span className="text-hair">|</span>
                <button
                  type="button"
                  onClick={deselectAllSlugs}
                  className="text-ink-3 hover:text-ink hover:underline"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {lenses.map((lens) => {
                const isChecked = selectedSlugs.includes(lens.slug);
                return (
                  <button
                    key={lens.slug}
                    type="button"
                    onClick={() => toggleSlug(lens.slug)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-left text-xs transition-colors ${
                      isChecked
                        ? "border-ink bg-card text-ink font-medium shadow-xs"
                        : "border-hair bg-transparent text-ink-3 hover:border-hair-strong hover:text-ink"
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="size-3.5 text-ink shrink-0" />
                    ) : (
                      <Square className="size-3.5 text-ink-3 shrink-0" />
                    )}
                    <span className="truncate">{lens.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 1: Model Selection */}
          <div className="rounded-lg border border-hair p-4 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-ink-3" />
                <span className="text-sm font-semibold text-ink">1. Model Selection</span>
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none text-ink-2">
                <input
                  type="checkbox"
                  checked={updateModels}
                  onChange={(e) => setUpdateModels(e.target.checked)}
                  className="rounded border-hair size-3.5"
                />
                <span>Include in update</span>
              </label>
            </div>

            {updateModels && (
              <div className="space-y-3 pt-2 border-t border-hair">
                {/* Extraction Model */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={applyExtractionModel}
                    onChange={(e) => setApplyExtractionModel(e.target.checked)}
                    className="rounded border-hair size-3.5"
                    id="chk_ext_model"
                  />
                  <label htmlFor="chk_ext_model" className="w-40 text-xs font-medium text-ink select-none cursor-pointer">
                    Extraction Model:
                  </label>
                  <select
                    disabled={!applyExtractionModel}
                    value={extractionModel}
                    onChange={(e) => setExtractionModel(e.target.value)}
                    className="flex-1 rounded-md border border-hair px-2.5 py-1.5 text-xs text-ink bg-card disabled:opacity-40 disabled:bg-secondary"
                  >
                    <option value="">-- Choose Model --</option>
                    {MODEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} ({opt.value})
                      </option>
                    ))}
                  </select>
                </div>

                {/* HTML Template Model */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={applyHtmlTemplateModel}
                    onChange={(e) => setApplyHtmlTemplateModel(e.target.checked)}
                    className="rounded border-hair size-3.5"
                    id="chk_tmpl_model"
                  />
                  <label htmlFor="chk_tmpl_model" className="w-40 text-xs font-medium text-ink select-none cursor-pointer">
                    HTML Template Model:
                  </label>
                  <select
                    disabled={!applyHtmlTemplateModel}
                    value={htmlTemplateModel}
                    onChange={(e) => setHtmlTemplateModel(e.target.value)}
                    className="flex-1 rounded-md border border-hair px-2.5 py-1.5 text-xs text-ink bg-card disabled:opacity-40 disabled:bg-secondary"
                  >
                    <option value="">-- Choose Model --</option>
                    {MODEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} ({opt.value})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fact Validation Model */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={applyFactValidationModel}
                    onChange={(e) => setApplyFactValidationModel(e.target.checked)}
                    className="rounded border-hair size-3.5"
                    id="chk_fact_model"
                  />
                  <label htmlFor="chk_fact_model" className="w-40 text-xs font-medium text-ink select-none cursor-pointer">
                    Fact Validation Model:
                  </label>
                  <select
                    disabled={!applyFactValidationModel}
                    value={factValidationModel}
                    onChange={(e) => setFactValidationModel(e.target.value)}
                    className="flex-1 rounded-md border border-hair px-2.5 py-1.5 text-xs text-ink bg-card disabled:opacity-40 disabled:bg-secondary"
                  >
                    <option value="">-- Choose Model --</option>
                    {MODEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} ({opt.value})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Visual QA Model */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={applyVisualQaModel}
                    onChange={(e) => setApplyVisualQaModel(e.target.checked)}
                    className="rounded border-hair size-3.5"
                    id="chk_vqa_model"
                  />
                  <label htmlFor="chk_vqa_model" className="w-40 text-xs font-medium text-ink select-none cursor-pointer">
                    Visual QA Model:
                  </label>
                  <select
                    disabled={!applyVisualQaModel}
                    value={visualQaModel}
                    onChange={(e) => setVisualQaModel(e.target.value)}
                    className="flex-1 rounded-md border border-hair px-2.5 py-1.5 text-xs text-ink bg-card disabled:opacity-40 disabled:bg-secondary"
                  >
                    <option value="">-- Choose Model --</option>
                    {MODEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} ({opt.value})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Time Frame Selection (Lookback Caps) */}
          <div className="rounded-lg border border-hair p-4 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-ink-3" />
                <span className="text-sm font-semibold text-ink">2. Time Frame / Lookback Selection</span>
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none text-ink-2">
                <input
                  type="checkbox"
                  checked={updateLookbacks}
                  onChange={(e) => setUpdateLookbacks(e.target.checked)}
                  className="rounded border-hair size-3.5"
                />
                <span>Include in update</span>
              </label>
            </div>

            {updateLookbacks && (
              <div className="space-y-4 pt-2 border-t border-hair">
                {/* Incremental */}
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-2">
                    Incremental Dispatch Window
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-ink-3 mb-1">Transcript Qtrs</label>
                      <select
                        value={maxTranscriptQtrs}
                        onChange={(e) => setMaxTranscriptQtrs(e.target.value)}
                        className="w-full rounded-md border border-hair px-2 py-1.5 text-xs text-ink bg-card"
                      >
                        <option value="keep">— Keep Unchanged —</option>
                        <option value="null">Uncapped (null)</option>
                        {QTR_OPTIONS.filter((o) => o.value !== null).map((q) => (
                          <option key={String(q.value)} value={String(q.value)}>{q.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-ink-3 mb-1">PPT Qtrs</label>
                      <select
                        value={maxPptQtrs}
                        onChange={(e) => setMaxPptQtrs(e.target.value)}
                        className="w-full rounded-md border border-hair px-2 py-1.5 text-xs text-ink bg-card"
                      >
                        <option value="keep">— Keep Unchanged —</option>
                        <option value="null">Uncapped (null)</option>
                        {QTR_OPTIONS.filter((o) => o.value !== null).map((q) => (
                          <option key={String(q.value)} value={String(q.value)}>{q.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-ink-3 mb-1">Annual Report Years</label>
                      <select
                        value={maxAnnualReportYears}
                        onChange={(e) => setMaxAnnualReportYears(e.target.value)}
                        className="w-full rounded-md border border-hair px-2 py-1.5 text-xs text-ink bg-card"
                      >
                        <option value="keep">— Keep Unchanged —</option>
                        <option value="null">Uncapped (null)</option>
                        {ANNUAL_OPTIONS.filter((o) => o.value !== null).map((y) => (
                          <option key={String(y.value)} value={String(y.value)}>{y.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-ink-3 mb-1">Market Data Months</label>
                      <select
                        value={maxMarketDataMonths}
                        onChange={(e) => setMaxMarketDataMonths(e.target.value)}
                        className="w-full rounded-md border border-hair px-2 py-1.5 text-xs text-ink bg-card"
                      >
                        <option value="keep">— Keep Unchanged —</option>
                        <option value="null">Uncapped (null)</option>
                        {MARKET_DATA_MONTHS_OPTIONS.filter((o) => o.value !== null).map((m) => (
                          <option key={String(m.value)} value={String(m.value)}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Historic */}
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-2">
                    Historic Dispatch Window
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-ink-3 mb-1">Historic Transcript</label>
                      <select
                        value={historicMaxTranscriptQtrs}
                        onChange={(e) => setHistoricMaxTranscriptQtrs(e.target.value)}
                        className="w-full rounded-md border border-hair px-2 py-1.5 text-xs text-ink bg-card"
                      >
                        <option value="keep">— Keep Unchanged —</option>
                        <option value="null">Uncapped (null)</option>
                        {QTR_OPTIONS.filter((o) => o.value !== null).map((q) => (
                          <option key={String(q.value)} value={String(q.value)}>{q.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-ink-3 mb-1">Historic PPT</label>
                      <select
                        value={historicMaxPptQtrs}
                        onChange={(e) => setHistoricMaxPptQtrs(e.target.value)}
                        className="w-full rounded-md border border-hair px-2 py-1.5 text-xs text-ink bg-card"
                      >
                        <option value="keep">— Keep Unchanged —</option>
                        <option value="null">Uncapped (null)</option>
                        {QTR_OPTIONS.filter((o) => o.value !== null).map((q) => (
                          <option key={String(q.value)} value={String(q.value)}>{q.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-ink-3 mb-1">Historic Annual</label>
                      <select
                        value={historicMaxAnnualReportYears}
                        onChange={(e) => setHistoricMaxAnnualReportYears(e.target.value)}
                        className="w-full rounded-md border border-hair px-2 py-1.5 text-xs text-ink bg-card"
                      >
                        <option value="keep">— Keep Unchanged —</option>
                        <option value="null">Uncapped (null)</option>
                        {ANNUAL_OPTIONS.filter((o) => o.value !== null).map((y) => (
                          <option key={String(y.value)} value={String(y.value)}>{y.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-ink-3 mb-1">Historic Market Data</label>
                      <select
                        value={historicMaxMarketDataMonths}
                        onChange={(e) => setHistoricMaxMarketDataMonths(e.target.value)}
                        className="w-full rounded-md border border-hair px-2 py-1.5 text-xs text-ink bg-card"
                      >
                        <option value="keep">— Keep Unchanged —</option>
                        <option value="null">Uncapped (null)</option>
                        {MARKET_DATA_MONTHS_OPTIONS.filter((o) => o.value !== null).map((m) => (
                          <option key={String(m.value)} value={String(m.value)}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-hair px-4 py-2 text-xs font-medium text-ink-3 hover:text-ink hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || selectedSlugs.length === 0 || (!updateModels && !updateLookbacks)}
              className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-xs font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              Apply to {selectedSlugs.length} Lenses
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
