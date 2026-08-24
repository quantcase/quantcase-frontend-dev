"use client";

import { TagMultiPicker } from "@/components/molecules/tag-multi-picker";
import { DEFAULT_THESIS_PROMPTS } from "@/lib/journal-ideas";
import { CONV_LABELS, SF_HINTS, dimColor, dimBg } from "@/lib/journal-format";
import { SUB_FACTORS, DIMENSION_LABEL } from "@/types/journal";
import type { Dimension } from "@/types/journal";

// ── Question number bubble ─────────────────────────────────────────────────────

function QNum({ n }: { n: number }) {
  return (
    <span
      className="flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
      style={{ background: "var(--qc-ink)", color: "var(--qc-on-dark)" }}
    >
      {n}
    </span>
  );
}

const DIM_QUESTION: Record<Dimension, string> = {
  M: "Do they do what they say?",
  O: "Is the business worth owning?",
  D: "Is the price actually fair?",
};

// ── The four thesis questions ──────────────────────────────────────────────────
// Shared, controlled form body for a single stock's thesis. Used by the journal
// completion wizard drawer; mirrors the four steps in the composer but laid out
// as one scrollable questionnaire (all four visible, revealed as the dimension
// is set).

export interface ThesisFieldsState {
  dim: Dimension | null;
  subFactors: string[];
  thesis: string;
  conviction: number;
}

interface OnboardingThesisFieldsProps {
  value: ThesisFieldsState;
  onChange: (next: ThesisFieldsState) => void;
  /** Optional per-dimension scores to surface on the dimension cards. */
  dimScores?: Partial<Record<Dimension, number | null>>;
  onSave?: () => void;
}

export function OnboardingThesisFields({ value, onChange, dimScores , onSave }: OnboardingThesisFieldsProps) {
  const { dim, subFactors, thesis, conviction } = value;

  const setDim = (d: Dimension) => onChange({ ...value, dim: d, subFactors: [] });
  const setSubFactors = (next: string[]) => onChange({ ...value, subFactors: next });
  const setThesis = (next: string) => onChange({ ...value, thesis: next });
  const setConviction = (next: number) => onChange({ ...value, conviction: next });

  const lastHint = subFactors.length > 0 ? SF_HINTS[subFactors[subFactors.length - 1]] : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Q1 — dimension */}
      <div>
        <div className="mb-4 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-2">
          <QNum n={1} /> Which dimension drove your decision to buy?
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["M", "O", "D"] as const).map((d) => {
            const sel = dim === d;
            const score = dimScores?.[d];
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDim(d)}
                className="flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-all"
                style={{
                  borderWidth: 1.5,
                  borderColor: sel ? dimColor(d) : "var(--qc-hair)",
                  background: sel ? dimBg(d) : "var(--qc-card)",
                }}
              >
                <span
                  className="serif text-[30px] italic leading-none"
                  style={{ color: sel ? dimColor(d) : "var(--qc-ink-3)" }}
                >
                  {d}
                </span>
                <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-2">
                  {DIMENSION_LABEL[d]}
                </span>
                <span className="text-[12px] leading-snug text-ink-3">{DIM_QUESTION[d]}</span>
                {score != null && (
                  <span className="mt-1 font-mono text-[12px] font-semibold text-ink-2">
                    Score: {score}/100
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Q2 — sub-factors */}
      {dim && (
        <div>
          <div
            className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: dimColor(dim) }}
          >
            <QNum n={2} /> What specifically drove your view?
          </div>
          <p className="mb-3 pl-[34px] text-[13px] leading-relaxed text-ink-2">
            Pick the sub-factors that resonated — these become searchable tags on your journal entry.
          </p>
          <div className="pl-[34px]">
            <TagMultiPicker
              options={SUB_FACTORS[dim]}
              selected={subFactors}
              onChange={setSubFactors}
              uppercase={false}
              placeholder="Pick sub-factors…"
            />
            {lastHint && (
              <div className="mt-2.5 rounded-md border border-hair bg-secondary px-3.5 py-2.5 text-[12px] leading-[1.5] text-ink-2">
                {lastHint}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Q3 — thesis text */}
      {dim && (
        <div>
          <div className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-2">
            <QNum n={3} /> Write your thesis in one or two sentences
          </div>
          <p className="mb-3 pl-[34px] text-[13px] leading-relaxed text-ink-2">
            Why do you own this? What has to be true for it to work? Use your own words — prompts below
            if you&apos;re stuck.
          </p>
          <div className="pl-[34px]">
            <div className="relative">
              <textarea
                value={thesis}
                onChange={(e) => setThesis(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="e.g. Buying for the value unlock — the sum-of-parts hasn't been recognised by the market yet…"
                className="serif w-full resize-none rounded-lg border border-hair bg-card px-4 py-3.5 text-[15px] italic leading-[1.55] text-ink outline-none placeholder:text-ink-3 focus:border-hair-strong"
              />
              <span className="pointer-events-none absolute bottom-2.5 right-3.5 font-mono text-[11px] text-ink-3">
                {thesis.length}/300
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] text-ink-2">Prompts:</span>
              {DEFAULT_THESIS_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setThesis(p)}
                  title={p}
                  className="rounded-md border px-2.5 py-1 text-[12px]"
                  style={{
                    color: "var(--qc-brand-accent)",
                    background: "var(--qc-brand-accent-soft)",
                    borderColor: "var(--qc-brand-accent-edge)",
                  }}
                >
                  {p.length > 42 ? `${p.slice(0, 41).trimEnd()}…` : p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Q4 — conviction */}
      {dim && (
        <div>
          <div className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-2">
            <QNum n={4} /> How much conviction do you have?
          </div>
          <p className="mb-3 pl-[34px] text-[13px] leading-relaxed text-ink-2">
            Conviction determines how we weight this holding in your journal insights — and how
            aggressively we nudge you when things change.
          </p>
          <div className="grid grid-cols-1 gap-2 pl-[34px] sm:grid-cols-5">
            {CONV_LABELS.map((c, i) => {
              const n = i + 1;
              const sel = conviction === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setConviction(n)}
                  className="rounded-lg border px-2 py-2.5 text-center transition-all"
                  style={{
                    borderWidth: 1.5,
                    borderColor: sel ? "var(--qc-warn)" : "var(--qc-hair)",
                    background: sel ? "var(--qc-warn-soft)" : "var(--qc-card)",
                  }}
                >
                  <span className="mb-1.5 flex justify-center gap-[3px]">
                    {Array.from({ length: 5 }).map((_, d) => (
                      <span
                        key={d}
                        className="size-2 rounded-full"
                        style={{ background: d < n ? "var(--qc-warn)" : "var(--qc-hair)" }}
                      />
                    ))}
                  </span>
                  <span className="block text-[11px] font-bold text-ink-2">{c.label}</span>
                  <span className="mt-0.5 block text-[10px] leading-tight text-ink-3">{c.desc}</span>
                </button>
              );
            })}
          </div>

        </div>
      )}

      {/* Save Button */}
      {dim && (
        <div className="mt-2 flex justify-start">
          <button
            type="button"
            disabled={!isThesisComplete(value)}
            onClick={() => onSave?.()}
            className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "var(--qc-ink)" }}
          >
            Save entry →
          </button>
        </div>
      )}
    </div>
  );
}


// Validity check shared with the wizard footer.
export function isThesisComplete(s: ThesisFieldsState): boolean {
  return s.dim !== null && s.thesis.trim().length > 10 && s.conviction > 0;
}
