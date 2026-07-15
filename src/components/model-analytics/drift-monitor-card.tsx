import type { PortfolioData } from "@/types/portfolio";
import { getDriftItems, driftSeverity } from "./portfolio-data";

function DriftRow({ item }: { item: ReturnType<typeof getDriftItems>[0] }) {
  const sev = driftSeverity(item.driftPercent);
  const borderColor = sev === "critical" ? "var(--qc-down)" : sev === "warning" ? "var(--qc-warn)" : "var(--qc-up)";
  const absWidth = Math.min(Math.abs(item.driftPercent) * 6, 100);

  return (
    <div className="flex items-center gap-3 rounded-[8px] bg-card p-3 border-l-4" style={{ borderLeftColor: borderColor }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)" }}>{item.assetClass}</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: item.driftPercent >= 0 ? "var(--qc-up)" : "var(--qc-down)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {item.driftPercent >= 0 ? "+" : ""}{item.driftPercent}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${absWidth}%`, background: borderColor }} />
          </div>
          <span style={{ fontSize: 11, color: "var(--qc-ink-2)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            {item.currentAllocation}% → {item.targetAllocation}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function DriftMonitorCard({ portfolio }: { portfolio: PortfolioData }) {
  const driftItems = getDriftItems(portfolio);
  const critical = driftItems.filter((d) => driftSeverity(d.driftPercent) === "critical").length;
  const warning  = driftItems.filter((d) => driftSeverity(d.driftPercent) === "warning").length;

  return (
    <div className="rounded-[10px] border border-hair bg-secondary p-2">
      <div className="rounded-[10px] bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)" }}>Allocation Drift</span>
          <div className="flex items-center gap-2">
            {critical > 0 && (
              <span className="rounded-sm px-2 py-0.5" style={{ fontSize: 11, background: "var(--qc-down-soft)", color: "var(--qc-down)", fontWeight: 600 }}>
                {critical} critical
              </span>
            )}
            {warning > 0 && (
              <span className="rounded-sm px-2 py-0.5" style={{ fontSize: 11, background: "var(--qc-warn-soft)", color: "var(--qc-warn)", fontWeight: 600 }}>
                {warning} warning
              </span>
            )}
            {critical === 0 && warning === 0 && (
              <span className="rounded-sm px-2 py-0.5" style={{ fontSize: 11, background: "var(--qc-up-soft)", color: "var(--qc-up)", fontWeight: 600 }}>
                On track
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {driftItems.map((d) => <DriftRow key={d.id} item={d} />)}
        </div>

        <div className="pt-3 border-t border-hair">
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Portfolio Rationale
          </div>
          <ul className="space-y-2">
            {portfolio.whyThisPortfolio.map((reason, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-ink-3 mt-2 flex-shrink-0" />
                <span style={{ fontSize: 12, color: "var(--qc-ink-2)", lineHeight: 1.6 }}>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
