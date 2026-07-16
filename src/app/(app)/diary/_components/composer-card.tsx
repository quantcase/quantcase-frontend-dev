"use client";

import { useState, useMemo } from "react";
import { Loader2, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ds";
import { Button } from "@/components/ui/button";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { useJournalMutations } from "@/hooks/useJournalMutations";
import { DEFAULT_THESIS_PROMPTS } from "@/lib/journal-ideas";
import { fmtPrice } from "@/lib/journal-format";
import { fmtSignedPct } from "@/lib/portfolio-format";
import { SUB_FACTORS, DIMENSION_LABEL } from "@/types/journal";
import type { Dimension } from "@/types/journal";

import { QuantcaseReadBox } from "./quantcase-read-box";
import { ConvictionSlider } from "./conviction-slider";
import { useQuantcaseRead } from "../_hooks/useQuantcaseRead";
import type { DiaryTicker } from "../_lib/diary-derive";

interface ComposerCardProps {
  t: DiaryTicker;
  journalId: string;
  onSaved: () => void;
}

// TabToggle takes plain strings, so the dimension tabs show labels and map back
// to the M/O/D discriminant at this boundary.
const DIMS: Dimension[] = ["M", "O", "D"];
const LABEL_TO_DIM: Record<string, Dimension> = {
  [DIMENSION_LABEL.M]: "M",
  [DIMENSION_LABEL.O]: "O",
  [DIMENSION_LABEL.D]: "D",
};

// The front card of the carousel: everything needed to write one thesis about
// one stock, without leaving the page.
//
// This is a sibling of components/journal/entry-composer.tsx, not a replacement
// — that one still serves the side panel and the screener dock, where the
// note/thesis switch and stepped layout make sense. Both call the same addEntry.
export function ComposerCard({ t, journalId, onSaved }: ComposerCardProps) {
  const { addEntry, mutating } = useJournalMutations();

  const [dim, setDim] = useState<Dimension>("M");
  const [subFactors, setSubFactors] = useState<string[]>([]);
  const [thesis, setThesis] = useState("");
  const [conviction, setConviction] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { read } = useQuantcaseRead(t.ticker, dim);

  // Same gate as the existing composer: a dimension, real prose, a conviction.
  const canSave = thesis.trim().length > 10 && conviction > 0;

  const subtitle = useMemo(
    () => [t.name, t.sector].filter(Boolean).join(" · "),
    [t.name, t.sector],
  );

  function save() {
    if (!canSave) return;
    setError(null);
    addEntry(
      journalId,
      t.ticker,
      { dimension: dim, subFactors, thesis: thesis.trim(), conviction },
      () => onSaved(),
      setError,
    );
  }

  function toggleSubFactor(sf: string) {
    setSubFactors((prev) => (prev.includes(sf) ? prev.filter((x) => x !== sf) : [...prev, sf]));
  }

  const pct = t.market.changePercent;

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-xl border border-hair bg-card p-5">
      {/* ── Stock header ── */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="serif text-[26px] leading-none text-ink">{t.ticker}</span>
          <span className="text-right">
            <span className="mono block text-[16px] font-semibold text-ink">{fmtPrice(t.market.ltp)}</span>
            <span className="mono block text-[11px] text-ink-3">
              {/* fmtSignedPct throws on null — changePercent is nullable */}
              {pct != null && (
                <span className={pct >= 0 ? "text-up" : "text-down"}>{fmtSignedPct(pct)}</span>
              )}
              {pct != null && " · "}
              MOD {t.entryCount}
            </span>
          </span>
        </div>

        {subtitle && <div className="mt-1.5 text-[13px] text-ink-2">{subtitle}</div>}

        {t.market.thesisTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {t.market.thesisTags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="muted">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* ── Dimension ── */}
      <div>
        <div className="eyebrow mb-2">Dimension</div>
        <TabToggle
          options={DIMS.map((d) => DIMENSION_LABEL[d])}
          value={DIMENSION_LABEL[dim]}
          onChange={(label) => {
            setDim(LABEL_TO_DIM[label]);
            setSubFactors([]); // sub-factors are dimension-specific
          }}
          variant="outline"
        />
      </div>

      <QuantcaseReadBox read={read} />

      {/* ── Sub-factors ── */}
      <div className="flex flex-wrap gap-2">
        {SUB_FACTORS[dim].map((sf) => (
          <span key={sf} className="rounded-md border border-hair px-3 py-2">
            <CheckboxField
              checked={subFactors.includes(sf)}
              onChange={() => toggleSubFactor(sf)}
              label={sf}
            />
          </span>
        ))}
      </div>

      {/* ── Thesis ──
          Takes the column's slack: when the card is stretched to match the
          holdings column, the writing box is the part worth growing. */}
      <div className="flex flex-1 flex-col">
        <div className="relative flex flex-1 flex-col">
          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            maxLength={300}
            rows={3}
            aria-label={`Your thesis for ${t.ticker}`}
            placeholder="Why do you own this? What has to be true for it to work?"
            className="serif min-h-[84px] w-full flex-1 resize-none rounded-lg border border-hair bg-card px-3.5 py-3 text-[15px] italic leading-[1.55] text-ink outline-none placeholder:text-ink-3 focus:border-hair-strong"
          />
          <span className="pointer-events-none absolute bottom-2 right-3 mono text-[10px] text-ink-3">
            {thesis.length}/300
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {DEFAULT_THESIS_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setThesis(p)}
              title={p}
              className="rounded-md border border-[var(--qc-brand-accent-edge)] bg-brand-accent-soft px-2.5 py-1 text-[11px] text-brand-accent transition-opacity hover:opacity-80"
            >
              {p.length > 42 ? `${p.slice(0, 41).trimEnd()}…` : p}
            </button>
          ))}
        </div>
      </div>

      <ConvictionSlider value={conviction} onChange={setConviction} disabled={mutating} />

      {error && (
        <div className="rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">{error}</div>
      )}

      <Button onClick={save} disabled={!canSave || mutating} className="self-start">
        {mutating ? <Loader2 className="size-3.5 animate-spin" /> : null}
        Save entry
        {!mutating && <ArrowRight className="size-3.5" />}
      </Button>
    </div>
  );
}
