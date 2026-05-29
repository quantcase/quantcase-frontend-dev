"use client";

interface ReturnsLeveragePanelProps {
  roce: number | null;
  roe: number | null;
  debtToEquity: number | null;
  roce3yAvg: number | null;
  roe3yAvg: number | null;
}

function MetricRow({
  label,
  value,
  fillPct,
  fillColor,
  benchmarkPct,
  note,
}: {
  label: string;
  value: string;
  fillPct: number;
  fillColor: string;
  benchmarkPct: number;
  note: string;
}) {
  return (
    <div style={{ padding: "12px 0" }}>
      {/* Label + Value on same line */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <span
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-10)",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--qc-ink-2)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-14)",
            fontWeight: "var(--qc-w-medium)",
            letterSpacing: "-0.01em",
            color: "var(--qc-ink)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </span>
      </div>

      {/* Full-width bar */}
      <div
        style={{
          position: "relative",
          height: 4,
          background: "var(--qc-hair)",
          borderRadius: 999,
          marginBottom: 5,
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            right: `${100 - Math.min(fillPct, 100)}%`,
            background: fillColor,
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -4,
            bottom: -4,
            left: `${benchmarkPct}%`,
            width: 1,
            background: "var(--qc-ink-2)",
            opacity: 0.3,
          }}
        />
      </div>

      {/* Note */}
      <span
        style={{
          fontSize: "var(--qc-fz-10)",
          color: "var(--qc-ink-2)",
          fontFamily: "var(--qc-font-mono)",
          letterSpacing: ".02em",
        }}
      >
        {note}
      </span>
    </div>
  );
}

export function ReturnsLeveragePanel({ roce, roe, debtToEquity, roce3yAvg, roe3yAvg }: ReturnsLeveragePanelProps) {
  const roceIsGood = roce != null && roce > 15;
  const roeIsGood = roe != null && roe > 12;
  const deIsGood = debtToEquity != null && debtToEquity < 1;

  const roceFillPct = roce != null ? Math.min((roce / 50) * 100, 100) : 0;
  const roeFillPct = roe != null ? Math.min((roe / 50) * 100, 100) : 0;
  const deFillPct = debtToEquity != null ? Math.min((debtToEquity / 3) * 100, 100) : 0;

  return (
    <div
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 14,
        padding: "4px 0 2px",
        marginBottom: 8,
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          fontFamily: "var(--qc-font-mono)",
          fontSize: "var(--qc-fz-9)",
          letterSpacing: "var(--qc-track-eyebrow)",
          textTransform: "uppercase",
          color: "var(--qc-ink-2)",
          paddingTop: 12,
          paddingBottom: 4,
          paddingLeft: 18,
          paddingRight: 18,
          borderBottom: "1px solid var(--qc-hair)",
        }}
      >
        Returns &amp; Leverage
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3">
        <div style={{ borderRight: "1px solid var(--qc-hair)", padding: "0 18px" }}>
          <MetricRow
            label="ROCE"
            value={roce != null ? `${roce.toFixed(1)}%` : "—"}
            fillPct={roceFillPct}
            fillColor={roceIsGood ? "var(--qc-up)" : "var(--qc-warn)"}
            benchmarkPct={30}
            note={`Industry avg ${roce3yAvg != null ? `~${roce3yAvg.toFixed(0)}%` : "~15%"}`}
          />
        </div>
        <div style={{ borderRight: "1px solid var(--qc-hair)", padding: "0 18px" }}>
          <MetricRow
            label="ROE"
            value={roe != null ? `${roe.toFixed(1)}%` : "—"}
            fillPct={roeFillPct}
            fillColor={roeIsGood ? "var(--qc-up)" : "var(--qc-warn)"}
            benchmarkPct={25}
            note={`Industry avg ${roe3yAvg != null ? `~${roe3yAvg.toFixed(0)}%` : "~12%"}`}
          />
        </div>
        <div style={{ padding: "0 18px" }}>
          <MetricRow
            label="Debt / Equity"
            value={debtToEquity != null ? `${debtToEquity.toFixed(2)}x` : "—"}
            fillPct={deFillPct}
            fillColor={deIsGood ? "var(--qc-warn)" : "var(--qc-down)"}
            benchmarkPct={33}
            note={`≤1.0 healthy · ${deIsGood ? "Low" : "Elevated"}`}
          />
        </div>
      </div>
    </div>
  );
}
