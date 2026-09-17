"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Bot,
  Clock,
  Sliders,
  RefreshCw,
  Edit3,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Check,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";
import {
  LensTierSummary,
  LensSkillMeta,
  LensTierMatrixResponse,
} from "./types";
import { HtmlSkillConfig, MODEL_OPTIONS } from "@/app/(app)/admin/html-skills/_components/types";
import { BulkUpdateTierModal } from "./BulkUpdateTierModal";
import { LensConfigDrawer } from "./LensConfigDrawer";

const TIER_DESCRIPTIONS: Record<string, string> = {
  t1: "Full Data Availability: Transcripts, presentation decks (PPT), and annual reports are all expected and processed.",
  t2: "No Transcripts: Only presentation decks (PPT) and annual reports are processed. Transcript lookbacks are typically disabled.",
  t3: "Annual Report Only: Only annual reports are processed. Both transcript and presentation lookbacks are typically disabled.",
};

export function LensTierConfigsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [tiers, setTiers] = useState<LensTierSummary[]>([]);
  const [lenses, setLenses] = useState<LensSkillMeta[]>([]);
  const [configs, setConfigs] = useState<Record<string, Record<string, HtmlSkillConfig>>>({});

  const [selectedTierKey, setSelectedTierKey] = useState<string>("t1");

  // Modals & Drawers
  const [editingLens, setEditingLens] = useState<LensSkillMeta | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${BACKEND_URL}/admin/pipeline-dispatch/lens-tier-configs`);
      const json: LensTierMatrixResponse = await res.json();
      if (!res.ok) {
        throw new Error((json as unknown as { error?: string })?.error ?? `HTTP ${res.status}`);
      }

      setTiers(json.tiers || []);
      setLenses(json.lenses || []);
      setConfigs(json.configs || {});

      // Keep current selection or default to t1
      if (json.tiers && json.tiers.length > 0) {
        setSelectedTierKey((prev) => (json.tiers.some((t) => t.key === prev) ? prev : json.tiers[0].key));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load lens tier configurations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeTier = tiers.find((t) => t.key === selectedTierKey) || {
    key: selectedTierKey,
    name: selectedTierKey.toUpperCase(),
    lensCount: 10,
  };

  const getModelLabel = (modelValue: string | null | undefined) => {
    if (!modelValue) return "Inherit / Default";
    const found = MODEL_OPTIONS.find((m) => m.value === modelValue);
    return found ? found.label : modelValue.split("/").pop()?.split(":").shift() || modelValue;
  };

  const handleSaveConfigSuccess = (updatedConfig: HtmlSkillConfig) => {
    if (!editingLens) return;
    setConfigs((prev) => ({
      ...prev,
      [selectedTierKey]: {
        ...(prev[selectedTierKey] || {}),
        [editingLens.slug]: updatedConfig,
      },
    }));
    setSuccessMessage(`Updated ${editingLens.name} for ${activeTier.name}`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleBulkSuccess = () => {
    loadData();
    setSuccessMessage(`Successfully bulk-updated selected lenses for ${activeTier.name}`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="rounded-xl border border-hair bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-semibold text-ink">Lens Tier Configurations</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-ink/5 border border-hair text-ink font-medium">
                10 Canonical Lenses
              </span>
            </div>
            <p className="text-[13px] text-ink-2 mt-1 max-w-3xl">
              Inspect and configure prompt templates, models, and lookback windows for all 10 lenses per tier
              scenario. These settings directly drive L2 multi-dispatch runs when companies are tagged by tier.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              disabled={loading || lenses.length === 0}
              className="flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-xs font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40 shadow-xs"
            >
              <Sliders className="size-3.5" />
              Bulk Update Models & Lookbacks
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh configurations"
              className="flex items-center justify-center size-8 rounded-md border border-hair text-ink-3 hover:text-ink hover:border-hair-strong transition-colors"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Tier Selector Tabs */}
        <div className="pt-2 border-t border-hair flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3 mr-1">
              Select Tier:
            </span>
            {tiers.map((tier) => {
              const isSelected = tier.key === selectedTierKey;
              return (
                <button
                  key={tier.key}
                  onClick={() => setSelectedTierKey(tier.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-ink text-[var(--qc-on-dark)] shadow-xs"
                      : "bg-secondary text-ink-3 hover:text-ink hover:bg-secondary/80 border border-hair"
                  }`}
                >
                  <span className="font-mono">{tier.key.toUpperCase()}</span>
                  <span className="opacity-80">·</span>
                  <span className="truncate max-w-[180px]">{tier.name.split("—")[0].trim()}</span>
                </button>
              );
            })}
          </div>

          {activeTier && (
            <div className="text-xs text-ink-3 font-mono">
              Tier Key: <span className="text-ink font-semibold">{activeTier.key}</span>
            </div>
          )}
        </div>

        {/* Tier Description Hint */}
        {TIER_DESCRIPTIONS[selectedTierKey] && (
          <div className="rounded-lg bg-secondary/30 border border-hair/60 px-3.5 py-2 text-xs text-ink-2 flex items-center gap-2">
            <Layers className="size-3.5 text-ink-3 shrink-0" />
            <span>{TIER_DESCRIPTIONS[selectedTierKey]}</span>
          </div>
        )}
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-down/30 bg-down/5 text-down text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-up/30 bg-up/5 text-up text-xs animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main 10-Lens Table */}
      <div className="rounded-xl border border-hair bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-secondary/50 border-b border-hair text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
                <th className="px-4 py-3 min-w-[200px]">Lens Name</th>
                <th className="px-4 py-3 min-w-[160px]">Models (Ext / Tmpl)</th>
                <th className="px-4 py-3 min-w-[150px]">Incremental Lookback</th>
                <th className="px-4 py-3 min-w-[150px]">Historic Lookback</th>
                <th className="px-4 py-3 min-w-[150px]">Signals Enabled</th>
                <th className="px-4 py-3 min-w-[180px]">Template & Validation</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-hair">
              {loading && lenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-ink-3">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-ink-3" />
                    Loading configurations for all 10 lenses...
                  </td>
                </tr>
              ) : lenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-3">
                    No active lenses found.
                  </td>
                </tr>
              ) : (
                lenses.map((lens) => {
                  const cfg = configs[selectedTierKey]?.[lens.slug];
                  const hasConfig = !!cfg;

                  const transcriptCount = cfg?.transcript_signal_types?.length ?? 0;
                  const pptCount = cfg?.ppt_signal_types?.length ?? 0;
                  const arCount = cfg?.annual_report_signal_types?.length ?? 0;

                  return (
                    <tr
                      key={lens.slug}
                      className="hover:bg-secondary/30 transition-colors group cursor-pointer"
                      onClick={() => cfg && setEditingLens(lens)}
                    >
                      {/* Lens Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink text-[13px]">{lens.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-ink-3 border border-hair font-mono">
                            {lens.category}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-ink-3 mt-0.5">{lens.slug}</div>
                      </td>

                      {/* Models */}
                      <td className="px-4 py-3.5">
                        {hasConfig ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-ink-3 uppercase font-medium">Ext:</span>
                              <span
                                className="font-mono text-[11px] text-ink truncate max-w-[120px]"
                                title={cfg.extraction_model || "Inherit"}
                              >
                                {getModelLabel(cfg.extraction_model)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-ink-3 uppercase font-medium">Tmpl:</span>
                              <span
                                className="font-mono text-[11px] text-ink-3 truncate max-w-[120px]"
                                title={cfg.html_template_model || "Inherit"}
                              >
                                {getModelLabel(cfg.html_template_model)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-ink-3 italic">Not configured</span>
                        )}
                      </td>

                      {/* Incremental Lookback */}
                      <td className="px-4 py-3.5">
                        {hasConfig ? (
                          <div className="space-y-0.5 text-[11.5px] font-mono">
                            <div className="text-ink">
                              Trans: <span className="font-semibold">{cfg.max_transcript_qtrs ?? "∞"}Q</span> · PPT:{" "}
                              <span className="font-semibold">{cfg.max_ppt_qtrs ?? "∞"}Q</span>
                            </div>
                            <div className="text-ink-3 text-[11px]">
                              AR: <span className="font-medium text-ink">{cfg.max_annual_report_years ?? "∞"}Y</span>
                              {cfg.max_market_data_months != null && ` · MD: ${cfg.max_market_data_months}M`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-ink-3 italic">—</span>
                        )}
                      </td>

                      {/* Historic Lookback */}
                      <td className="px-4 py-3.5">
                        {hasConfig ? (
                          <div className="space-y-0.5 text-[11.5px] font-mono">
                            <div className="text-ink">
                              Trans: <span className="font-semibold">{cfg.historic_max_transcript_qtrs ?? "∞"}Q</span> · PPT:{" "}
                              <span className="font-semibold">{cfg.historic_max_ppt_qtrs ?? "∞"}Q</span>
                            </div>
                            <div className="text-ink-3 text-[11px]">
                              AR: <span className="font-medium text-ink">{cfg.historic_max_annual_report_years ?? "∞"}Y</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-ink-3 italic">—</span>
                        )}
                      </td>

                      {/* Signals Enabled */}
                      <td className="px-4 py-3.5">
                        {hasConfig ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  transcriptCount > 0
                                    ? "bg-up/10 text-up font-medium"
                                    : "bg-secondary text-ink-3"
                                }`}
                              >
                                {transcriptCount} Trans
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  pptCount > 0 ? "bg-up/10 text-up font-medium" : "bg-secondary text-ink-3"
                                }`}
                              >
                                {pptCount} PPT
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  arCount > 0 ? "bg-up/10 text-up font-medium" : "bg-secondary text-ink-3"
                                }`}
                              >
                                {arCount} AR
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-ink-3 italic">—</span>
                        )}
                      </td>

                      {/* Template & Validation */}
                      <td className="px-4 py-3.5">
                        {hasConfig ? (
                          <div className="space-y-1">
                            <div
                              className="text-[11px] font-mono text-ink truncate max-w-[170px]"
                              title={cfg.html_template_filename || "Default template"}
                            >
                              {cfg.html_template_filename || "—"}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10.5px]">
                              {cfg.enable_data_validation ? (
                                <span className="text-up font-medium flex items-center gap-0.5">
                                  <ShieldCheck className="size-3" /> Fact Validated ({cfg.data_validation_loops || 1}L)
                                </span>
                              ) : (
                                <span className="text-ink-3">Validation Off</span>
                              )}
                              {cfg.use_template_engine && (
                                <span className="text-ink-3">· HBS</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-ink-3 italic">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => cfg && setEditingLens(lens)}
                          disabled={!hasConfig}
                          className="inline-flex items-center gap-1 rounded-md border border-hair bg-card px-2.5 py-1.5 text-xs font-medium text-ink hover:border-ink hover:bg-secondary transition-colors"
                        >
                          <Edit3 className="size-3 text-ink-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Lens Config Drawer */}
      {editingLens && configs[selectedTierKey]?.[editingLens.slug] && (
        <LensConfigDrawer
          tier={activeTier}
          lens={editingLens}
          config={configs[selectedTierKey][editingLens.slug]}
          onClose={() => setEditingLens(null)}
          onSaveSuccess={handleSaveConfigSuccess}
        />
      )}

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <BulkUpdateTierModal
          tier={activeTier}
          lenses={lenses}
          onClose={() => setShowBulkModal(false)}
          onSuccess={handleBulkSuccess}
        />
      )}
    </div>
  );
}
