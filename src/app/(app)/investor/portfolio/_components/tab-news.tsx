import type { NewsItem } from "./portfolio-data";

function impactStyle(type: "pos" | "neg" | "neu"): React.CSSProperties {
  if (type === "neg") return { background: "#FEF2F2", color: "#B91C1C" };
  if (type === "pos") return { background: "var(--qc-up-soft)", color: "var(--qc-up)" };
  return { background: "var(--qc-bg)", color: "var(--qc-ink-2)", border: "1px solid var(--qc-hair)" };
}

function scoreColor(type: NewsItem["scoreChangeType"]) {
  if (type === "pos")  return "var(--qc-up)";
  if (type === "neg")  return "#B91C1C";
  return "var(--qc-warn)";
}

export function NewsTab({ items }: { items: NewsItem[] }) {
  return (
    <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--qc-hair)", background: "var(--qc-bg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--qc-ink-2)" }}>News & MOD Impact</span>
          <span style={{ background: "var(--qc-card)", padding: "2px 8px", borderRadius: 999, fontSize: 11, color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-mono)" }}>{items.length} new today</span>
        </div>
        <span style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>Filtered to your holdings · scored against MOD framework</span>
      </div>

      {/* News items */}
      {items.map((item, idx) => (
        <div key={idx} style={{ padding: "14px 20px", borderBottom: idx < items.length - 1 ? "1px solid var(--qc-hair)" : "none", display: "grid", gridTemplateColumns: "1fr auto", gap: 12, cursor: "pointer" }}>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", background: "var(--qc-ink)", color: "#fff", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0 }}>{item.ticker}</span>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", lineHeight: 1.3 }}>{item.title}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--qc-ink-2)", lineHeight: 1.5, marginBottom: 8 }}>{item.body}</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 10, color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-mono)" }}>
              <span style={{ fontWeight: 500, color: "var(--qc-ink-2)" }}>{item.source}</span>
              <span>{item.age}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0, minWidth: 120 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600, textAlign: "right" }}>MOD Impact</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {item.impacts.map((imp, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", ...impactStyle(imp.type) }}>
                  <span style={{ fontStyle: "italic", fontSize: 14 }}>{imp.pillar}</span>
                  {imp.label}
                </div>
              ))}
            </div>
            {item.scoreChange && (
              <div style={{ fontSize: 10, fontWeight: 600, textAlign: "right", marginTop: 6, color: scoreColor(item.scoreChangeType) }}>
                {item.scoreChange}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
