import { X, Loader2 } from "lucide-react";
import { NewSkillForm } from "./types";

interface Props {
  open: boolean;
  form: NewSkillForm;
  creating: boolean;
  error: string | null;
  onChange: (form: NewSkillForm) => void;
  onCreate: () => void;
  onClose: () => void;
}

export function NewSkillDialog({ open, form, creating, error, onChange, onCreate, onClose }: Props) {
  if (!open) return null;

  function set<K extends keyof NewSkillForm>(key: K, value: NewSkillForm[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 flex flex-col w-[560px] max-h-[90vh] bg-white rounded-[10px] border border-[#E2E2E2] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E2E2] shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#888888]">New Skill</p>
            <p className="text-[15px] font-semibold text-[#0F172B] mt-0.5">Create a skill</p>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-[#888888] hover:text-[#0F172B] hover:bg-[#F5F5F5] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          <Field label="Name">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="skill_name"
              className={INPUT_CLS}
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${INPUT_CLS} resize-none`}
              placeholder="Optional description…"
            />
          </Field>

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

          <Field label="Prompt Key">
            <input
              value={form.promptKey}
              onChange={(e) => set("promptKey", e.target.value)}
              className={`${INPUT_CLS} font-mono`}
              placeholder="e.g. dealAnalysisPrompt"
            />
          </Field>

          <Field label="Prompt Template">
            <textarea
              rows={6}
              value={form.promptTemplate}
              onChange={(e) => set("promptTemplate", e.target.value)}
              className={`${INPUT_CLS} resize-y font-mono text-[11px]`}
              placeholder="Full prompt template…"
            />
          </Field>

          <Field label="Default Instructions">
            <textarea
              rows={4}
              value={form.defaultInstructions}
              onChange={(e) => set("defaultInstructions", e.target.value)}
              className={`${INPUT_CLS} resize-y text-[11px]`}
              placeholder="Default system instructions…"
            />
          </Field>

          <Field label="Output Schema (JSON, optional)">
            <textarea
              rows={4}
              value={form.outputSchema}
              onChange={(e) => set("outputSchema", e.target.value)}
              className={`${INPUT_CLS} resize-none font-mono text-[11px]`}
              placeholder='{"type": "object", "properties": {...}}'
            />
          </Field>

          <Field label="Status">
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                form.isActive
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200"
                  : "bg-[#F5F5F5] text-[#888888] border-[#E2E2E2] hover:bg-gray-100"
              }`}
            >
              {form.isActive ? "Active" : "Inactive"}
            </button>
          </Field>

        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-[#E2E2E2] flex items-center justify-between">
          {error ? (
            <p className="text-xs text-red-600">{error}</p>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-[#E2E2E2] px-4 py-2 text-sm font-medium text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              disabled={creating}
              className="flex items-center gap-1.5 rounded-md bg-[#0F172B] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating && <Loader2 className="size-3.5 animate-spin" />}
              Create Skill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1";
const INPUT_CLS =
  "w-full rounded border border-[#E2E2E2] px-2.5 py-1.5 text-xs text-[#0F172B] focus:outline-none focus:border-[#0F172B]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {children}
    </div>
  );
}
