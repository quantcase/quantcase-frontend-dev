"use client";

import { useState, useEffect, useRef } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Play,
  Check,
  Loader2,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import { apiCall, apiPost, apiPut } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { SectionPanel } from "@/components/molecules/section-panel";

// ── Types ─────────────────────────────────────────────────────────────────────

type MetricType = "kpi_abbr" | "enum" | "free_text" | "fixed";
type MetricFamilyType = "fixed" | "enum";

interface MetricConfig {
  type: MetricType;
  value?: string;
  values?: string[];
  instructions?: string;
}

interface MetricFamilyConfig {
  type: MetricFamilyType;
  value?: string;
  values?: string[];
}

interface ExtraField {
  name: string;
  type: "enum" | "free_text";
  values?: string[];
  instructions?: string;
}

interface SignalTypeDefinition {
  slug: string;
  label: string;
  active: boolean;
  description: string;
  metric: MetricConfig;
  metric_family: MetricFamilyConfig;
  value_instructions: string;
  raw_value_instructions: string;
  active_fields: string[];
  extra_fields: ExtraField[];
}

interface L1SkillDetail {
  id: string;
  model: string;
  maxTokens: number;
  config: { signal_type_definitions?: SignalTypeDefinition[] } | null;
}

interface PreviewSignal {
  signal_type: string;
  metric: string;
  value: string;
  impact: string;
  statement: string;
}

interface PreviewNewKpi {
  abbr: string;
  full_form: string;
  kpi_type: string;
}

interface PreviewData {
  signals: PreviewSignal[];
  new_kpis: PreviewNewKpi[];
  signal_types_used: string[];
  signal_count: number;
  model: string;
  prompt_length?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const AVAILABLE_ACTIVE_FIELDS = [
  "unit",
  "multiplier",
  "start_date",
  "end_date",
  "period_type",
  "statement",
];
const METRIC_TYPES: MetricType[] = ["kpi_abbr", "enum", "free_text", "fixed"];
const METRIC_FAMILY_TYPES: MetricFamilyType[] = ["fixed", "enum"];

// ── Draft ─────────────────────────────────────────────────────────────────────

interface Draft {
  model: string;
  maxTokens: number;
  definitions: SignalTypeDefinition[];
  _keys: string[]; // parallel UI-only keys, stripped on save
}

function makeKey() {
  return Math.random().toString(36).slice(2);
}

function draftFromSkill(s: L1SkillDetail): Draft {
  const defs = s.config?.signal_type_definitions ?? [];
  return {
    model: s.model,
    maxTokens: s.maxTokens,
    definitions: defs,
    _keys: defs.map((d) => d.slug || makeKey()),
  };
}

function emptyDefinition(): SignalTypeDefinition {
  return {
    slug: "",
    label: "",
    active: false,
    description: "",
    metric: { type: "free_text", instructions: "" },
    metric_family: { type: "fixed", value: "" },
    value_instructions: "",
    raw_value_instructions: "",
    active_fields: [],
    extra_fields: [],
  };
}

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

// ── L1SkillTab ────────────────────────────────────────────────────────────────

export function L1SkillTab() {
  const [skillId, setSkillId] = useState<string | null>(null);
  const [saved, setSaved] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const [previewCallId, setPreviewCallId] = useState("");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<PreviewData | null>(null);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [cooldownSecs, setCooldownSecs] = useState(0);

  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    apiCall<{ success: boolean; data: { id: string; slug: string }[] }>(
      `${BACKEND_URL}/admin/skills`,
      {
        onStart: () => setIsLoading(true),
        onSuccess: (res) => {
          const found = res.data.find((s) => s.slug === "summarization");
          if (!found) {
            setLoadError("Summarization skill not found");
            setIsLoading(false);
            return;
          }
          setSkillId(found.id);
          apiCall<{ success: boolean; data: L1SkillDetail }>(
            `${BACKEND_URL}/admin/skills/${found.id}`,
            {
              onSuccess: (detail) => {
                const d = draftFromSkill(detail.data);
                setSaved(d);
                setDraft(d);
              },
              onError: setLoadError,
              onComplete: () => setIsLoading(false),
            }
          );
        },
        onError: (err) => {
          setLoadError(err);
          setIsLoading(false);
        },
      }
    );
    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // ── Dirty check ───────────────────────────────────────────────────────────

  const isDirty =
    draft !== null &&
    saved !== null &&
    JSON.stringify({ model: draft.model, maxTokens: draft.maxTokens, definitions: draft.definitions }) !==
      JSON.stringify({ model: saved.model, maxTokens: saved.maxTokens, definitions: saved.definitions });

  // ── Draft mutations ───────────────────────────────────────────────────────

  function updateDef(index: number, patch: Partial<SignalTypeDefinition>) {
    setDraft((d) => {
      if (!d) return d;
      const defs = [...d.definitions];
      defs[index] = { ...defs[index], ...patch };
      return { ...d, definitions: defs };
    });
  }

  function addDefinition() {
    const key = makeKey();
    setDraft((d) =>
      d
        ? { ...d, definitions: [...d.definitions, emptyDefinition()], _keys: [...d._keys, key] }
        : d
    );
    setExpandedKeys((s) => new Set(s).add(key));
  }

  function removeDefinition(index: number) {
    setDraft((d) => {
      if (!d) return d;
      return {
        ...d,
        definitions: d.definitions.filter((_, i) => i !== index),
        _keys: d._keys.filter((_, i) => i !== index),
      };
    });
  }

  function toggleExpand(key: string) {
    setExpandedKeys((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  function handleSave() {
    if (!skillId || !draft || isSaving || !isDirty) return;
    setSaveError(null);
    setIsSaving(true);
    apiPut<{ success: boolean; data: L1SkillDetail }>(
      `${BACKEND_URL}/admin/skills/${skillId}`,
      {
        onSuccess: (res) => {
          const d = draftFromSkill(res.data);
          setSaved(d);
          setDraft(d);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2500);
        },
        onError: setSaveError,
        onComplete: () => setIsSaving(false),
      },
      {
        model: draft.model,
        maxTokens: draft.maxTokens,
        config: { signal_type_definitions: draft.definitions },
      }
    );
  }

  // ── Preview ───────────────────────────────────────────────────────────────

  function handleRunPreview() {
    if (!skillId || !previewCallId.trim() || isPreviewing || cooldownSecs > 0) return;
    setPreviewError(null);
    setPreviewResult(null);
    setElapsedSecs(0);
    elapsedRef.current = setInterval(() => setElapsedSecs((n) => n + 1), 1000);
    apiPost<{ success: boolean; data: PreviewData }>(
      `${BACKEND_URL}/admin/skills/${skillId}/preview`,
      {
        onStart: () => setIsPreviewing(true),
        onSuccess: (res) => setPreviewResult(res.data),
        onError: setPreviewError,
        onComplete: () => {
          setIsPreviewing(false);
          if (elapsedRef.current) clearInterval(elapsedRef.current);
          setCooldownSecs(60);
          cooldownRef.current = setInterval(() => {
            setCooldownSecs((n) => {
              if (n <= 1) {
                if (cooldownRef.current) clearInterval(cooldownRef.current);
                return 0;
              }
              return n - 1;
            });
          }, 1000);
        },
      },
      { callId: previewCallId.trim() }
    );
  }

  // ── Loading / error ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-[8px] bg-[#F5F5F5] animate-pulse" />
        ))}
      </div>
    );
  }

  if (loadError || !draft) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle className="size-4 shrink-0" />
        {loadError ?? "Failed to load skill"}
      </div>
    );
  }

  const groupedSignals = previewResult
    ? previewResult.signals.reduce<Record<string, PreviewSignal[]>>((acc, s) => {
        (acc[s.signal_type] ??= []).push(s);
        return acc;
      }, {})
    : {};

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Controls row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <label className={LABEL_CLS}>Model</label>
            <input
              value={draft.model}
              onChange={(e) => setDraft((d) => (d ? { ...d, model: e.target.value } : d))}
              className={`${INPUT_CLS} w-[240px] font-mono`}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Max Tokens</label>
            <input
              type="number"
              value={draft.maxTokens}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, maxTokens: parseInt(e.target.value) || 0 } : d))
              }
              className={`${INPUT_CLS} w-[120px]`}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saveError && (
            <span className="text-xs text-red-600 max-w-[220px] text-right">{saveError}</span>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              saveSuccess
                ? "bg-emerald-600 text-white"
                : "bg-[#0F172B] text-white hover:opacity-90"
            }`}
          >
            {saveSuccess ? (
              <><Check className="size-3.5" /> Saved</>
            ) : isSaving ? (
              <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>

      {/* Dirty warning */}
      {isDirty && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
          Saving changes will invalidate all existing L1 signals. The pipeline will re-extract on
          the next run.
        </div>
      )}

      {/* Signal type cards */}
      <div className="space-y-1.5">
        {draft.definitions.map((def, idx) => {
          const key = draft._keys[idx] ?? String(idx);
          return (
            <SignalTypeCard
              key={key}
              def={def}
              expanded={expandedKeys.has(key)}
              onToggleExpand={() => toggleExpand(key)}
              onChange={(patch) => updateDef(idx, patch)}
              onRemove={() => removeDefinition(idx)}
            />
          );
        })}

        <button
          onClick={addDefinition}
          className="flex items-center gap-1.5 w-full rounded-md border border-dashed border-[#E2E2E2] px-4 py-2.5 text-xs text-[#888888] hover:border-[#0F172B] hover:text-[#0F172B] transition-colors"
        >
          <Plus className="size-3.5" /> Add signal type
        </button>
      </div>

      {/* Preview */}
      <SectionPanel title="Preview">

          <div className="flex items-end gap-3">
            <div className="w-[300px]">
              <label className={LABEL_CLS}>Call ID</label>
              <input
                value={previewCallId}
                onChange={(e) => setPreviewCallId(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRunPreview(); }}
                className={INPUT_CLS}
                placeholder="CANFINHOME_FY2026_Q3"
              />
            </div>
            <button
              onClick={handleRunPreview}
              disabled={!previewCallId.trim() || isPreviewing || cooldownSecs > 0}
              className="flex items-center gap-1.5 rounded-md bg-[#0F172B] px-4 py-[7px] text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPreviewing ? (
                <><Loader2 className="size-3.5 animate-spin" /> Running… {elapsedSecs}s</>
              ) : cooldownSecs > 0 ? (
                <>Cooldown {cooldownSecs}s</>
              ) : (
                <><Play className="size-3.5" /> Run Preview</>
              )}
            </button>
          </div>

          <p className="text-[11px] text-[#888888]">
            Runs against the live LLM (10–30 s) using the <strong>saved</strong> config — save
            first to preview changes.
          </p>

          {previewError && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              <AlertCircle className="size-3.5 shrink-0" />
              {previewError}
            </div>
          )}

          {previewResult && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="flex flex-wrap gap-5 rounded-lg border border-[#E2E2E2] bg-[#F5F5F5] px-5 py-4">
                <Stat label="Signals" value={String(previewResult.signal_count ?? previewResult.signals?.length ?? 0)} />
                <Stat label="New KPIs" value={String(previewResult.new_kpis?.length ?? 0)} />
                <Stat label="Model" value={previewResult.model} mono />
                {previewResult.prompt_length != null && (
                  <Stat label="Prompt chars" value={previewResult.prompt_length.toLocaleString()} />
                )}
                <div className="flex flex-wrap gap-1.5 items-center self-end">
                  {(previewResult.signal_types_used ?? Object.keys(groupedSignals)).map((type) => (
                    <span
                      key={type}
                      className="rounded-full bg-white border border-[#E2E2E2] px-2.5 py-0.5 text-[11px] text-[#888888]"
                    >
                      {type} ({groupedSignals[type]?.length ?? 0})
                    </span>
                  ))}
                </div>
              </div>

              {/* Signals table */}
              {previewResult.signals?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E2E2]">
                        {["Type", "Metric", "Value", "Impact", "Statement"].map((h) => (
                          <th
                            key={h}
                            className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888] px-2 first:pl-0"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E2E2]">
                      {previewResult.signals.map((sig, i) => (
                        <tr key={i} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="py-2 px-2 pl-0">
                            <span className="rounded-sm bg-[#F5F5F5] px-1.5 py-0.5 font-mono text-[10px] text-[#888888] whitespace-nowrap">
                              {sig.signal_type}
                            </span>
                          </td>
                          <td className="py-2 px-2 font-medium text-[#0F172B] max-w-[160px]">
                            <span className="line-clamp-1">{sig.metric}</span>
                          </td>
                          <td className="py-2 px-2 text-[#888888] max-w-[120px]">
                            <span className="line-clamp-1">{sig.value}</span>
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            <span
                              className={`font-semibold ${
                                sig.impact === "HIGH"
                                  ? "text-emerald-600"
                                  : sig.impact === "LOW"
                                  ? "text-red-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {sig.impact}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-[#888888] max-w-[340px]">
                            <span className="line-clamp-2">{sig.statement}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* New KPIs */}
              {previewResult.new_kpis?.length > 0 && (
                <div>
                  <p className={`${LABEL_CLS} mb-2`}>New KPIs ({previewResult.new_kpis.length})</p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E2E2]">
                        {["Abbr", "Full Form", "KPI Type"].map((h) => (
                          <th
                            key={h}
                            className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888] px-2 first:pl-0"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E2E2]">
                      {previewResult.new_kpis.map((kpi, i) => (
                        <tr key={i} className="hover:bg-[#FAFAFA]">
                          <td className="py-2 px-2 pl-0 font-mono font-medium text-[#0F172B]">
                            {kpi.abbr}
                          </td>
                          <td className="py-2 px-2 text-[#888888]">{kpi.full_form}</td>
                          <td className="py-2 px-2">
                            <span className="rounded-sm bg-[#F5F5F5] px-1.5 py-0.5 font-mono text-[10px] text-[#888888]">
                              {kpi.kpi_type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
      </SectionPanel>
    </div>
  );
}

// ── SignalTypeCard ─────────────────────────────────────────────────────────────

interface CardProps {
  def: SignalTypeDefinition;
  expanded: boolean;
  onToggleExpand: () => void;
  onChange: (patch: Partial<SignalTypeDefinition>) => void;
  onRemove: () => void;
}

function SignalTypeCard({ def, expanded, onToggleExpand, onChange, onRemove }: CardProps) {
  return (
    <div
      className={`rounded-[8px] border bg-white overflow-hidden transition-opacity ${
        def.active ? "border-[#E2E2E2]" : "border-[#E2E2E2] opacity-60"
      }`}
    >
      {/* Card header */}
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer select-none group"
        onClick={onToggleExpand}
      >
        {/* Active toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange({ active: !def.active });
          }}
          className={`relative shrink-0 inline-flex w-8 h-4 rounded-full transition-colors ${
            def.active ? "bg-[#0F172B]" : "bg-[#D1D5DB]"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 inline-block w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
              def.active ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>

        <span className="flex-1 text-sm font-medium text-[#0F172B] truncate">
          {def.label || <span className="text-[#888888] font-normal italic">Untitled</span>}
        </span>

        {def.slug && (
          <span className="shrink-0 font-mono text-[11px] text-[#888888]">{def.slug}</span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 p-1 text-transparent group-hover:text-[#888888] hover:!text-red-600 transition-colors"
        >
          <Trash2 className="size-3.5" />
        </button>

        {expanded ? (
          <ChevronDown className="size-4 text-[#888888] shrink-0" />
        ) : (
          <ChevronRight className="size-4 text-[#888888] shrink-0" />
        )}
      </div>

      {/* Card body */}
      {expanded && (
        <div className="border-t border-[#E2E2E2] px-4 py-4 space-y-4">

          {/* Label + Slug row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Label">
              <input
                value={def.label}
                onChange={(e) => onChange({ label: e.target.value })}
                onBlur={(e) => {
                  if (!def.slug) onChange({ slug: slugify(e.target.value) });
                }}
                className={INPUT_CLS}
                placeholder="e.g. Revenue KPI"
              />
            </Field>
            <Field label="Slug (read-only once set)">
              <input
                value={def.slug}
                readOnly={!!def.slug}
                onChange={(e) => !def.slug && onChange({ slug: slugify(e.target.value) })}
                className={`${INPUT_CLS} font-mono ${def.slug ? "bg-[#F5F5F5] cursor-not-allowed text-[#888888]" : ""}`}
                placeholder="auto-generated"
              />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <textarea
              rows={2}
              value={def.description}
              onChange={(e) => onChange({ description: e.target.value })}
              className={`${INPUT_CLS} resize-none`}
              placeholder="What this signal type captures…"
            />
          </Field>

          {/* Metric */}
          <div className="space-y-2">
            <label className={LABEL_CLS}>Metric</label>
            <TypeToggle
              options={METRIC_TYPES}
              value={def.metric.type}
              onChange={(t) => onChange({ metric: { type: t as MetricType } })}
            />
            {def.metric.type === "fixed" && (
              <input
                value={def.metric.value ?? ""}
                onChange={(e) => onChange({ metric: { ...def.metric, value: e.target.value } })}
                className={INPUT_CLS}
                placeholder="Fixed value…"
              />
            )}
            {def.metric.type === "enum" && (
              <TagInput
                values={def.metric.values ?? []}
                onChange={(values) => onChange({ metric: { ...def.metric, values } })}
                placeholder="Add value, press Enter"
              />
            )}
            {(def.metric.type === "kpi_abbr" || def.metric.type === "free_text") && (
              <input
                value={def.metric.instructions ?? ""}
                onChange={(e) =>
                  onChange({ metric: { ...def.metric, instructions: e.target.value } })
                }
                className={INPUT_CLS}
                placeholder="Instructions for the LLM…"
              />
            )}
          </div>

          {/* Metric Family */}
          <div className="space-y-2">
            <label className={LABEL_CLS}>Metric Family</label>
            <TypeToggle
              options={METRIC_FAMILY_TYPES}
              value={def.metric_family.type}
              onChange={(t) => onChange({ metric_family: { type: t as MetricFamilyType } })}
            />
            {def.metric_family.type === "fixed" && (
              <input
                value={def.metric_family.value ?? ""}
                onChange={(e) =>
                  onChange({ metric_family: { ...def.metric_family, value: e.target.value } })
                }
                className={INPUT_CLS}
                placeholder="Fixed value…"
              />
            )}
            {def.metric_family.type === "enum" && (
              <TagInput
                values={def.metric_family.values ?? []}
                onChange={(values) =>
                  onChange({ metric_family: { ...def.metric_family, values } })
                }
                placeholder="Add family value, press Enter"
              />
            )}
          </div>

          {/* Value / Raw value instructions */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Value Instructions">
              <input
                value={def.value_instructions}
                onChange={(e) => onChange({ value_instructions: e.target.value })}
                className={INPUT_CLS}
                placeholder="What goes in the value field…"
              />
            </Field>
            <Field label="Raw Value Instructions">
              <input
                value={def.raw_value_instructions}
                onChange={(e) => onChange({ raw_value_instructions: e.target.value })}
                className={INPUT_CLS}
                placeholder="What goes in the raw_value field…"
              />
            </Field>
          </div>

          {/* Active fields */}
          <div>
            <label className={LABEL_CLS}>Active Fields</label>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1.5">
              {AVAILABLE_ACTIVE_FIELDS.map((field) => (
                <label key={field} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={def.active_fields.includes(field)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...def.active_fields, field]
                        : def.active_fields.filter((f) => f !== field);
                      onChange({ active_fields: next });
                    }}
                    className="rounded accent-[#0F172B]"
                  />
                  <span className="text-xs font-mono text-[#0F172B]">{field}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Extra fields */}
          <div>
            <label className={LABEL_CLS}>Extra Fields</label>
            <div className="space-y-2 mt-1.5">
              {def.extra_fields.map((ef, i) => (
                <ExtraFieldRow
                  key={i}
                  field={ef}
                  onChange={(patch) => {
                    const next = [...def.extra_fields];
                    next[i] = { ...next[i], ...patch };
                    onChange({ extra_fields: next });
                  }}
                  onRemove={() =>
                    onChange({ extra_fields: def.extra_fields.filter((_, j) => j !== i) })
                  }
                />
              ))}
              <button
                onClick={() =>
                  onChange({
                    extra_fields: [
                      ...def.extra_fields,
                      { name: "", type: "free_text", instructions: "" },
                    ],
                  })
                }
                className="flex items-center gap-1 text-xs text-[#888888] hover:text-[#0F172B] transition-colors"
              >
                <Plus className="size-3" /> Add extra field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TypeToggle ─────────────────────────────────────────────────────────────────

function TypeToggle({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-md border border-[#E2E2E2] overflow-hidden w-fit">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${
            value === opt
              ? "bg-[#0F172B] text-white"
              : "bg-white text-[#888888] hover:text-[#0F172B]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── TagInput ───────────────────────────────────────────────────────────────────

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function commit() {
    const v = input.trim();
    if (!v || values.includes(v)) {
      setInput("");
      return;
    }
    onChange([...values, v]);
    setInput("");
  }

  return (
    <div className="flex flex-wrap gap-1.5 rounded border border-[#E2E2E2] px-2.5 py-2 bg-white min-h-[34px]">
      {values.map((v) => (
        <span
          key={v}
          className="flex items-center gap-1 rounded-sm bg-[#F5F5F5] px-1.5 py-0.5 text-[11px] text-[#0F172B]"
        >
          {v}
          <button
            onClick={() => onChange(values.filter((x) => x !== v))}
            className="text-[#888888] hover:text-red-600 transition-colors"
          >
            <X className="size-2.5" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Backspace" && !input && values.length > 0) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={commit}
        className="flex-1 min-w-[80px] text-xs text-[#0F172B] focus:outline-none bg-transparent"
        placeholder={values.length === 0 ? placeholder : ""}
      />
    </div>
  );
}

// ── ExtraFieldRow ──────────────────────────────────────────────────────────────

function ExtraFieldRow({
  field,
  onChange,
  onRemove,
}: {
  field: ExtraField;
  onChange: (patch: Partial<ExtraField>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-2 rounded-[6px] border border-[#E2E2E2] bg-[#FAFAFA] px-3 py-2.5">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <input
            value={field.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className={`${INPUT_CLS} w-[160px] font-mono`}
            placeholder="field_name"
          />
          <TypeToggle
            options={["enum", "free_text"]}
            value={field.type}
            onChange={(t) =>
              onChange({
                type: t as "enum" | "free_text",
                values: t === "enum" ? (field.values ?? []) : undefined,
                instructions: t === "free_text" ? (field.instructions ?? "") : undefined,
              })
            }
          />
        </div>
        {field.type === "enum" && (
          <TagInput
            values={field.values ?? []}
            onChange={(values) => onChange({ values })}
            placeholder="Add enum values…"
          />
        )}
        {field.type === "free_text" && (
          <input
            value={field.instructions ?? ""}
            onChange={(e) => onChange({ instructions: e.target.value })}
            className={INPUT_CLS}
            placeholder="Instructions…"
          />
        )}
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 mt-1 p-1 text-[#888888] hover:text-red-600 transition-colors"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

const LABEL_CLS =
  "block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1";
const INPUT_CLS =
  "w-full rounded border border-[#E2E2E2] px-2.5 py-1.5 text-xs text-[#0F172B] bg-white focus:outline-none focus:border-[#0F172B]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {children}
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-[#888888]">{label}</span>
      <span className={`text-sm font-semibold text-[#0F172B] ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
