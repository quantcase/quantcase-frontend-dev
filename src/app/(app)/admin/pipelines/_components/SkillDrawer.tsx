import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { Skill } from "./types";

interface EditForm {
  name: string;
  description: string;
  model: string;
  maxTokens: number;
  promptKey: string;
  promptTemplate: string;
  defaultInstructions: string;
  outputSchema: string;
  isActive: boolean;
}

interface Props {
  skill: Skill | null;
  onClose: () => void;
  onSave: (skillId: string, updates: Partial<Omit<Skill, "id" | "pluginSkills">>) => Promise<void>;
}

function toForm(skill: Skill): EditForm {
  return {
    name: skill.name,
    description: skill.description ?? "",
    model: skill.model,
    maxTokens: skill.maxTokens,
    promptKey: skill.promptKey,
    promptTemplate: skill.promptTemplate ?? "",
    defaultInstructions: skill.defaultInstructions ?? "",
    outputSchema: skill.outputSchema ? JSON.stringify(skill.outputSchema, null, 2) : "",
    isActive: skill.isActive,
  };
}

export function SkillDrawer({ skill, onClose, onSave }: Props) {
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (skill) {
      setForm(toForm(skill));
      setSaveError(null);
      setSaved(false);
    }
  }, [skill]);

  if (!skill || !form) return null;

  const currentSkill = skill;

  function set<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((f) => f ? { ...f, [key]: value } : f);
  }

  async function handleSave() {
    if (!form || saving) return;

    let parsedSchema: Record<string, unknown> | null = null;
    if (form.outputSchema.trim()) {
      try {
        parsedSchema = JSON.parse(form.outputSchema);
      } catch {
        setSaveError("Output schema must be valid JSON");
        return;
      }
    }

    setSaving(true);
    setSaveError(null);
    try {
      await onSave(currentSkill.id, {
        name: form.name,
        description: form.description || null,
        model: form.model,
        maxTokens: form.maxTokens,
        promptKey: form.promptKey,
        promptTemplate: form.promptTemplate || null,
        defaultInstructions: form.defaultInstructions || null,
        outputSchema: parsedSchema,
        isActive: form.isActive,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const usedBy = skill.pluginSkills ?? [];

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/20" onClick={onClose} />

      {/* Drawer */}
      <div className="w-[480px] shrink-0 flex flex-col bg-card border-l border-hair shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hair shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-3">Skill</p>
            <p className="text-[15px] font-semibold text-ink mt-0.5 font-mono">{skill.name}</p>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:text-ink hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Name */}
          <Field label="Name">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={INPUT_CLS}
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${INPUT_CLS} resize-none`}
              placeholder="Optional description…"
            />
          </Field>

          {/* Model + Max Tokens side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Model">
              <input
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                className={`${INPUT_CLS} font-mono`}
              />
            </Field>
            <Field label="Max Tokens">
              <input
                type="number"
                value={form.maxTokens}
                onChange={(e) => set("maxTokens", parseInt(e.target.value) || 0)}
                className={INPUT_CLS}
              />
            </Field>
          </div>

          {/* Prompt Key */}
          <Field label="Prompt Key">
            <input
              value={form.promptKey}
              onChange={(e) => set("promptKey", e.target.value)}
              className={`${INPUT_CLS} font-mono`}
              placeholder="e.g. dealAnalysisPrompt"
            />
          </Field>

          {/* Prompt Template */}
          <Field label="Prompt Template">
            <textarea
              rows={6}
              value={form.promptTemplate}
              onChange={(e) => set("promptTemplate", e.target.value)}
              className={`${INPUT_CLS} resize-y font-mono text-[11px]`}
              placeholder="Full prompt template…"
            />
          </Field>

          {/* Default Instructions */}
          <Field label="Default Instructions">
            <textarea
              rows={4}
              value={form.defaultInstructions}
              onChange={(e) => set("defaultInstructions", e.target.value)}
              className={`${INPUT_CLS} resize-y text-[11px]`}
              placeholder="Default system instructions…"
            />
          </Field>

          {/* Output Schema */}
          <Field label="Output Schema (JSON)">
            <textarea
              rows={6}
              value={form.outputSchema}
              onChange={(e) => set("outputSchema", e.target.value)}
              className={`${INPUT_CLS} resize-none font-mono text-[11px]`}
              placeholder='{"type": "object", "properties": {...}}'
            />
          </Field>

          {/* Active toggle */}
          <Field label="Status">
            <button
              onClick={() => set("isActive", !form.isActive)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                form.isActive
                  ? "bg-up-soft text-up border-up hover:bg-up-soft"
                  : "bg-secondary text-ink-3 border-hair hover:bg-secondary"
              }`}
            >
              {form.isActive ? "Active" : "Inactive"}
            </button>
          </Field>

          {/* Used by (read-only) */}
          {usedBy.length > 0 && (
            <div>
              <p className={LABEL_CLS}>Used by</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {usedBy.map((ps) => (
                  <span
                    key={ps.plugin.id}
                    className="rounded-sm bg-secondary px-2 py-0.5 text-[11px] font-medium text-ink-3 capitalize"
                  >
                    {ps.plugin.name}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-hair flex items-center justify-between">
          {saveError ? (
            <p className="text-xs text-down">{saveError}</p>
          ) : (
            <span />
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              saved
                ? "bg-up text-[var(--qc-on-dark)]"
                : "bg-ink text-[var(--qc-on-dark)] hover:opacity-90"
            }`}
          >
            {saved ? (
              <><Check className="size-3.5" /> Saved</>
            ) : saving ? (
              <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1";
const INPUT_CLS =
  "w-full rounded border border-hair px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-[var(--qc-ink)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {children}
    </div>
  );
}
