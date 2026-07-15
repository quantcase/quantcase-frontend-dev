"use client";

import { SentimentPill, StatTile } from "@/components/overview/primitives";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function fp(val: number | null | undefined): string {
  if (val == null) return "—";
  return `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function pctChange(current: number, ref: number | null | undefined): string {
  if (ref == null || ref === 0) return "—";
  const diff = ((current - ref) / ref) * 100;
  return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
}

// ─── LadderRow ───────────────────────────────────────────────────────────────

interface LadderRowProps {
  labelK: string;
  chipLabel: string;
  chipBg: string;
  chipColor: string;
  nodeType: "res" | "ath" | "cur" | "sup" | "plain";
  value: string;
  pct: string;
  pctType: "pos" | "neg" | "neutral";
  isCurrent: boolean;
}

function LadderRow({
  labelK, chipLabel, chipBg, chipColor, nodeType, value, pct, pctType, isCurrent,
}: LadderRowProps) {
  const nodeStyle: React.CSSProperties =
    nodeType === "cur"
      ? {
          width: 18, height: 18, borderRadius: "50%",
          background: "var(--qc-ink)", border: "2px solid var(--qc-ink)",
          margin: "0 auto", position: "relative", zIndex: 2,
          boxShadow: "0 0 0 4px rgba(14,14,12,0.08)",
        }
      : {
          width: 14, height: 14, borderRadius: "50%",
          background: "var(--qc-card)",
          border: `2px solid ${
            nodeType === "res" ? "var(--qc-down)"
            : nodeType === "ath" ? "var(--qc-warn)"
            : nodeType === "sup" ? "var(--qc-up)"
            : "var(--qc-hair)"
          }`,
          margin: "0 auto", position: "relative", zIndex: 2,
        };

  const pctColor =
    pctType === "pos" ? "var(--qc-up)"
    : pctType === "neg" ? "var(--qc-down)"
    : "var(--qc-ink-2)";

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "100px 16px 1fr",
        alignItems: "center",
        gap: 0,
        padding: "7px 0",
        minHeight: 34,
      }}
    >
      <div style={{ textAlign: "right", paddingRight: 12 }}>
        <div
          style={{
            fontSize: "var(--qc-fz-11)",
            color: isCurrent ? "var(--qc-ink)" : "var(--qc-ink-2)",
            letterSpacing: ".02em",
            lineHeight: 1.1,
            fontWeight: isCurrent ? "var(--qc-w-medium)" : "var(--qc-w-regular)",
            fontFamily: "var(--qc-font-sans)",
          }}
        >
          {labelK}
        </div>
        <span
          style={{
            display: "inline-block",
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-9)",
            fontWeight: "var(--qc-w-medium)",
            letterSpacing: ".08em",
            padding: "2px 5px",
            borderRadius: 4,
            marginTop: 3,
            textTransform: "uppercase",
            background: chipBg,
            color: chipColor,
          }}
        >
          {chipLabel}
        </span>
      </div>
      <div style={nodeStyle} />
      <div
        style={{
          paddingLeft: 10,
          fontSize: isCurrent ? "var(--qc-fz-14)" : "var(--qc-fz-12)",
          fontWeight: isCurrent ? "var(--qc-w-medium)" : "var(--qc-w-regular)",
          color: "var(--qc-ink)",
          fontFamily: "var(--qc-font-mono)",
        }}
      >
        {value}
        {pct !== "—" && (
          <span style={{ fontSize: "var(--qc-fz-10)", color: pctColor, marginLeft: 6, letterSpacing: ".02em", fontFamily: "var(--qc-font-mono)" }}>
            {pct}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── PriceLadderSection ───────────────────────────────────────────────────────

interface PriceLadderSectionProps {
  cmp: number;
  high52w: number;
  low52w: number;
  ath: number;
  r1: number | null;
  s1: number | null;
  rangePct: number;
  distFromATH: number | null;
  distFromS1: number | null;
  rrRatio: number | null;
  atr14: number | null;
  bbSqueeze: boolean;
  verdictLabel: string;
  verdictSentiment: "up" | "down" | "neutral";
}

export function PriceLadderSection({
  cmp, high52w, low52w, ath, r1, s1, rangePct,
  distFromATH, distFromS1, rrRatio, atr14, bbSqueeze,
  verdictLabel, verdictSentiment,
}: PriceLadderSectionProps) {
  return (
    <section
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 18,
        padding: "18px 22px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-10)",
            letterSpacing: ".16em",
            color: "var(--qc-ink-2)",
            textTransform: "uppercase",
          }}
        >
          Price structure · Daily
        </span>
        <SentimentPill label={verdictLabel} sentiment={verdictSentiment} />
      </div>

      {/* Body: ladder + range */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 22,
          alignItems: "stretch",
          paddingTop: 4,
        }}
      >
        {/* Price ladder */}
        <div style={{ position: "relative", width: 280, padding: "6px 0" }}>
          {/* Vertical track */}
          <div
            style={{
              position: "absolute",
              left: 108,
              top: 12,
              bottom: 12,
              width: 2,
              background: "linear-gradient(180deg,var(--qc-down-soft) 0%, var(--qc-warn-soft) 45%, var(--qc-up-soft) 100%)",
              borderRadius: 2,
            }}
          />
          {((): React.ReactNode => {
            type LadderEntry = LadderRowProps & { price: number };
            const entries: LadderEntry[] = [
              {
                price: cmp, labelK: "Current price", chipLabel: "CMP",
                chipBg: "var(--qc-ink)", chipColor: "#fff",
                nodeType: "cur", value: fp(cmp), pct: "—",
                pctType: "neutral", isCurrent: true,
              },
              {
                price: ath, labelK: "All-time / 52W high", chipLabel: "ATH",
                chipBg: "var(--qc-warn-soft)", chipColor: "var(--qc-warn)",
                nodeType: "ath", value: fp(ath), pct: pctChange(ath, cmp),
                pctType: "neutral", isCurrent: false,
              },
              {
                price: low52w, labelK: "52-week low", chipLabel: "52W",
                chipBg: "var(--qc-chip, #F2F1EC)", chipColor: "var(--qc-ink)",
                nodeType: "plain", value: fp(low52w), pct: pctChange(low52w, cmp),
                pctType: "pos", isCurrent: false,
              },
              ...(r1 != null ? [{
                price: r1, labelK: "Resistance 1", chipLabel: "R1",
                chipBg: "var(--qc-down-soft)", chipColor: "var(--qc-down)",
                nodeType: "res" as const, value: fp(r1), pct: pctChange(r1, cmp),
                pctType: "neutral" as const, isCurrent: false,
              }] : []),
              ...(s1 != null ? [{
                price: s1, labelK: "Support 1", chipLabel: "S1",
                chipBg: "var(--qc-up-soft)", chipColor: "var(--qc-up)",
                nodeType: "sup" as const, value: fp(s1), pct: pctChange(s1, cmp),
                pctType: "pos" as const, isCurrent: false,
              }] : []),
            ];
            return entries
              .sort((a, b) => b.price - a.price)
              .map(({ price: _price, ...rowProps }) => (
                <LadderRow key={rowProps.chipLabel} {...rowProps} />
              ));
          })()}
        </div>

        {/* Range + stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "4px 0",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-sans)" }}>
                52-week range position
              </span>
              <span
                style={{
                  fontFamily: "var(--qc-font-mono)",
                  fontSize: "var(--qc-fz-11)",
                  color: "var(--qc-ink)",
                  fontWeight: "var(--qc-w-medium)",
                }}
              >
                {rangePct}th percentile
              </span>
            </div>
            {/* 52W bar */}
            <div
              style={{
                position: "relative",
                height: 34,
                background: "var(--qc-hair)",
                borderRadius: 6,
                overflow: "hidden",
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0, top: 0, bottom: 0,
                  width: `${rangePct}%`,
                  background: "linear-gradient(90deg, var(--qc-up-soft), var(--qc-up-soft))",
                  borderRadius: 6,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -3, bottom: -3,
                  left: `calc(${rangePct}% - 1px)`,
                  width: 3,
                  background: "var(--qc-ink)",
                  borderRadius: 2,
                  boxShadow: "0 0 0 2px rgba(255,255,255,.9)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--qc-font-mono)",
                fontSize: "var(--qc-fz-10)",
                color: "var(--qc-ink-2)",
                letterSpacing: "var(--qc-track-pill)",
                marginTop: 3,
              }}
            >
              <span>{fp(low52w)} · Low</span>
              <span>{fp(high52w)} · High</span>
            </div>
          </div>

          {/* Stats grid */}
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginTop: 12 }}
          >
            <StatTile
              label="Distance from ATH"
              value={distFromATH != null ? `${distFromATH.toFixed(1)}` : "—"}
              unit="%"
              sub={distFromATH != null && distFromATH > -5 ? "Near ATH" : "Pullback zone"}
            />
            <StatTile
              label="Distance from S1"
              value={distFromS1 != null ? `+${distFromS1.toFixed(1)}` : "—"}
              unit="%"
              sub={distFromS1 != null && distFromS1 > 0 ? "Above support" : "At/below support"}
              subSentiment={distFromS1 != null && distFromS1 > 0 ? "pos" : "neg"}
            />
            <StatTile
              label="Risk : reward"
              value={rrRatio != null ? `1 : ${rrRatio.toFixed(2)}` : "—"}
              sub="to R1 / S1"
            />
            <StatTile
              label="ATR (14)"
              value={atr14 != null ? fp(atr14) : "—"}
              sub={bbSqueeze ? "Volatility contracting" : "Volatility expanding"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
