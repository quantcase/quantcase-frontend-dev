"use client";

import { useState } from "react";
import { Save, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import {
  TechnicalsSkill,
  SkillUpdateBody,
  TECHNICALS_MODEL_OPTIONS,
  TECHNICALS_DEFAULT_MAX_TOKENS,
} from "./technicals-config-types";

const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

interface Props {
  skill: TechnicalsSkill;
  saving: boolean;
  saveError: string | null;
  onSave: (updates: SkillUpdateBody) => void;
}

export function TechnicalsConfigEditor({ skill, saving, saveError, onSave }: Props) {
  const [prompt, setPrompt] = useState(skill.promptTemplate ?? "");
  const [schemaText, setSchemaText] = useState(() => JSON.stringify(skill.outputSchema ?? {}, null, 2));
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [model, setModel] = useState(skill.model);
  const [maxTokens, setMaxTokens] = useState<string>(skill.maxTokens != null ? String(skill.maxTokens) : "");
  const [isActive, setIsActive] = useState(skill.isActive);
  const [dirty, setDirty] = useState(false);

  // Parent remounts this via key={skill.id} on reload, so useState initializers
  // run fresh — no reset-on-prop-change effect needed.

  // Preserve an off-list current model rather than silently switching it.
  const modelOptions = TECHNICALS_MODEL_OPTIONS.includes(model)
    ? TECHNICALS_MODEL_OPTIONS
    : [model, ...TECHNICALS_MODEL_OPTIONS];

  function markDirty() { setDirty(true); }

  function handleSave() {
    let parsedSchema: Record<string, unknown>;
    try {
      parsedSchema = schemaText.trim() ? JSON.parse(schemaText) : {};
      setSchemaError(null);
    } catch {
      setSchemaError("Invalid JSON — fix before saving.");
      return;
    }
    const updates: SkillUpdateBody = {
      promptTemplate: prompt,
      outputSchema: parsedSchema,
      model,
      isActive,
    };
    if (maxTokens.trim()) {
      const n = Number(maxTokens);
      if (!Number.isInteger(n) || n <= 0) {
        setSchemaError("Max tokens must be a positive integer.");
        return;
      }
      updates.maxTokens = n;
    }
    onSave(updates);
    setDirty(false);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-hair shrink-0">
        <span className="text-[11px] text-ink-3">
          Edits propagate to the worker in ~60s.
        </span>
        <div className="flex-1" />
        {saveError && <span className="text-[11px] text-down max-w-[360px] truncate" title={saveError}>{saveError}</span>}
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <label className={LABEL_CLS}>Model</label>
            <div className="relative">
              <select
                value={model}
                onChange={(e) => { setModel(e.target.value); markDirty(); }}
                className="appearance-none rounded-md border border-hair bg-card pl-2.5 pr-7 py-1.5 text-[12px] text-ink outline-none focus:border-hair-strong cursor-pointer min-w-[220px]"
              >
                {modelOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3 text-ink-3" />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Max tokens <span className="normal-case tracking-normal font-normal">(default {TECHNICALS_DEFAULT_MAX_TOKENS})</span></label>
            <input
              value={maxTokens}
              onChange={(e) => { setMaxTokens(e.target.value); markDirty(); }}
              placeholder={String(TECHNICALS_DEFAULT_MAX_TOKENS)}
              inputMode="numeric"
              className="w-28 rounded-md border border-hair bg-card px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-hair-strong"
            />
          </div>
          <CheckboxField
            checked={isActive}
            onChange={(v) => { setIsActive(v); markDirty(); }}
            label="Active"
            hint="Inactive disables technicals analysis — jobs will fail."
          />
        </div>

        <div>
          <label className={LABEL_CLS}>
            Prompt template <span className="normal-case tracking-normal font-normal">— must keep the <code>{"{{DATA_BLOCK}}"}</code> placeholder</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); markDirty(); }}
            rows={16}
            className="w-full rounded-md border border-hair bg-card px-3 py-2 text-[12px] leading-relaxed text-ink font-mono outline-none focus:border-hair-strong resize-y"
            spellCheck={false}
          />
        </div>

        <div>
          <label className={LABEL_CLS}>
            Output schema <span className="normal-case tracking-normal font-normal">— keep the <code>{"{ type, json_schema: { name, strict, schema } }"}</code> wrapper; ≤24 optional props total or the next run fails</span>
          </label>
          <textarea
            value={schemaText}
            onChange={(e) => { setSchemaText(e.target.value); setSchemaError(null); markDirty(); }}
            rows={16}
            className={`w-full rounded-md border bg-card px-3 py-2 text-[12px] leading-relaxed text-ink font-mono outline-none resize-y ${
              schemaError ? "border-down focus:ring-1 focus:ring-down" : "border-hair focus:border-hair-strong"
            }`}
            spellCheck={false}
          />
          {schemaError && (
            <p className="flex items-center gap-1.5 mt-1.5 text-[11px] text-down">
              <AlertCircle className="size-3.5 shrink-0" /> {schemaError}
            </p>
          )}
        </div>

        {skill.updatedAt && (
          <p className="text-[10px] text-ink-3">
            Last updated {new Date(skill.updatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
