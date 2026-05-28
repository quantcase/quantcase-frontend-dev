import type { Holding } from "./portfolio-data";
import { modColor } from "./portfolio-data";

function modBadgeStyle(avgMod: number) {
  if (avgMod >= 80) return { background: "var(--qc-up-soft)",   color: "var(--qc-up)"  };
  if (avgMod >= 60) return { background: "var(--qc-warn-soft)", color: "var(--qc-warn)" };
  return { background: "#FEF2F2", color: "#B91C1C" };
}

export function SectorSidePanel({ holdings }: { holdings: Holding[] }) {
  const sectorMap = new Map<string, { value: number; modSum: number; count: number; alert: boolean }>();
  for (const h of holdings) {
    const cur = sectorMap.get(h.sector) ?? { value: 0, modSum: 0, count: 0, alert: false };
    sectorMap.set(h.sector, { value: cur.value + h.currentValue, modSum: cur.modSum + h.modScore, count: cur.count + 1, alert: cur.alert || !!h.alert });
  }
  const total = holdings.reduce((s, h) => s + h.currentValue, 0);
  const sectors = [...sectorMap.entries()]
    .map(([sector, d]) => ({ sector, value: d.value, pct: (d.value / total) * 100, avgMod: Math.round(d.modSum / d.count), alert: d.alert }))
    .sort((a, b) => b.value - a.value);

  const strong    = holdings.filter(h => h.modScore >= 80);
  const fair      = holdings.filter(h => h.modScore >= 60 && h.modScore < 80);
  const stretched = holdings.filter(h => h.modScore < 60);
  const strongPct = Math.round((strong.reduce((s, h) => s + h.currentValue, 0) / total) * 100);
  const fairPct   = Math.round((fair.reduce((s, h)   => s + h.currentValue, 0) / total) * 100);
  const weakPct   = Math.round((stretched.reduce((s, h) => s + h.currentValue, 0) / total) * 100);

  return (
    <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--qc-hair)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--qc-ink-2)" }}>Sector MOD Overlay</span>
        <span style={{ fontSize: 10, color: "var(--qc-ink-3)" }}>Colour = avg MOD</span>
      </div>

      {/* Sector rows */}
      {sectors.map(s => (
        <div key={s.sector} style={{ padding: "12px 20px", borderBottom: "1px solid var(--qc-hair)", background: s.avgMod < 60 ? "#FFF5F5" : "transparent", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}>{s.sector}</div>
            <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--qc-font-mono)", padding: "2px 8px", borderRadius: 999, minWidth: 32, textAlign: "center", ...modBadgeStyle(s.avgMod) }}>
              {s.avgMod}
            </div>
            <div style={{ fontSize: 11, color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-mono)" }}>{s.pct.toFixed(1)}%</div>
          </div>
          <div style={{ flex: 1, height: 5, background: "var(--qc-hair)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(s.pct * 3.5, 100)}%`, background: modColor(s.avgMod), borderRadius: 3 }} />
          </div>
          {s.alert && <div style={{ fontSize: 10, color: "#B91C1C", fontWeight: 500 }}>⚠ {s.sector} holding needs attention</div>}
        </div>
      ))}

      {/* MOD quality split */}
      <div style={{ padding: "14px 20px", background: "var(--qc-bg)" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600, marginBottom: 10 }}>MOD Quality Split</div>
        <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", gap: 2, marginBottom: 10 }}>
          <div style={{ width: `${strongPct}%`, background: "var(--qc-up)" }} />
          <div style={{ width: `${fairPct}%`,   background: "var(--qc-warn)" }} />
          <div style={{ width: `${weakPct}%`,   background: "#B91C1C" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
          {[
            { label: "Strong 80+",    val: `${strongPct}%`, sub: `${strong.length} stocks`,    color: "var(--qc-up)"  },
            { label: "Fair 60–79",    val: `${fairPct}%`,   sub: `${fair.length} stocks`,      color: "var(--qc-warn)" },
            { label: "Stretched <60", val: `${weakPct}%`,   sub: `${stretched.length} stock${stretched.length !== 1 ? "s" : ""}`, color: "#B91C1C" },
          ].map(b => (
            <div key={b.label}>
              <div style={{ fontSize: 10, color: b.color, fontWeight: 500 }}>{b.label}</div>
              <div style={{ fontSize: 18, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1, color: b.color }}>{b.val}</div>
              <div style={{ fontSize: 10, color: "var(--qc-ink-3)" }}>{b.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
