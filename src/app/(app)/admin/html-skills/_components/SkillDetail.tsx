"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Save, Loader2 } from "lucide-react";
import {
  HtmlSkill,
  SignalType,
  PluginCategory,
  SIGNAL_TYPE_LABELS,
  CATEGORY_LABELS,
  MODEL_OPTIONS,
  TestTicker,
  SignalCountsResponse,
  LiveSkillConfig,
} from "./types";
import { BACKEND_URL } from "@/lib/constants";

const ALL_SIGNAL_TYPES = Object.keys(SIGNAL_TYPE_LABELS) as SignalType[];
const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as PluginCategory[];

interface Props {
  skill: HtmlSkill;
  ticker: TestTicker;
  saving: boolean;
  saveError: string | null;
  onSave: (updates: Partial<Omit<HtmlSkill, "id" | "created_at" | "updated_at">>) => void;
  onSignalCountsChange?: (counts: Record<string, number>, selectedTypes: SignalType[]) => void;
  onLimitsChange?: (maxQtrs: number | null, maxPptQtrs: number | null, maxAnnualYears: number | null) => void;
  onConfigChange?: (config: LiveSkillConfig) => void;
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

export const SkillDetail = forwardRef<SkillDetailHandle, Props>(function SkillDetail(
  { skill, ticker, saving, saveError, onSave, onSignalCountsChange, onLimitsChange, onConfigChange, onDirtyChange, hideHeader },
  ref
) {
  const [name, setName] = useState(skill.name);
  const [prompt, setPrompt] = useState(skill.skill_prompt ?? "");
  const [category, setCategory] = useState<PluginCategory>(skill.category);
  const [signalTypes, setSignalTypes] = useState<SignalType[]>(skill.signal_types);
  const [model, setModel] = useState(skill.model);
  const [maxTokens, setMaxTokens] = useState(skill.max_tokens);
  const [maxTranscriptQtrs, setMaxTranscriptQtrs] = useState<number | null>(skill.max_transcript_qtrs);
  const [maxPptQtrs, setMaxPptQtrs] = useState<number | null>(skill.max_ppt_qtrs);
  const [maxAnnualReportYears, setMaxAnnualReportYears] = useState<number | null>(skill.max_annual_report_years);
  const [isActive, setIsActive] = useState(skill.is_active);
  const [dirty, setDirty] = useState(false);
  const [signalCounts, setSignalCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setName(skill.name);
    setPrompt(skill.skill_prompt ?? "");
    setCategory(skill.category);
    setSignalTypes(skill.signal_types);
    setModel(skill.model);
    setMaxTokens(skill.max_tokens);
    setMaxTranscriptQtrs(skill.max_transcript_qtrs);
    setMaxPptQtrs(skill.max_ppt_qtrs);
    setMaxAnnualReportYears(skill.max_annual_report_years);
    setIsActive(skill.is_active);
    setDirty(false);
  }, [skill.slug]);

  useEffect(() => {
    setSignalCounts({});
    const params = new URLSearchParams();
    if (signalTypes.length > 0) params.set("signal_types", signalTypes.join(","));
    if (maxTranscriptQtrs !== null) params.set("max_transcript_qtrs", String(maxTranscriptQtrs));
    if (maxPptQtrs !== null) params.set("max_ppt_qtrs", String(maxPptQtrs));
    if (maxAnnualReportYears !== null) params.set("max_annual_report_years", String(maxAnnualReportYears));
    fetch(`${BACKEND_URL}/api/html-skills/signals/count/${ticker}?${params}`)
      .then(async (res) => {
        if (!res.ok) return;
        const json: SignalCountsResponse = await res.json();
        const map: Record<string, number> = {};
        for (const { signal_type, count } of json.signal_counts) {
          map[signal_type] = count;
        }
        setSignalCounts(map);
        onSignalCountsChange?.(map, signalTypes);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, signalTypes, maxTranscriptQtrs, maxPptQtrs, maxAnnualReportYears]);

  useEffect(() => {
    onLimitsChange?.(maxTranscriptQtrs, maxPptQtrs, maxAnnualReportYears);
  }, [maxTranscriptQtrs, maxPptQtrs, maxAnnualReportYears]);

  useEffect(() => {
    onConfigChange?.({ prompt, signalTypes, model, maxTokens, maxTranscriptQtrs, maxPptQtrs, maxAnnualReportYears });
  }, [prompt, signalTypes, model, maxTokens, maxTranscriptQtrs, maxPptQtrs, maxAnnualReportYears]);

  function mark() { setDirty(true); onDirtyChange?.(true); }

  function toggleSignal(type: SignalType) {
    setSignalTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    mark();
  }

  function handleSave() {
    onSave({ name, skill_prompt: prompt, category, signal_types: signalTypes, model, max_tokens: maxTokens, max_transcript_qtrs: maxTranscriptQtrs, max_ppt_qtrs: maxPptQtrs, max_annual_report_years: maxAnnualReportYears, is_active: isActive });
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
        {/* Category + Model + Max tokens */}
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
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
              Transcript Qtrs
            </label>
            <select
              value={maxTranscriptQtrs ?? ""}
              onChange={(e) => { setMaxTranscriptQtrs(e.target.value === "" ? null : Number(e.target.value)); mark(); }}
              className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
            >
              {QTR_OPTIONS.map((o) => (
                <option key={String(o.value)} value={o.value ?? ""}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
              PPT Qtrs
            </label>
            <select
              value={maxPptQtrs ?? ""}
              onChange={(e) => { setMaxPptQtrs(e.target.value === "" ? null : Number(e.target.value)); mark(); }}
              className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
            >
              {QTR_OPTIONS.map((o) => (
                <option key={String(o.value)} value={o.value ?? ""}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
              Annual Report Yrs
            </label>
            <select
              value={maxAnnualReportYears ?? ""}
              onChange={(e) => { setMaxAnnualReportYears(e.target.value === "" ? null : Number(e.target.value)); mark(); }}
              className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
            >
              {ANNUAL_OPTIONS.map((o) => (
                <option key={String(o.value)} value={o.value ?? ""}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Signal types */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-2">
            Signal Types
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SIGNAL_TYPES.map((type) => {
              const active = signalTypes.includes(type);
              const count = signalCounts[type];
              return (
                <button
                  key={type}
                  onClick={() => toggleSignal(type)}
                  className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                    active
                      ? "bg-[#0F172B] text-white border-[#0F172B]"
                      : "bg-[#F5F5F5] text-[#888888] border-[#E2E2E2] hover:border-[#0F172B] hover:text-[#0F172B]"
                  }`}
                >
                  {SIGNAL_TYPE_LABELS[type]}
                  {count !== undefined && (
                    <span
                      className={`rounded-sm px-1 py-px text-[9px] font-semibold leading-none tabular-nums ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-[#E2E2E2] text-[#888888]"
                      }`}
                    >
                      {count.toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
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
