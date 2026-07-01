import type { JournalEntryItem, JournalSummary, Pillar } from "@/types/journal";
import { ConvictionDots } from "./holding-row";

// ── Helpers ───────────────────────────────────────────────────────────────────

const PILLAR_COLOR: Record<Pillar, string> = {
  mgmt: "var(--qc-up)",
  opp:  "var(--qc-blue)",
  deal: "#7C3AED",
};

function modColor(score: number) {
  if (score >= 80) return "var(--qc-up)";
  if (score >= 60) return "var(--qc-warn)";
  return "#B91C1C";
}

function thesisConfig(h: JournalEntryItem["thesisHealth"]) {
  if (h === "intact")  return { label: "Intact",    color: "var(--qc-up)",  bg: "var(--qc-up-soft)",   icon: "●", border: "#86EFAC",  headerBg: "var(--qc-up-soft)"  };
  if (h === "partial") return { label: "Partial",   color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", icon: "⚡", border: "#FCD34D", headerBg: "#FFFBEB"            };
  if (h === "broken")  return { label: "Broken",    color: "#B91C1C",        bg: "#FEF2F2",             icon: "✕", border: "#FCA5A5", headerBg: "#FEF2F2"            };
  return                      { label: "No thesis", color: "#9A9A92",        bg: "var(--qc-bg)",        icon: "○", border: "var(--qc-hair)", headerBg: "var(--qc-bg)" };
}

// ── JournalCard ───────────────────────────────────────────────────────────────

function JournalCard({ item, onAddThesis }: { item: JournalEntryItem; onAddThesis?: (symbol: string) => void }) {
  if (!item.journal) return <NoThesisRow item={item} onAddThesis={onAddThesis} />;

  const tc = thesisConfig(item.thesisHealth);
  const trendSuffix = item.trendDir === "down" ? "↘" : item.trendDir === "up" ? "↑" : "";

  return (
    <div style={{ background: "var(--qc-card)", border: `1px solid ${tc.border}`, borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: tc.headerBg, padding: "12px 20px", borderBottom: `1px solid ${tc.border}` }} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.02em", color: "var(--qc-ink)" }}>{item.symbol}</div>
          {item.portfolioType === "shadow" && (
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: "#EDE9FE", color: "#6D28D9", border: "1px solid #DDD6FE" }}>Trackers</span>
          )}
          {(item.name || item.sector || item.capType) && (
            <div style={{ fontSize: 10, color: "var(--qc-ink-3)" }}>
              {[item.name ?? item.symbol, item.sector, item.capType ? `${item.capType} Cap` : null].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: tc.bg, color: tc.color }}>
            {tc.icon} Thesis {tc.label}
          </div>
          {item.modScore > 0 && (
            <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: 11, fontWeight: 700, color: modColor(item.modScore) }}>
              MOD {item.modScore}{trendSuffix}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px" }}>
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1fr_auto] sm:gap-5 items-start">
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600, marginBottom: 8 }}>Your thesis</div>
            <div style={{ fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: "var(--qc-ink-2)", marginBottom: 12 }}>{item.journal.thesis}</div>
            {item.journal.aiNudge && (
              <div style={{ background: item.thesisHealth === "broken" ? "#FEF2F2" : "var(--qc-warn-soft)", border: `1px solid ${item.thesisHealth === "broken" ? "#FCA5A5" : "#FCD34D"}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: item.thesisHealth === "broken" ? "#B91C1C" : "#92400E", lineHeight: 1.55 }}>
                <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>🤖 AI Thesis Check</div>
                {item.journal.aiNudge}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }} className="sm:flex-col sm:items-end sm:gap-2 sm:min-w-[120px]">
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600, marginBottom: 3 }}>Conviction</div>
              <ConvictionDots value={item.journal.conviction} />
            </div>
            {item.pnlPct !== null && item.pnlPct !== undefined && (
              <div>
                <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600, marginBottom: 3 }}>Today</div>
                <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: 13, fontWeight: 600, color: item.pnlPct >= 0 ? "var(--qc-up)" : "#B91C1C" }}>
                  {item.pnlPct >= 0 ? "+" : ""}{item.pnlPct.toFixed(2)}%
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <button style={{ background: "transparent", border: `1px solid ${item.thesisHealth === "broken" ? "#FCA5A5" : "var(--qc-hair)"}`, padding: "4px 10px", borderRadius: 6, fontSize: 11, color: item.thesisHealth === "broken" ? "#B91C1C" : "var(--qc-ink-2)", cursor: "pointer" }}>Revise</button>
              <button style={{ background: "transparent", border: "1px solid var(--qc-hair)", padding: "4px 10px", borderRadius: 6, fontSize: 11, color: "var(--qc-ink-2)", cursor: "pointer" }}>Open →</button>
            </div>
          </div>
        </div>

        {/* MOD sub-scores compact — lowest per pillar */}
        {item.subScores.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--qc-hair)" }} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(["mgmt", "opp", "deal"] as const).map(pillar => {
              const scores = item.subScores.filter(s => s.pillar === pillar);
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
        )}
      </div>
    </div>
  );
}

// ── NoThesisRow ───────────────────────────────────────────────────────────────

function NoThesisRow({ item, onAddThesis }: { item: JournalEntryItem; onAddThesis?: (symbol: string) => void }) {
  return (
    <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 12, padding: "16px 20px" }} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)" }}>{item.symbol}</div>
            {item.portfolioType === "shadow" && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: "#EDE9FE", color: "#6D28D9", border: "1px solid #DDD6FE" }}>Trackers</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--qc-ink-3)", marginTop: 2 }}>
            {[item.name ?? item.symbol, item.sector].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div style={{ fontStyle: "italic", fontSize: 13, color: "var(--qc-ink-3)" }}>No thesis added yet</div>
      </div>
      <button
        onClick={() => onAddThesis?.(item.symbol)}
        style={{ background: "#EDE9FE", color: "#6D28D9", border: "1px solid #DDD6FE", padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}
      >
        + Add thesis
      </button>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function JournalSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 12, padding: "20px", height: 120, opacity: 0.5 + i * 0.1 }}>
          <div style={{ background: "var(--qc-hair)", borderRadius: 4, height: 12, width: "30%", marginBottom: 12 }} />
          <div style={{ background: "var(--qc-hair)", borderRadius: 4, height: 10, width: "70%", marginBottom: 8 }} />
          <div style={{ background: "var(--qc-hair)", borderRadius: 4, height: 10, width: "50%" }} />
        </div>
      ))}
    </div>
  );
}

// ── JournalTab ────────────────────────────────────────────────────────────────

interface JournalTabProps {
  entries: JournalEntryItem[];
  summary: JournalSummary;
  loading?: boolean;
  error?: string | null;
  onAddThesis?: (symbol: string) => void;
}

export function JournalTab({ entries, summary, loading, error, onAddThesis }: JournalTabProps) {
  const withThesis = (summary.intact ?? 0) + (summary.partial ?? 0) + (summary.broken ?? 0);

  const broken  = entries.filter(e => e.thesisHealth === "broken");
  const partial = entries.filter(e => e.thesisHealth === "partial");
  const intact  = entries.filter(e => e.thesisHealth === "intact");
  const none    = entries.filter(e => e.thesisHealth === "none");

  const summaryChips = [
    { count: summary.intact ?? 0,  label: "Intact",    sub: "Thesis holding", bg: "var(--qc-up-soft)",   border: "#86EFAC",        color: "var(--qc-up)"   },
    { count: summary.partial ?? 0, label: "Partial",   sub: "Needs review",   bg: "var(--qc-warn-soft)", border: "#FCD34D",        color: "var(--qc-warn)" },
    { count: summary.broken ?? 0,  label: "Broken",    sub: "Act required",   bg: "#FEF2F2",             border: "#FCA5A5",        color: "#B91C1C"        },
    { count: summary.none ?? 0,    label: "No thesis", sub: "Add entry",      bg: "var(--qc-bg)",        border: "var(--qc-hair)", color: "var(--qc-ink-3)" },
  ];

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 20 }} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600, marginBottom: 6 }}>Investment Journal</div>
          <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1, color: "var(--qc-ink)" }}>Your investment diary</div>
          <div style={{ fontSize: 13, color: "var(--qc-ink-3)", marginTop: 6 }}>
            {withThesis} of {summary.total} holdings have thesis entries
            {none.length > 0 && (
              <>
                {" · "}
                <span
                  style={{ color: "#7C3AED", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => onAddThesis?.(none[0]?.symbol)}
                >
                  Complete the remaining {none.length} →
                </span>
              </>
            )}
          </div>
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

      {/* Content */}
      {loading && <JournalSkeleton />}
      {error && (
        <div style={{ padding: "20px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, color: "#B91C1C", fontSize: 13 }}>
          Failed to load journal entries: {error}
        </div>
      )}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...broken, ...partial, ...intact].map(item => (
            <JournalCard key={item.symbol} item={item} onAddThesis={onAddThesis} />
          ))}
          {none.map(item => (
            <NoThesisRow key={item.symbol} item={item} onAddThesis={onAddThesis} />
          ))}
          {entries.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--qc-ink-3)", fontSize: 14 }}>
              No holdings found. Connect your portfolio to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
