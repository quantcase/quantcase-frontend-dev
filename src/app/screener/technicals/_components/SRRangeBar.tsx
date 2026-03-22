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
        <span style={{ fontSize: 11, color: "#888888", fontWeight: 500 }}>SUPPORT</span>
        <span style={{ fontSize: 11, color: "#888888", fontWeight: 500 }}>RESISTANCE</span>
      </div>

      {/* Track */}
      <div className="relative h-3 rounded-full bg-zinc-100" style={{ border: "1px solid #E2E2E2" }}>
        {/* Fill from support to CMP */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-zinc-900"
          style={{ width: `${clampedPos}%` }}
        />
        {/* CMP dot marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${clampedPos}%` }}
        >
          <div className="w-4 h-4 rounded-full bg-zinc-900 border-2 border-white shadow-md" />
        </div>
      </div>

      {/* Value labels */}
      <div className="relative mt-3" style={{ height: 20 }}>
        <span
          className="absolute left-0"
          style={{ fontSize: 13, fontWeight: 600, color: "#0F172B" }}
        >
          ₹{support.toLocaleString("en-IN")}
        </span>
        <span
          className="absolute -translate-x-1/2"
          style={{ left: `${clampedPos}%`, fontSize: 13, fontWeight: 600, color: "#0F172B" }}
        >
          ₹{cmp.toLocaleString("en-IN")}
        </span>
        <span
          className="absolute right-0"
          style={{ fontSize: 13, fontWeight: 600, color: "#0F172B" }}
        >
          ₹{resistance.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Annotation */}
      <div className="mt-6 text-center">
        <small>
          CMP is{" "}
          <span style={{ fontWeight: 600, color: "#0F172B" }}>
            {positionInRange.toFixed(1)}%
          </span>{" "}
          from support
        </small>
      </div>
    </div>
  );
}
