"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { PluginCategory, CATEGORY_LABELS, MODEL_OPTIONS } from "./types";

export interface NewSkillForm {
  slug: string;
  name: string;
  skill_prompt: string;
  category: PluginCategory;
  model: string;
  max_tokens: number;
}

interface Props {
  open: boolean;
  creating: boolean;
  error: string | null;
  onClose: () => void;
  onCreate: (form: NewSkillForm) => void;
}

const DEFAULT: NewSkillForm = {
  slug: "",
  name: "",
  skill_prompt: "",
  category: "management",
  model: MODEL_OPTIONS[0].value,
  max_tokens: 16000,
};

export function NewSkillDialog({ open, creating, error, onClose, onCreate }: Props) {
  const [form, setForm] = useState<NewSkillForm>(DEFAULT);

  if (!open) return null;

  function set<K extends keyof NewSkillForm>(key: K, value: NewSkillForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleCreate() {
    onCreate(form);
  }

  function handleClose() {
    setForm(DEFAULT);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[520px] rounded-[10px] border border-[var(--qc-border-default)] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--qc-border-default)] px-5 py-4">
          <h3 className="text-[15px] font-medium text-[var(--qc-ink)]">New HTML Skill</h3>
          <button onClick={handleClose} className="text-[#888888] hover:text-[var(--qc-ink)] transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Management Quality Card"
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                Slug * <span className="normal-case font-normal">(kebab-case)</span>
              </label>
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="mgmt-quality-card"
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] font-mono text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value as PluginCategory)}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
              >
                {(Object.keys(CATEGORY_LABELS) as PluginCategory[]).map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                Model
              </label>
              <select
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
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
                value={form.max_tokens}
                onChange={(e) => set("max_tokens", Number(e.target.value))}
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[13px] text-[var(--qc-ink)] outline-none focus:ring-1 focus:ring-[var(--qc-ink)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
              Skill Prompt *
            </label>
            <textarea
              value={form.skill_prompt}
              onChange={(e) => set("skill_prompt", e.target.value)}
              rows={6}
              placeholder="You are a financial analyst. Generate an HTML card…"
              className="w-full rounded-md border border-[var(--qc-border-default)] bg-white px-3 py-2 text-[12px] font-mono text-[var(--qc-ink)] leading-relaxed outline-none focus:ring-1 focus:ring-[var(--qc-ink)] resize-none"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-600">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--qc-border-default)] px-5 py-3">
          <button
            onClick={handleClose}
            className="rounded-md border border-[var(--qc-border-default)] px-4 py-1.5 text-[12px] font-medium text-[#888888] hover:text-[var(--qc-ink)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !form.slug || !form.name || !form.skill_prompt}
            className="flex items-center gap-1.5 rounded-md bg-[#0F172B] px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {creating && <Loader2 className="size-3.5 animate-spin" />}
            Create Skill
          </button>
        </div>
      </div>
    </div>
  );
}
