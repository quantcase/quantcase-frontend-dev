import type { PortfolioData } from "@/types/portfolio";
import { getDriftItems, driftSeverity } from "./portfolio-data";

function DriftRow({ item }: { item: ReturnType<typeof getDriftItems>[0] }) {
  const sev = driftSeverity(item.driftPercent);
  const borderColor = sev === "critical" ? "#dc2626" : sev === "warning" ? "#d97706" : "#16a34a";
  const absWidth = Math.min(Math.abs(item.driftPercent) * 6, 100);

  return (
    <div className="flex items-center gap-3 rounded-[8px] bg-white p-3 border-l-4" style={{ borderLeftColor: borderColor }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ fontSize: 13, fontWeight: 500, color: "#0F172B" }}>{item.assetClass}</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: item.driftPercent >= 0 ? "#16a34a" : "#dc2626",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {item.driftPercent >= 0 ? "+" : ""}{item.driftPercent}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${absWidth}%`, background: borderColor }} />
          </div>
          <span style={{ fontSize: 11, color: "#888888", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
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
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      <div className="rounded-[10px] bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B" }}>Allocation Drift</span>
          <div className="flex items-center gap-2">
            {critical > 0 && (
              <span className="rounded-sm px-2 py-0.5" style={{ fontSize: 11, background: "#fef2f2", color: "#dc2626", fontWeight: 600 }}>
                {critical} critical
              </span>
            )}
            {warning > 0 && (
              <span className="rounded-sm px-2 py-0.5" style={{ fontSize: 11, background: "#fffbeb", color: "#d97706", fontWeight: 600 }}>
                {warning} warning
              </span>
            )}
            {critical === 0 && warning === 0 && (
              <span className="rounded-sm px-2 py-0.5" style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", fontWeight: 600 }}>
                On track
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {driftItems.map((d) => <DriftRow key={d.id} item={d} />)}
        </div>

        <div className="pt-3 border-t border-[#E2E2E2]">
          <div style={{ fontSize: 11, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Portfolio Rationale
          </div>
          <ul className="space-y-2">
            {portfolio.whyThisPortfolio.map((reason, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-zinc-400 mt-2 flex-shrink-0" />
                <span style={{ fontSize: 12, color: "#888888", lineHeight: 1.6 }}>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
