"use client";

import { CONV_LABELS } from "@/lib/journal-format";

interface ConvictionSliderProps {
  /** 0 = unset, 1–5 = conviction level. */
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

// Conviction as a 1–5 range. A native <input type="range"> carries the keyboard
// and screen-reader semantics for free; only the track/thumb are restyled.
//
// The fill is brand violet (interactive), not semantic — high conviction isn't
// "good", it's just how sure you are.
export function ConvictionSlider({ value, onChange, disabled }: ConvictionSliderProps) {
  const label = value > 0 ? CONV_LABELS[value - 1].label : "Not set";
  const pct = value > 0 ? ((value - 1) / 4) * 100 : 0;

  return (
    <div>
      <div className="eyebrow mb-2">
        Conviction {value > 0 && <span className="text-ink-2">— {label}</span>}
      </div>

      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value || 1}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Conviction"
        aria-valuetext={label}
        className="qc-conviction-range"
        // Track fill is painted by .qc-conviction-range in globals.css — the
        // base range rules set an opaque track, so it can't be done inline.
        // Unset (0) leaves the track empty: visibly awaiting an answer.
        style={{ "--qc-fill-pct": `${pct}%` } as React.CSSProperties}
      />

      <div className="mt-1.5 flex justify-between">
        {CONV_LABELS.map((c, i) => (
          <span
            key={c.label}
            className={`text-[10px] ${value === i + 1 ? "font-semibold text-ink" : "text-ink-3"}`}
          >
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
