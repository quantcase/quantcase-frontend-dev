"use client";

import { useState } from "react";
import { Save, Loader2, AlertCircle, Circle, Eye, ChevronDown } from "lucide-react";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import {
  PostHtmlConfig,
  PostHtmlConfigUpdateBody,
  DEFAULT_MODEL,
  DEFAULT_MAX_TOKENS,
  POST_HTML_TYPE_LABELS,
} from "./types";

const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";
const MODEL_OPTIONS = [
  { label: `Default (${DEFAULT_MODEL})`, value: "" },
  { label: "Claude Sonnet 4.5", value: "anthropic/claude-sonnet-4.5" },
  { label: "Claude Haiku", value: "~anthropic/claude-haiku-latest" },
  { label: "MiMo-2.5", value: "xiaomi/mimo-v2.5" },
];

interface Props {
  config: PostHtmlConfig;
  saving: boolean;
  saveError: string | null;
  onSave: (updates: PostHtmlConfigUpdateBody) => void;
  onPreview: () => void;
  previewing: boolean;
}

export function ConfigEditor({ config, saving, saveError, onSave, onPreview, previewing }: Props) {
  const [prompt, setPrompt] = useState(config.prompt ?? "");
  const [schemaText, setSchemaText] = useState(() => JSON.stringify(config.output_schema ?? {}, null, 2));
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [model, setModel] = useState(config.model ?? "");
  const [maxTokens, setMaxTokens] = useState<string>(config.max_tokens != null ? String(config.max_tokens) : "");
  const [isActive, setIsActive] = useState(config.is_active);
  const [dirty, setDirty] = useState(false);

  // Parent remounts this component via key={`${layer_id}:${type}`} when the selected config changes,
  // so no reset-on-prop-change effect is needed — the useState initializers above run fresh.

  function markDirty() { setDirty(true); }

  function handleSave() {
    let parsedSchema: Record<string, unknown> | undefined;
    try {
      parsedSchema = schemaText.trim() ? JSON.parse(schemaText) : {};
      setSchemaError(null);
    } catch {
      setSchemaError("Invalid JSON — fix before saving.");
      return;
    }
    const updates: PostHtmlConfigUpdateBody = {
      prompt,
      output_schema: parsedSchema,
      model: model.trim() || null,
      max_tokens: maxTokens.trim() ? Number(maxTokens) : null,
      is_active: isActive,
    };
    onSave(updates);
    setDirty(false);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-hair shrink-0">
        <Circle className={`size-1.5 shrink-0 ${isActive ? "fill-up text-up" : "fill-ink-3 text-ink-3"}`} />
        <span className="text-[13px] font-semibold text-ink">{config.name}</span>
        <span className="text-[10px] font-medium rounded-sm px-1.5 py-0.5 bg-secondary text-ink-3 uppercase tracking-wide">
          {config.layer_id} / {POST_HTML_TYPE_LABELS[config.type] ?? config.type}
        </span>
        <div className="flex-1" />
        {saveError && <span className="text-[11px] text-down">{saveError}</span>}
        <button
          onClick={onPreview}
          disabled={previewing}
          className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-1.5 text-[12px] font-medium text-ink hover:border-ink transition-colors disabled:opacity-40"
        >
          {previewing ? <Loader2 className="size-3.5 animate-spin" /> : <Eye className="size-3.5" />}
          Preview
        </button>
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
                className="appearance-none rounded-md border border-hair bg-card pl-2.5 pr-7 py-1.5 text-[12px] text-ink outline-none focus:ring-1 focus:ring-ink cursor-pointer min-w-[220px]"
              >
                {MODEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3 text-ink-3" />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Max tokens <span className="normal-case tracking-normal font-normal">(blank = {DEFAULT_MAX_TOKENS})</span></label>
            <input
              value={maxTokens}
              onChange={(e) => { setMaxTokens(e.target.value); markDirty(); }}
              placeholder={String(DEFAULT_MAX_TOKENS)}
              inputMode="numeric"
              className="w-28 rounded-md border border-hair bg-card px-2.5 py-1.5 text-[12px] text-ink outline-none focus:ring-1 focus:ring-ink"
            />
          </div>
          <CheckboxField
            checked={isActive}
            onChange={(v) => { setIsActive(v); markDirty(); }}
            label="Active"
            hint="Inactive configs are rejected by the worker — jobs against this type will fail."
          />
        </div>

        <div>
          <label className={LABEL_CLS}>Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); markDirty(); }}
            rows={16}
            className="w-full rounded-md border border-hair bg-card px-3 py-2 text-[12px] leading-relaxed text-ink font-mono outline-none focus:ring-1 focus:ring-ink resize-y"
            spellCheck={false}
          />
        </div>

        <div>
          <label className={LABEL_CLS}>
            Output JSON schema <span className="normal-case tracking-normal font-normal">— raw schema object, no <code>json_schema</code> wrapper</span>
          </label>
          <textarea
            value={schemaText}
            onChange={(e) => { setSchemaText(e.target.value); setSchemaError(null); markDirty(); }}
            rows={14}
            className={`w-full rounded-md border bg-card px-3 py-2 text-[12px] leading-relaxed text-ink font-mono outline-none focus:ring-1 resize-y ${
              schemaError ? "border-down focus:ring-down" : "border-hair focus:ring-ink"
            }`}
            spellCheck={false}
          />
          {schemaError && (
            <p className="flex items-center gap-1.5 mt-1.5 text-[11px] text-down">
              <AlertCircle className="size-3.5 shrink-0" /> {schemaError}
            </p>
          )}
        </div>

        <p className="text-[10px] text-ink-3">
          Last updated {new Date(config.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
