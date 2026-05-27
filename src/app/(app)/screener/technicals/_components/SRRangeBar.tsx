export function SRRangeBar({
  support,
  resistance,
  cmp,
  positionInRange,
}: {
  support: number;
  resistance: number;
  cmp: number;
  positionInRange: number;
}) {
  const clampedPos = Math.max(0, Math.min(100, positionInRange));

  return (
    <div className="px-2 py-2">
      <div className="flex justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-ink-2)" }}>Support</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-ink-2)" }}>Resistance</span>
      </div>

      {/* Track */}
      <div
        className="relative h-3 rounded-full"
        style={{ background: "var(--qc-section)", border: "1px solid var(--qc-hair)" }}
      >
        {/* Fill from support to CMP */}
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${clampedPos}%`, background: "var(--qc-ink)", opacity: 0.25 }}
        />
        {/* CMP dot marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${clampedPos}%` }}
        >
          <div
            className="w-4 h-4 rounded-full border-2 border-white shadow-md"
            style={{ background: "var(--qc-ink)" }}
          />
        </div>
      </div>

      {/* Value labels */}
      <div className="relative mt-3" style={{ height: 20 }}>
        <span
          className="absolute left-0 font-semibold"
          style={{ fontSize: 13, color: "var(--qc-ink)" }}
        >
          ₹{support.toLocaleString("en-IN")}
        </span>
        <span
          className="absolute -translate-x-1/2 font-semibold"
          style={{ left: `${clampedPos}%`, fontSize: 13, color: "var(--qc-ink)" }}
        >
          ₹{cmp.toLocaleString("en-IN")}
        </span>
        <span
          className="absolute right-0 font-semibold"
          style={{ fontSize: 13, color: "var(--qc-ink)" }}
        >
          ₹{resistance.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Annotation */}
      <div className="mt-6 text-center">
        <span className="font-mono text-[11px]" style={{ color: "var(--qc-ink)" }}>
          CMP is{" "}
          <span style={{ fontWeight: 600, color: "var(--qc-ink)" }}>
            {positionInRange.toFixed(1)}%
          </span>{" "}
          from support
        </span>
      </div>
    </div>
  );
}
