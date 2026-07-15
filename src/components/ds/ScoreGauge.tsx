import { cn } from "@/lib/utils";

/**
 * ScoreGauge — the ONE score-out-of-N visualization primitive.
 *
 * Consolidates qc-score-strip's ring, deal-score-breakdown's ArcGauge, the
 * onboarding HalfArcGauge, and the ~20 files hand-computing circumference /
 * dashOffset. Shapes: ring | half-arc | bar. (Radar stays bespoke for now.)
 *
 * Per the design system the filled track is navy (--qc-ink), NOT semantic
 * green — a gauge shows magnitude, not sentiment. Pass `tier` only when the
 * fill genuinely encodes good/caution/bad.
 */
export type ScoreGaugeShape = "ring" | "half-arc" | "bar";

type Tier = "up" | "warn" | "down";

const TIER_COLOR: Record<Tier, string> = {
  up: "var(--qc-up)",
  warn: "var(--qc-warn)",
  down: "var(--qc-down)",
};

interface ScoreGaugeProps {
  /** Current value. */
  value: number;
  /** Max value (denominator). Default 100. */
  max?: number;
  shape?: ScoreGaugeShape;
  /** Pixel size of the gauge (diameter for ring/half-arc, height for bar). */
  size?: number;
  strokeWidth?: number;
  /** Semantic fill instead of navy. Provide a tier or a threshold-derived one. */
  tier?: Tier;
  /** Show the numeric value centered (ring/half-arc) — default true. */
  showValue?: boolean;
  /** Small caption under/next to the number, e.g. "DEAL" or "/100". */
  label?: string;
  className?: string;
}

export function ScoreGauge({
  value,
  max = 100,
  shape = "ring",
  size = 60,
  strokeWidth = 5,
  tier,
  showValue = true,
  label,
  className,
}: ScoreGaugeProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  const fill = tier ? TIER_COLOR[tier] : "var(--qc-ink)";

  if (shape === "bar") {
    return (
      <div className={cn("w-full", className)}>
        <div
          className="w-full overflow-hidden rounded-full bg-hair"
          style={{ height: Math.max(3, strokeWidth) }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${pct * 100}%`, background: fill }}
          />
        </div>
      </div>
    );
  }

  if (shape === "half-arc") {
    const r = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const half = Math.PI * r; // semicircle length
    const offset = half * (1 - pct);
    return (
      <div className={cn("relative inline-block", className)} style={{ width: size, height: size / 2 + strokeWidth }}>
        <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
          <path
            d={`M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
            fill="none" stroke="var(--qc-hair)" strokeWidth={strokeWidth} strokeLinecap="round"
          />
          <path
            d={`M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
            fill="none" stroke={fill} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={half} strokeDashoffset={offset}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-x-0 bottom-0 grid place-items-center font-mono" style={{ fontSize: size * 0.28, fontWeight: 500 }}>
            {value}
          </div>
        )}
      </div>
    );
  }

  // ring (default)
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const cx = size / 2;
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} stroke="var(--qc-hair)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={cx} cy={cx} r={r} stroke={fill} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={c} strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cx})`} strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 grid place-items-center leading-none">
          <span className="font-mono tracking-[-0.015em]" style={{ fontSize: size * 0.36, fontWeight: 500 }}>{value}</span>
          {label && <span className="font-mono text-ink-3" style={{ fontSize: size * 0.14 }}>{label}</span>}
        </div>
      )}
    </div>
  );
}
