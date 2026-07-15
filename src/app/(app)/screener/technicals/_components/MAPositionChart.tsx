export function MAPositionChart({
  price,
  mas,
  low52w,
  high52w,
}: {
  price: number;
  mas: { label: string; value: number }[];
  low52w: number;
  high52w: number;
}) {
  const range = high52w - low52w;
  function pct(v: number) {
    return range > 0 ? Math.max(0, Math.min(100, ((v - low52w) / range) * 100)) : 0;
  }

  const pricePct = pct(price);
  const annotated = mas.map((ma) => ({
    ...ma,
    pos: pct(ma.value),
    above: price >= ma.value,
  }));

  const sorted = [...annotated].sort((a, b) => a.pos - b.pos);
  const labelRow: Record<string, number> = {};
  sorted.forEach((ma, i) => {
    if (i === 0) { labelRow[ma.label] = 0; return; }
    const prev = sorted[i - 1];
    labelRow[ma.label] = (ma.pos - prev.pos < 9) ? (labelRow[prev.label] === 0 ? 1 : 0) : 0;
  });

  const TRACK_H = 10;
  const TOP_LABEL_H = 72;
  const BOT_H = 48;
  const TOTAL_H = TOP_LABEL_H + TRACK_H + BOT_H;

  // Design tokens — SVG attributes resolve `var(--qc-*)` directly, so reference
  // the tokens straight through (a token edit in globals.css cascades here).
  const QC_UP = "var(--qc-up)";
  const QC_DOWN = "var(--qc-down)";
  const QC_HEADING = "var(--qc-ink)";
  const QC_GRID = "var(--qc-hair)";
  const QC_BORDER = "var(--qc-hair)";
  const QC_MUTED = "var(--qc-ink-3)";

  return (
    <div className="px-4 py-6 select-none">
      {/* Header row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "var(--qc-fz-11)", color: QC_MUTED, fontWeight: "var(--qc-w-semi)", letterSpacing: "0.06em", fontFamily: "var(--qc-font-mono)", textTransform: "uppercase" }}>
            52W LOW
          </span>
          <span style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", color: QC_HEADING, fontFamily: "var(--qc-font-sans)" }}>
            ₹{low52w.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span style={{ fontSize: "var(--qc-fz-10)", color: QC_MUTED, fontWeight: "var(--qc-w-semi)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--qc-font-mono)" }}>
            Current Price
          </span>
          <span
            className="inline-flex items-center rounded-[6px] px-3 py-1 text-sm font-bold"
            style={{ background: QC_HEADING, color: "#fff", letterSpacing: "0.01em" }}
          >
            ₹{price.toLocaleString("en-IN")}
          </span>
          <span style={{ fontSize: "var(--qc-fz-10)", color: QC_MUTED, fontFamily: "var(--qc-font-mono)" }}>
            {pricePct.toFixed(1)}% of 52W range
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", color: QC_HEADING, fontFamily: "var(--qc-font-sans)" }}>
            ₹{high52w.toLocaleString("en-IN")}
          </span>
          <span style={{ fontSize: "var(--qc-fz-11)", color: QC_MUTED, fontWeight: "var(--qc-w-semi)", letterSpacing: "0.06em", fontFamily: "var(--qc-font-mono)", textTransform: "uppercase" }}>
            52W HIGH
          </span>
        </div>
      </div>

      {/* Chart SVG */}
      <div className="relative w-full" style={{ height: TOTAL_H }}>
        <svg
          width="100%"
          height={TOTAL_H}
          style={{ overflow: "visible", display: "block" }}
          viewBox={`0 0 1000 ${TOTAL_H}`}
          preserveAspectRatio="none"
        >
          {/* MA tick lines — drawn above the track */}
          {annotated.map((ma) => {
            const x = (ma.pos / 100) * 1000;
            const row = labelRow[ma.label];
            const lineTop = row === 0 ? TOP_LABEL_H - 28 : TOP_LABEL_H - 56;
            const lineBot = TOP_LABEL_H;
            return (
              <line
                key={ma.label + "-line"}
                x1={x} y1={lineTop}
                x2={x} y2={lineBot}
                stroke={ma.above ? QC_UP : QC_DOWN}
                strokeWidth={1.5}
                strokeDasharray="3 2"
                opacity={0.7}
              />
            );
          })}

          {/* Track background */}
          <rect
            x={0} y={TOP_LABEL_H}
            width={1000} height={TRACK_H}
            rx={TRACK_H / 2} ry={TRACK_H / 2}
            fill={QC_GRID}
            stroke={QC_BORDER}
            strokeWidth={1}
          />

          {/* Fill from 0 to CMP */}
          <rect
            x={0} y={TOP_LABEL_H}
            width={(pricePct / 100) * 1000} height={TRACK_H}
            rx={TRACK_H / 2} ry={TRACK_H / 2}
            fill={QC_HEADING}
            opacity={0.18}
          />

          {/* MA tick marks on the track */}
          {annotated.map((ma) => {
            const x = (ma.pos / 100) * 1000;
            return (
              <rect
                key={ma.label + "-tick"}
                x={x - 1} y={TOP_LABEL_H}
                width={2} height={TRACK_H}
                fill={ma.above ? QC_UP : QC_DOWN}
              />
            );
          })}

          {/* CMP dot */}
          <circle
            cx={(pricePct / 100) * 1000}
            cy={TOP_LABEL_H + TRACK_H / 2}
            r={8}
            fill={QC_HEADING}
            stroke="white"
            strokeWidth={2.5}
          />

          {/* CMP drop line to bottom label */}
          <line
            x1={(pricePct / 100) * 1000}
            y1={TOP_LABEL_H + TRACK_H}
            x2={(pricePct / 100) * 1000}
            y2={TOP_LABEL_H + TRACK_H + 10}
            stroke={QC_HEADING}
            strokeWidth={1.5}
            opacity={0.3}
          />
        </svg>

        {/* MA labels rendered as HTML for crisp text — positioned above track */}
        {annotated.map((ma) => {
          const leftPct = ma.pos;
          const row = labelRow[ma.label];
          const bottomOffset = row === 0 ? TRACK_H + 32 : TRACK_H + 60;
          return (
            <div
              key={ma.label + "-lbl"}
              className="absolute flex flex-col items-center"
              style={{
                left: `${leftPct}%`,
                bottom: bottomOffset,
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              <span
                className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: ma.above ? "var(--qc-up)" : "var(--qc-down)" }}
              >
                {ma.label}
              </span>
              <span style={{ fontSize: "var(--qc-fz-11)", color: "var(--qc-ink)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)" }}>
                ₹{ma.value.toFixed(2)}
              </span>
            </div>
          );
        })}

        {/* CMP label below track */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: `${pricePct}%`,
            top: TOP_LABEL_H + TRACK_H + 12,
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--qc-ink)" }}>CMP</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-2 pt-3" style={{ borderTop: "1px solid var(--qc-hair-2)" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ background: "var(--qc-up)" }} />
          <span className="font-mono text-[10px]" style={{ color: "var(--qc-ink-2)" }}>Price above MA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ background: "var(--qc-down)" }} />
          <span className="font-mono text-[10px]" style={{ color: "var(--qc-ink-2)" }}>Price below MA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: "var(--qc-ink)" }} />
          <span className="font-mono text-[10px]" style={{ color: "var(--qc-ink-2)" }}>Current price</span>
        </div>
      </div>
    </div>
  );
}
