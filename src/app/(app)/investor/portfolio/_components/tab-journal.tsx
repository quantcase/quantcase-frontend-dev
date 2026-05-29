import type { Holding } from "./portfolio-data";
import { PILLAR_COLOR, modColor, thesisConfig } from "./portfolio-data";
import { ConvictionDots } from "./holding-row";

function JournalCard({ holding }: { holding: Holding }) {
  const tc = thesisConfig(holding.thesisHealth);
  const borderColor = holding.thesisHealth === "broken" ? "#FCA5A5" : holding.thesisHealth === "partial" ? "#FCD34D" : "#86EFAC";
  const headerBg    = holding.thesisHealth === "broken" ? "#FEF2F2" : holding.thesisHealth === "partial" ? "#FFFBEB" : "var(--qc-up-soft)";

  if (!holding.journal) return null;

  return (
    <div style={{ background: "var(--qc-card)", border: `1px solid ${borderColor}`, borderRadius: 12, overflow: "hidden" }}>
      {/* Card header */}
      <div style={{ background: headerBg, padding: "12px 20px", borderBottom: `1px solid ${borderColor}` }} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.02em", color: "var(--qc-ink)" }}>{holding.symbol}</div>
          <div style={{ fontSize: 10, color: "var(--qc-ink-3)" }}>{holding.name} · {holding.sector} · {holding.capType} Cap</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: tc.bg, color: tc.color }}>
            {tc.icon} Thesis {tc.label}
          </div>
          <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: 11, fontWeight: 700, color: modColor(holding.modScore) }}>
            MOD {holding.modScore}{holding.trendDir === "down" ? "↘" : holding.trendDir === "up" ? "↑" : ""}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px" }}>
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1fr_auto] sm:gap-5 items-start">
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600, marginBottom: 8 }}>Your thesis</div>
            <div style={{ fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: "var(--qc-ink-2)", marginBottom: 12 }}>{holding.journal.thesis}</div>
            {holding.journal.aiNudge && (
              <div style={{
                background: holding.thesisHealth === "broken" ? "#FEF2F2" : "var(--qc-warn-soft)",
                border: `1px solid ${holding.thesisHealth === "broken" ? "#FCA5A5" : "#FCD34D"}`,
                borderRadius: 8, padding: "10px 14px", fontSize: 12,
                color: holding.thesisHealth === "broken" ? "#B91C1C" : "#92400E",
                lineHeight: 1.55,
              }}>
                <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>🤖 AI Thesis Check</div>
                {holding.journal.aiNudge}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }} className="sm:flex-col sm:items-end sm:gap-2 sm:min-w-[120px]">
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600, marginBottom: 3 }}>Conviction</div>
              <ConvictionDots value={holding.journal.conviction} />
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600, marginBottom: 3 }}>P&L</div>
              <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: 13, fontWeight: 600, color: holding.pnl >= 0 ? "var(--qc-up)" : "#B91C1C" }}>
                {holding.pnl >= 0 ? "+" : ""}{holding.pnlPct.toFixed(1)}%
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <button style={{ background: "transparent", border: `1px solid ${holding.thesisHealth === "broken" ? "#FCA5A5" : "var(--qc-hair)"}`, padding: "4px 10px", borderRadius: 6, fontSize: 11, color: holding.thesisHealth === "broken" ? "#B91C1C" : "var(--qc-ink-2)", cursor: "pointer" }}>Revise</button>
              <button style={{ background: "transparent", border: "1px solid var(--qc-hair)", padding: "4px 10px", borderRadius: 6, fontSize: 11, color: "var(--qc-ink-2)", cursor: "pointer" }}>Open →</button>
            </div>
          </div>
        </div>

        {/* MOD sub-scores compact */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--qc-hair)" }} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(["mgmt", "opp", "deal"] as const).map(pillar => {
            const scores = holding.subScores.filter(s => s.pillar === pillar);
            if (!scores.length) return null;
            const lowest = scores.reduce((a, b) => a.score < b.score ? a : b);
            return (
              <div key={pillar} style={{ background: "var(--qc-bg)", borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: PILLAR_COLOR[pillar], fontWeight: 600, marginBottom: 3 }}>
                  {pillar === "mgmt" ? "Mgmt" : pillar === "opp" ? "Opp" : "Deal"}
                </div>
                <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: 13, fontWeight: 600, color: modColor(lowest.score) }}>
                  {lowest.score}{" "}
                  <span style={{ fontSize: 10, fontWeight: 400, color: "var(--qc-ink-3)" }}>{lowest.label.split(" ")[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NoThesisRow({ holding }: { holding: Holding }) {
  return (
    <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 12, padding: "16px 20px" }} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)" }}>{holding.symbol}</div>
          <div style={{ fontSize: 11, color: "var(--qc-ink-3)", marginTop: 2 }}>{holding.name} · {holding.sector}</div>
        </div>
        <div style={{ fontStyle: "italic", fontSize: 13, color: "var(--qc-ink-3)" }}>No thesis added yet</div>
      </div>
      <button style={{ background: "#EDE9FE", color: "#6D28D9", border: "1px solid #DDD6FE", padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}>
        + Add thesis
      </button>
    </div>
  );
}

export function JournalTab({ holdings }: { holdings: Holding[] }) {
  const intact  = holdings.filter(h => h.thesisHealth === "intact");
  const partial = holdings.filter(h => h.thesisHealth === "partial");
  const broken  = holdings.filter(h => h.thesisHealth === "broken");
  const none    = holdings.filter(h => h.thesisHealth === "none");
  const withThesis = holdings.filter(h => h.thesisHealth !== "none");

  const summaryChips = [
    { count: intact.length,  label: "Intact",    sub: "Thesis holding", bg: "var(--qc-up-soft)",   border: "#86EFAC",  color: "var(--qc-up)"  },
    { count: partial.length, label: "Partial",   sub: "Needs review",   bg: "var(--qc-warn-soft)", border: "#FCD34D",  color: "var(--qc-warn)" },
    { count: broken.length,  label: "Broken",    sub: "Act required",   bg: "#FEF2F2",              border: "#FCA5A5",  color: "#B91C1C" },
    { count: none.length,    label: "No thesis", sub: "Add entry",      bg: "var(--qc-bg)",         border: "var(--qc-hair)", color: "var(--qc-ink-3)" },
  ];

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 20 }} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600, marginBottom: 6 }}>Investment Journal</div>
          <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1, color: "var(--qc-ink)" }}>Your investment diary</div>
          <div style={{ fontSize: 13, color: "var(--qc-ink-3)", marginTop: 6 }}>
            {withThesis.length} of {holdings.length} holdings have thesis entries ·{" "}
            <span style={{ color: "#7C3AED", fontWeight: 600, cursor: "pointer" }}>Complete the remaining {none.length} →</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={{ background: "var(--qc-card)", color: "var(--qc-ink-2)", border: "1px solid var(--qc-hair)", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Filter by thesis health</button>
          <button style={{ background: "var(--qc-ink)", color: "#fff", border: "none", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Export journal PDF</button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 mb-5">
        {summaryChips.map(b => (
          <div key={b.label} style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: 8, padding: "10px 16px", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 400, color: b.color }}>{b.count}</div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: b.color, fontWeight: 700 }}>{b.label}</div>
              <div style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>{b.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Entries — broken first, then partial, then intact */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[...broken, ...partial, ...intact].map(h => <JournalCard key={h.symbol} holding={h} />)}
        {none.map(h => <NoThesisRow key={h.symbol} holding={h} />)}
      </div>
    </div>
  );
}
