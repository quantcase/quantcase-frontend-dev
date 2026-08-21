"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, X, Play, Loader2, Save, Circle, ChevronDown, FileDown, History, Radio, HelpCircle, Layers, Trash2 } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";
import { HtmlSkill, TestTicker, FAVORITE_TICKERS, CATEGORY_LABELS, API_BASE, PromptDryRunResponse, HtmlSkillConfig, ConfigListResponse } from "./_components/types";
import { TickerSearch, TickerOption } from "./_components/TickerSearch";
import type { StocksApiResponse } from "@/types/screener";
import { SkillDetail, SkillDetailHandle } from "./_components/SkillDetail";
import { PreviewPane, PreviewControls } from "./_components/PreviewPane";
import { SignalsModal } from "./_components/SignalsModal";
import { OutputHistoryModal } from "./_components/OutputHistoryModal";
import { HelpModal } from "./_components/HelpModal";
import { ConfigsModal } from "./_components/ConfigsModal";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { TabToggle } from "@/components/molecules/tab-toggle";

export default function HtmlSkillsPageWrapper() {
  return (
    <Suspense>
      <HtmlSkillsPage />
    </Suspense>
  );
}

function HtmlSkillsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [skills, setSkills] = useState<HtmlSkill[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => searchParams.get("skill"));
  const [selectedSkill, setSelectedSkill] = useState<HtmlSkill | null>(null);

  const [ticker, setTicker] = useState<TestTicker | null>(() => (searchParams.get("ticker") as TestTicker) ?? null);
  const [tickerOptions, setTickerOptions] = useState<TickerOption[]>([]);

  // Historic and Incremental each remember their own selected period independently
  const [historicCallId, setHistoricCallId] = useState<string | null>(() => searchParams.get("callId"));
  const [incrementalCallId, setIncrementalCallId] = useState<string | null>(null);
  const { data: calls, tier } = useTranscriptCalls(ticker ?? "");
  // Default true — mirrors the original (pre-incremental) behavior; flip off to opt into incremental base-context mode
  const [historic, setHistoric] = useState(true);
  const [skillMode, setSkillMode] = useState<"Detailed" | "Compressed">("Detailed");
  const [isNewCompressedSkill, setIsNewCompressedSkill] = useState(false);
  const callId = historic ? historicCallId : incrementalCallId;

  const [previewControls, setPreviewControls] = useState<PreviewControls | null>(null);
  const [showSignals, setShowSignals] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showConfigsModal, setShowConfigsModal] = useState(false);

  // Saved config bundles for the selected skill — feeds the "Use config" run-screen dropdown.
  // Omitting configKey on a run means the skill's own top-level fields are used, same as before configs existed.
  const [configs, setConfigs] = useState<HtmlSkillConfig[]>([]);
  const [configKey, setConfigKey] = useState<string | null>(null);
  const [skillDirty, setSkillDirty] = useState(false);
  const skillDetailRef = useRef<SkillDetailHandle>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Load skill list ────────────────────────────────────────────────────────

  const loadSkills = useCallback(() => {
    setLoading(true);
    authFetch(`${BACKEND_URL}${API_BASE}?includeInactive=true`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? `${res.status}`);
        setSkills(json.skills ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadSkills(); }, [loadSkills]);

  // ── Load saved configs for the selected skill ──────────────────────────────

  const loadConfigs = useCallback((slug: string, mode: "Detailed" | "Compressed") => {
    const apiBase = mode === "Compressed" ? "/api/html-compressed-skills" : API_BASE;
    const effectiveSlug = mode === "Compressed" ? `${slug}-compressed` : slug;
    authFetch(`${BACKEND_URL}${apiBase}/${effectiveSlug}/configs`)
      .then(async (res) => {
        const json: ConfigListResponse = await res.json();
        if (!res.ok) throw new Error((json as unknown as { error?: string })?.error ?? `${res.status}`);
        setConfigs(json.configs ?? []);
      })
      .catch(() => setConfigs([]));
  }, []);

  useEffect(() => {
    setConfigKey(null);
    if (!selectedSlug) { setConfigs([]); return; }
    loadConfigs(selectedSlug, skillMode);
  }, [selectedSlug, skillMode, loadConfigs]);

  // Drop the selected config if it was deleted/renamed out from under the dropdown
  useEffect(() => {
    if (configKey && !configs.some((c) => c.key === configKey)) setConfigKey(null);
  }, [configs, configKey]);

  // ── Sync selectedSlug + ticker + callId → URL ─────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedSlug) params.set("skill", selectedSlug); else params.delete("skill");
    if (ticker) params.set("ticker", ticker); else params.delete("ticker");
    if (callId) params.set("callId", callId); else params.delete("callId");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [selectedSlug, ticker, callId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Resolve each mode's callId from the ticker's call list (default to most recent, independently) ─

  useEffect(() => {
    if (!ticker) { setHistoricCallId(null); setIncrementalCallId(null); return; }
    if (calls.length === 0) return;
    if (!calls.some((c) => c.id === historicCallId)) setHistoricCallId(calls[0].id);
    if (!calls.some((c) => c.id === incrementalCallId)) setIncrementalCallId(calls[0].id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, calls]);

  // ── Incremental needs a base to build on — force Historic until one exists ─

  useEffect(() => {
    if (previewControls?.hasBase === false) setHistoric(true);
  }, [previewControls?.hasBase]);

  // ── Default to "t3" config for Tier 3 companies ─

  useEffect(() => {
    if (tier === "Tier 3" && configs.some(c => c.key === "t3")) {
      setConfigKey("t3");
    }
  }, [tier, configs]);

  // ── Load stocks for ticker search ──────────────────────────────────────────

  useEffect(() => {
    authFetch(`${BACKEND_URL}/api/transcript/stocks`)
      .then(async (res) => {
        const json: StocksApiResponse = await res.json();
        setTickerOptions(
          (json.data ?? []).map((s) => ({ symbol: s.company, name: s.company_name || s.company }))
        );
      })
      .catch(() => {});
  }, []);

  // ── Load single skill (with prompt) when selection changes ─────────────────

  useEffect(() => {
    setSkillDirty(false);
    if (!selectedSlug) { setSelectedSkill(null); return; }
    
    const currentApiBase = skillMode === "Compressed" ? "/api/html-compressed-skills" : API_BASE;
    const currentSlug = skillMode === "Compressed" ? `${selectedSlug}-compressed` : selectedSlug;
    
    authFetch(`${BACKEND_URL}${currentApiBase}/${currentSlug}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? `${res.status}`);
        setSelectedSkill(json);
        if (skillMode === "Compressed") setIsNewCompressedSkill(false);
      })
      .catch((err) => {
        if (skillMode === "Compressed") {
          // If the compressed skill doesn't exist yet, we initialize a dummy one
          const baseSkill = skills.find((s) => s.slug === selectedSlug);
          if (baseSkill) {
            setSelectedSkill({
              id: "new",
              slug: `${selectedSlug}-compressed`,
              name: `${baseSkill.name} (Compressed)`,
              category: baseSkill.category,
              base_l2_skill_id: baseSkill.id,
              html_template_prompt: "",
              html_template_filename: `${selectedSlug}-compressed.hbs`,
              is_active: true,
              max_tokens: baseSkill.max_tokens,
              use_template_engine: true,
              transcript_signal_types: baseSkill.transcript_signal_types ?? [],
              ppt_signal_types: baseSkill.ppt_signal_types ?? [],
              annual_report_signal_types: baseSkill.annual_report_signal_types ?? [],
              market_data_signal_types: baseSkill.market_data_signal_types ?? [],
            } as any);
            setIsNewCompressedSkill(true);
            setError(null); // Clear error so UI renders the creation form
          } else {
            setSelectedSkill(null);
            setError("Base skill not found.");
          }
        } else {
          setError(err.message);
        }
      });
  }, [selectedSlug, skillMode, skills]);

  // ── Save skill ─────────────────────────────────────────────────────────────

  function handleSaveSkill(updates: Partial<Omit<HtmlSkill, "id" | "created_at" | "updated_at">>) {
    if (!selectedSlug) return;
    setSaving(true);
    setSaveError(null);
    const currentApiBase = skillMode === "Compressed" ? "/api/html-compressed-skills" : API_BASE;
    const currentSlug = skillMode === "Compressed" ? `${selectedSlug}-compressed` : selectedSlug;
    
    const isCreating = skillMode === "Compressed" && isNewCompressedSkill;
    const method = isCreating ? "POST" : "PUT";
    const saveUrl = isCreating ? `${BACKEND_URL}${currentApiBase}` : `${BACKEND_URL}${currentApiBase}/${currentSlug}`;

    // For POST, we must include required fields from selectedSkill (like base_l2_skill_id) that might not be in 'updates'
    const payload = isCreating ? { ...selectedSkill, ...updates } : updates;

    authFetch(saveUrl, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? `${res.status}`);
        setSelectedSkill(json);
        if (skillMode === "Compressed") setIsNewCompressedSkill(false);
        
        // Only update the main skill list if we are saving the base skill
        if (skillMode !== "Compressed") {
          setSkills((prev) => prev.map((s) => (s.slug === selectedSlug ? { ...s, ...json } : s)));
        }
      })
      .catch((err) => setSaveError(err.message))
      .finally(() => setSaving(false));
  }

  // ── Save / create / delete a config bundle ──────────────────────────────────

  function handleSaveConfig(key: string, updates: Record<string, unknown>) {
    if (!selectedSlug) return;
    setSaving(true);
    setSaveError(null);

    // Compressed skill configs live under a different route than base L2 configs.
    const isCompressed = skillMode === "Compressed";
    const saveUrl = isCompressed
      ? `${BACKEND_URL}/api/html-compressed-skills/${selectedSlug}-compressed/configs/${key}`
      : `${BACKEND_URL}${API_BASE}/${selectedSlug}/configs/${key}`;

    authFetch(saveUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? `${res.status}`);
        setConfigs((prev) => prev.map((c) => (c.key === key ? { ...c, ...json } : c)));
      })
      .catch((err) => setSaveError(err.message))
      .finally(() => setSaving(false));
  }

  function handleCreateConfig(key: string, name: string) {
    if (!selectedSlug || !selectedSkill) return;
    setSaving(true);
    setSaveError(null);

    const isCompressedMode = skillMode === "Compressed";

    // Compressed skill configs only carry the three rendering fields — they have no signal windows,
    // extraction prompts, or validation settings. L2 configs are seeded from the full skill state.
    const payload = isCompressedMode
      ? {
          key, name,
          html_template_prompt: selectedSkill.html_template_prompt ?? "",
          html_template_filename: selectedSkill.html_template_filename ?? null,
          html_template_model: selectedSkill.html_template_model ?? null,
        }
      : {
          key, name,
          // Seed the new config as an explicit copy of the skill's current settings — a starting
          // point to tweak from, not an "inherit" relationship (configs never fall back to the
          // skill except for model/max_tokens/strip_html).
          data_extraction_prompt: selectedSkill.data_extraction_prompt ?? "",
          html_template_prompt: selectedSkill.html_template_prompt ?? "",
          html_template_filename: selectedSkill.html_template_filename ?? null,
          use_template_engine: selectedSkill.use_template_engine ?? true,
          enable_data_validation: selectedSkill.enable_data_validation ?? true,
          data_validation_loops: selectedSkill.data_validation_loops ?? 1,
          enable_html_validation: selectedSkill.enable_html_validation ?? false,
          transcript_signal_types: selectedSkill.transcript_signal_types,
          ppt_signal_types: selectedSkill.ppt_signal_types,
          annual_report_signal_types: selectedSkill.annual_report_signal_types,
          market_data_signal_types: selectedSkill.market_data_signal_types,
          max_transcript_qtrs: selectedSkill.max_transcript_qtrs,
          max_ppt_qtrs: selectedSkill.max_ppt_qtrs,
          max_annual_report_years: selectedSkill.max_annual_report_years,
          max_market_data_months: selectedSkill.max_market_data_months,
          historic_max_transcript_qtrs: selectedSkill.historic_max_transcript_qtrs,
          historic_max_ppt_qtrs: selectedSkill.historic_max_ppt_qtrs,
          historic_max_annual_report_years: selectedSkill.historic_max_annual_report_years,
          historic_max_market_data_months: selectedSkill.historic_max_market_data_months,
          extraction_model: null,
          fact_validation_model: null,
          html_template_model: null,
          visual_qa_model: null,
          max_tokens: null, strip_html: null,
        };

    const createUrl = isCompressedMode
      ? `${BACKEND_URL}/api/html-compressed-skills/${selectedSlug}-compressed/configs`
      : `${BACKEND_URL}${API_BASE}/${selectedSlug}/configs`;

    authFetch(createUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? `${res.status}`);
        loadConfigs(selectedSlug, skillMode);
        setConfigKey(json.key ?? key);
        setShowConfigsModal(false);
      })
      .catch((err) => setSaveError(err.message))
      .finally(() => setSaving(false));
  }

  function handleDeleteConfig(key: string) {
    if (!selectedSlug) return;
    const isCompressedMode = skillMode === "Compressed";
    const deleteUrl = isCompressedMode
      ? `${BACKEND_URL}/api/html-compressed-skills/${selectedSlug}-compressed/configs/${key}`
      : `${BACKEND_URL}${API_BASE}/${selectedSlug}/configs/${key}`;
    authFetch(deleteUrl, { method: "DELETE" })
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.error ?? `${res.status}`);
        }
        if (configKey === key) setConfigKey(null);
        loadConfigs(selectedSlug, skillMode);
      })
      .catch((err) => setError(err.message));
  }

  const [exportingPrompt, setExportingPrompt] = useState(false);

  async function handleExportPrompt() {
    if (!selectedSlug || !ticker || !callId) return;
    if (!historic && previewControls?.hasBase === false) {
      setError("No base output exists for this ticker yet — run Historic first");
      return;
    }
    setExportingPrompt(true);
    try {
      const params = new URLSearchParams({ callId });
      if (historic) params.set("historic", "true");
      if (configKey) params.set("configKey", configKey);
      const res = await authFetch(`${BACKEND_URL}${API_BASE}/${selectedSlug}/prompt/${ticker}?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? `${res.status}`);

      const { slug, ticker: t, systemPrompt, userPrompt } = json as PromptDryRunResponse;
      const md = `${systemPrompt}\n\n${userPrompt}`;

      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}__${t}${historic ? "__historic" : ""}${configKey ? `__${configKey}` : ""}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExportingPrompt(false);
    }
  }

  const selectedCall = calls.find((c) => c.id === callId) ?? null;
  const selectedConfig = configs.find((c) => c.key === configKey) ?? null;

  const byCategory = skills.reduce<Record<string, HtmlSkill[]>>((acc, skill) => {
    const cat = skill.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main area — full width, no sidebar */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Two-column header — mirrors the split panel below */}
        <div className="flex shrink-0 border-b border-[var(--qc-border-default)] bg-[var(--qc-card)]">

          {/* Left column: skill selector dropdown + save (480px, matches detail panel) */}
          <div className="w-[480px] shrink-0 flex items-center gap-2 px-4 py-3 border-r border-[var(--qc-border-default)]">
            {/* Skill selector dropdown */}
            <div className="relative flex-1 min-w-0">
              <select
                value={selectedSlug ?? ""}
                onChange={(e) => setSelectedSlug(e.target.value || null)}
                disabled={loading}
                className={`w-full appearance-none rounded-md border border-[var(--qc-border-default)] bg-card pl-3 pr-8 py-1.5 text-[13px] outline-none focus:border-hair-strong disabled:opacity-50 cursor-pointer ${selectedSlug ? "text-[var(--qc-ink)]" : "text-ink-3"}`}
              >
                <option value="" disabled={skills.length > 0}>
                  {loading ? "Loading…" : skills.length === 0 ? "No skills" : "Select a skill…"}
                </option>
                {Object.entries(byCategory).map(([cat, catSkills]) => (
                  <optgroup key={cat} label={CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}>
                    {catSkills.map((s) => (
                      <option key={s.slug} value={s.slug}>{s.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-3" />
            </div>

            {/* Active indicator + slug */}
            {selectedSkill && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Circle className={`size-1.5 ${selectedSkill.is_active ? "fill-up text-up" : "fill-ink-3 text-ink-3"}`} />
              </div>
            )}

            {/* Which settings the panel below is currently editing — the skill's own defaults, or a saved config */}
            {selectedSkill && configKey && (
              <span className="shrink-0 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide bg-blue-soft text-blue">
                editing: {selectedConfig?.name ?? configKey}
              </span>
            )}

            {saveError && <span className="text-[11px] text-down shrink-0">{saveError}</span>}
            {selectedSkill && (
              <button
                onClick={() => skillDetailRef.current?.save()}
                disabled={saving || !skillDirty}
                className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
              >
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Save
              </button>
            )}
            {selectedSkill && configKey && (
              <button
                onClick={() => handleDeleteConfig(configKey)}
                title="Delete this config"
                className="flex items-center justify-center size-7 rounded border border-[var(--qc-border-default)] text-ink-3 hover:text-down hover:border-down transition-colors shrink-0"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}

            {/* Always available — explains Historic/Incremental, the global pin, and every field on this page */}
            <button
              onClick={() => setShowHelp(true)}
              title="Help"
              className="flex items-center justify-center size-7 rounded border border-[var(--qc-border-default)] text-ink-3 hover:text-[var(--qc-ink)] hover:border-[var(--qc-ink)] transition-colors shrink-0"
            >
              <HelpCircle className="size-3.5" />
            </button>
          </div>

          {/* Right column: two stacked rows — "what to run" on top, "config + inspect + results" below.
              Splitting it this way (rather than one long row) is what keeps it from overflowing off-screen
              once the config picker and result badges are all present at once. */}
          <div className="flex flex-1 flex-col gap-2 px-5 py-2.5 min-w-0">
            {selectedSkill && (
              <>
                {/* Row 1 — what to run, and go */}
                <div className="flex items-center gap-3 min-w-0">
                  <TickerSearch
                    value={ticker}
                    onChange={setTicker}
                    options={tickerOptions}
                    favorites={[...FAVORITE_TICKERS]}
                  />

                  {ticker && tier && (
                    <span 
                      className="shrink-0 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide bg-blue-soft text-blue"
                      title={tier === "Tier 3" ? "Only annual reports are available for this company." : undefined}
                    >
                      {tier}
                    </span>
                  )}

                  {/* Historic / Incremental — prominent, defaults to Historic (original behavior).
                      Incremental needs a base to build on, so it's unavailable until a first output exists. */}
                  {ticker && tier !== "Tier 0" && tier !== "Tier 0.5" && (
                    <TabToggle
                      variant="outline"
                      options={previewControls?.hasBase === false ? ["Historic"] : ["Historic", "Incremental"]}
                      value={historic ? "Historic" : "Incremental"}
                      onChange={(v) => setHistoric(v === "Historic")}
                      className="shrink-0"
                    />
                  )}
                  {ticker && tier !== "Tier 0" && tier !== "Tier 0.5" && (
                    <TabToggle
                      variant="outline"
                      options={["Detailed", "Compressed"]}
                      value={skillMode}
                      onChange={(v) => setSkillMode(v as "Detailed" | "Compressed")}
                      className="shrink-0"
                    />
                  )}
                  {ticker && skillMode === "Detailed" && previewControls?.hasBase === false && tier !== "Tier 0" && tier !== "Tier 0.5" && (
                    <span className="text-[11px] text-warn shrink-0">No base yet — run Historic first</span>
                  )}

                  {/* Pick the fiscal year/quarter that resolves to callId — Historic and Incremental each keep their own selection */}
                  {ticker && (tier === "Tier 0" || tier === "Tier 0.5") ? (
                    <span className="text-[12px] font-medium text-down shrink-0">This company is not eligible for HTML Skill execution.</span>
                  ) : ticker && (
                    <div className="relative shrink-0">
                      <select
                        value={callId ?? ""}
                        onChange={(e) => {
                          const v = e.target.value || null;
                          if (historic) setHistoricCallId(v); else setIncrementalCallId(v);
                        }}
                        disabled={calls.length === 0}
                        title={`Fiscal year / quarter for this ${historic ? "historic" : "incremental"} run`}
                        className="appearance-none rounded-md border border-[var(--qc-border-default)] bg-card pl-2.5 pr-7 py-1.5 text-[12px] font-medium text-[var(--qc-ink)] outline-none focus:border-hair-strong disabled:opacity-50 cursor-pointer"
                      >
                        {calls.length === 0 && <option value="">No calls</option>}
                        {calls.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.quarter ? `${c.quarter} ${c.fiscal_year}` : `${c.fiscal_year} Annual Report`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3 text-ink-3" />
                    </div>
                  )}

                  <div className="flex-1" />

                  {/* Export full prompt */}
                  <button
                    onClick={handleExportPrompt}
                    disabled={exportingPrompt || !callId || tier === "Tier 0" || tier === "Tier 0.5"}
                    title="Export full prompt as .md"
                    className="flex items-center justify-center size-7 rounded border border-[var(--qc-border-default)] text-ink-3 hover:text-[var(--qc-ink)] hover:border-[var(--qc-ink)] transition-colors disabled:opacity-40 shrink-0"
                  >
                    {exportingPrompt ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
                  </button>

                  {/* Regenerate HTML */}
                  <button
                    onClick={() => previewControls?.regenerate()}
                    disabled={previewControls?.running || !callId || tier === "Tier 0" || tier === "Tier 0.5" || !previewControls?.result?.output?.extracted_json}
                    className="flex items-center gap-1.5 rounded-md border border-[var(--qc-border-default)] px-3 py-1.5 text-[12px] font-medium text-[var(--qc-ink)] hover:bg-[var(--qc-surface-hover)] transition-colors disabled:opacity-40 shrink-0"
                  >
                    {previewControls?.running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
                    Regenerate HTML
                  </button>

                  {/* Run */}
                  <button
                    onClick={() => previewControls?.run(true)}
                    disabled={previewControls?.running || !callId || tier === "Tier 0" || tier === "Tier 0.5"}
                    className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
                  >
                    {previewControls?.running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
                    Run
                  </button>
                </div>

                {/* Row 2 — config selection + inspection tools + last-run metadata */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Config selection — kept visually distinct because it's the entry point to the wider flow:
                      try a config here against various tickers, then pin it to a Company Group in
                      Coverage → L2 so bulk L2 dispatch resolves it automatically per ticker. */}
                  <div className="flex items-center gap-1.5 rounded-md border border-blue bg-blue-soft px-1.5 py-1 shrink-0">
                    {ticker && configs.length > 0 && (
                      <div className="relative">
                        <select
                          value={configKey ?? ""}
                          onChange={(e) => setConfigKey(e.target.value || null)}
                          title="Use a saved config bundle for this run — pin one to a Company Group in Coverage → L2 to scale it up"
                          className="appearance-none rounded-md border border-blue bg-card pl-2.5 pr-7 py-1 text-[12px] font-medium text-blue outline-none focus:ring-1 focus:ring-blue cursor-pointer"
                        >
                          <option value="">Default config</option>
                          {configs.map((c) => (
                            <option key={c.key} value={c.key}>{c.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3 text-blue" />
                      </div>
                    )}
                    <button
                      onClick={() => setShowConfigsModal(true)}
                      title="Create, edit, and try saved configs — then pin one to a Company Group in Coverage → L2 for bulk dispatch"
                      className="flex items-center gap-1 rounded-md bg-blue px-2.5 py-1 text-[12px] font-semibold text-[var(--qc-on-dark)] hover:bg-blue transition-colors shrink-0"
                    >
                      <Layers className="size-3" />
                      Configs
                    </button>
                  </div>

                  {/* Inspect the exact signals feeding this run — count is fetched inside the modal (mode/base-aware, too heavy to preview here) */}
                  {ticker && (
                    <button
                      onClick={() => setShowSignals(true)}
                      className="flex items-center gap-1 text-[13px] font-medium text-ink-3 hover:text-[var(--qc-ink)] underline underline-offset-2 decoration-dotted transition-colors shrink-0"
                    >
                      <Radio className="size-3" />
                      Signals
                    </button>
                  )}

                  {/* Browse past outputs for this ticker — the base pin itself is set skill-wide in the editor */}
                  {ticker && (
                    <button
                      onClick={() => setShowHistoryModal(true)}
                      title="Browse past outputs for this ticker"
                      className="flex items-center gap-1 text-[13px] font-medium text-ink-3 hover:text-[var(--qc-ink)] underline underline-offset-2 decoration-dotted transition-colors shrink-0"
                    >
                      <History className="size-3" />
                      History
                    </button>
                  )}

                  <div className="flex-1" />

                  {/* Run metadata */}
                  {previewControls?.result && (
                    <span className={`text-[10px] font-medium rounded-sm px-2 py-0.5 shrink-0 ${
                      previewControls.result.cached ? "bg-secondary text-ink-2" : "bg-up-soft text-up"
                    }`}>
                      {previewControls.result.cached ? "cached" : "fresh"}
                    </span>
                  )}
                  {previewControls?.result?.output && (
                    <span className="text-[10px] text-ink-3 shrink-0">
                      {previewControls.result.output.input_tokens + previewControls.result.output.output_tokens} tok
                      {" · "}${previewControls.result.output.cost_usd?.toFixed(5) ?? "—"}
                    </span>
                  )}
                  {previewControls?.result?.output?.config_key && (
                    <span className="text-[10px] font-medium rounded-sm px-2 py-0.5 bg-blue-soft text-blue shrink-0">
                      config: {previewControls.result.output.config_key}
                    </span>
                  )}
                </div>
              </>
            )}

          </div>
        </div>

        {/* Global error */}
        {error && (
          <div className="flex items-center gap-2 mx-5 mt-3 rounded-md border border-down bg-down-soft px-4 py-2.5 text-[12px] text-down shrink-0">
            <AlertCircle className="size-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-down hover:text-down">
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Split panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: skill detail or empty state */}
          <div className="w-[480px] shrink-0 border-r border-[var(--qc-border-default)] overflow-hidden">
            {selectedSkill ? (
              <SkillDetail
                key={`${selectedSkill.slug}::${configKey ?? "__default__"}`}
                ref={skillDetailRef}
                skill={selectedSkill}
                config={selectedConfig}
                ticker={ticker ?? ""}
                historic={historic}
                skillMode={skillMode}
                saving={saving}
                saveError={saveError}
                hideHeader
                onSave={(updates) => {
                  if (configKey) handleSaveConfig(configKey, updates);
                  else handleSaveSkill(updates as Partial<Omit<HtmlSkill, "id" | "created_at" | "updated_at">>);
                  setSkillDirty(false);
                }}
                onDirtyChange={setSkillDirty}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[13px] text-ink-3">
                {loading ? "Loading skills…" : "Select a skill to edit"}
              </div>
            )}
          </div>

          {/* Right: preview or empty state */}
          <div className="flex-1 overflow-hidden">
            {selectedSkill && ticker ? (
              <PreviewPane
                key={`${selectedSkill.slug}::${skillMode}`}
                slug={selectedSlug!}
                ticker={ticker}
                callId={callId}
                fiscalYear={selectedCall?.fiscal_year ?? null}
                quarter={selectedCall?.quarter ?? null}
                historic={historic}
                configKey={configKey}
                skillMode={skillMode}
                onControls={setPreviewControls}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[13px] text-ink-3">
                {!selectedSkill ? "Select a skill to preview" : "Select a ticker to preview"}
              </div>
            )}
          </div>
        </div>
      </div>

      {showSignals && selectedSkill && ticker && (
        <SignalsModal
          slug={selectedSkill.slug}
          ticker={ticker}
          historic={historic}
          onClose={() => setShowSignals(false)}
        />
      )}

      {showHistoryModal && selectedSkill && ticker && (
        <OutputHistoryModal
          slug={selectedSkill.slug}
          ticker={ticker}
          pinnedFiscalYear={selectedSkill.pinned_fiscal_year}
          pinnedQuarter={selectedSkill.pinned_quarter}
          pinnedHistoric={selectedSkill.pinned_historic}
          pinning={saving}
          onPin={(fiscalYear, quarter, historicPin) => {
            handleSaveSkill({ pinned_fiscal_year: fiscalYear, pinned_quarter: quarter, pinned_historic: historicPin });
          }}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {showConfigsModal && selectedSkill && (
        <ConfigsModal
          configs={configs}
          onSelect={(key) => { setConfigKey(key); setShowConfigsModal(false); }}
          onCreate={handleCreateConfig}
          onDelete={handleDeleteConfig}
          onClose={() => setShowConfigsModal(false)}
        />
      )}
    </div>
  );
}
