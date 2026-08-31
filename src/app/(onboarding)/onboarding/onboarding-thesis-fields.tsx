"use client";

import { useMemo } from "react";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DEFAULT_THESIS_PROMPTS } from "@/lib/journal-ideas";
import { SUB_FACTORS, DIMENSION_LABEL } from "@/types/journal";
import type { Dimension } from "@/types/journal";
import { ConvictionSlider } from "@/app/(app)/diary/_components/conviction-slider";
import { useQuantcaseRead } from "@/app/(app)/diary/_hooks/useQuantcaseRead";

export interface ThesisFieldsState {
  dim: Dimension | null;
  subFactors: string[];
  thesis: string;
  conviction: number;
}

interface OnboardingThesisFieldsProps {
  ticker?: string;
  value: ThesisFieldsState;
  onChange: (next: ThesisFieldsState) => void;
  dimScores?: Partial<Record<Dimension, number | null>>;
  onSave?: () => void;
}

const DIMS: Dimension[] = ["M", "O", "D"];
const LABEL_TO_DIM: Record<string, Dimension> = {
  [DIMENSION_LABEL.M]: "M",
  [DIMENSION_LABEL.O]: "O",
  [DIMENSION_LABEL.D]: "D",
};

export function OnboardingThesisFields({ ticker, value, onChange, dimScores, onSave }: OnboardingThesisFieldsProps) {
  const { dim, subFactors, thesis, conviction } = value;
  const activeDim = dim || "M";

  const { snapshot } = useQuantcaseRead(ticker || null, activeDim);

  const dynamicPrompts = useMemo(() => {
    if (!snapshot) return [];
    return snapshot
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.endsWith(".") ? s : `${s}.`));
  }, [snapshot]);

  const prompts = dynamicPrompts.length > 0 ? dynamicPrompts : DEFAULT_THESIS_PROMPTS;

  const setDim = (d: Dimension) => onChange({ ...value, dim: d, subFactors: [] });
  const setSubFactors = (next: string[]) => onChange({ ...value, subFactors: next });
  const setThesis = (next: string) => onChange({ ...value, thesis: next });
  const setConviction = (next: number) => onChange({ ...value, conviction: next });

  function toggleSubFactor(sf: string) {
    setSubFactors(subFactors.includes(sf) ? subFactors.filter((x) => x !== sf) : [...subFactors, sf]);
  }

  const isComplete = activeDim !== null && thesis.trim().length > 10 && conviction > 0;

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* ── Dimension ── */}
      <div>
        <div className="eyebrow mb-2 text-[10px] uppercase tracking-wider text-ink-3 font-mono">Dimension that drove your decision</div>
        <TabToggle
          options={DIMS.map((d) => DIMENSION_LABEL[d])}
          value={DIMENSION_LABEL[activeDim]}
          onChange={(label) => setDim(LABEL_TO_DIM[label])}
          variant="outline"
        />
      </div>

      {/* ── Sub-factors ── */}
      <div className="flex flex-wrap gap-2">
        {SUB_FACTORS[activeDim].map((sf) => (
          <span key={sf} className="rounded-md border border-hair px-3 py-2">
            <CheckboxField
              checked={subFactors.includes(sf)}
              onChange={() => toggleSubFactor(sf)}
              label={sf}
            />
          </span>
        ))}
      </div>

      {/* ── Thesis ── */}
      <div className="flex flex-col">
        <div className="relative flex flex-col">
          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Why do you own this? What has to be true for it to work?"
            className="serif min-h-[84px] w-full resize-none rounded-lg border border-hair bg-card px-3.5 py-3 text-[15px] italic leading-[1.55] text-ink outline-none placeholder:text-ink-3 focus:border-hair-strong"
          />
          <span className="pointer-events-none absolute bottom-2 right-3 mono text-[10px] text-ink-3">
            {thesis.length}/300
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {prompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setThesis(p)}
              title={p}
              className="rounded-md border px-2.5 py-1 text-[11px] transition-opacity hover:opacity-80"
              style={{
                color: "var(--qc-brand-accent)",
                background: "var(--qc-brand-accent-soft)",
                borderColor: "var(--qc-brand-accent-edge)",
              }}
            >
              {p.length > 55 ? p.slice(0, 54).trimEnd() + "…" : p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Conviction ── */}
      <ConvictionSlider value={conviction} onChange={setConviction} />

      <div className="mt-2 flex justify-start">
        <button
          type="button"
          disabled={!isComplete}
          onClick={() => onSave?.()}
          className="rounded-lg px-6 py-2.5 text-[13px] font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: "var(--qc-ink)" }}
        >
          Save entry →
        </button>
      </div>
    </div>
  );
}

export function isThesisComplete(s: ThesisFieldsState): boolean {
  return s.dim !== null && s.thesis.trim().length > 10 && s.conviction > 0;
}
