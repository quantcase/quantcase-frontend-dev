import { Target } from "lucide-react";
import type { PortfolioData } from "@/types/portfolio";

function PositionRow({ pos, rank }: { pos: PortfolioData["positions"][0]; rank: number }) {
  const scoreColor = pos.score >= 80 ? "#16a34a" : pos.score >= 65 ? "#d97706" : "#dc2626";

  return (
    <div
      className="grid items-center gap-3 py-3 border-b border-[#E2E2E2] last:border-0"
      style={{ gridTemplateColumns: "24px 1fr 68px 70px 54px" }}
    >
      <span style={{ fontSize: 11, color: "var(--qc-text-muted)", fontVariantNumeric: "tabular-nums" }}>{rank}</span>
      <div className="min-w-0">
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-text-heading)", lineHeight: 1.3 }} className="truncate">
          {pos.company}
        </div>
        <div style={{ fontSize: 11, color: "var(--qc-text-muted)" }}>{pos.ticker}</div>
      </div>
      <span
        className="rounded-sm px-1.5 py-0.5 text-center"
        style={{ fontSize: 10, color: "var(--qc-text-muted)", background: "var(--qc-surface-panel)", textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        {pos.subClass.replace(/_/g, "-")}
      </span>
      <div className="flex items-center justify-end gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: scoreColor }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)", fontVariantNumeric: "tabular-nums" }}>
          {pos.score}
        </span>
      </div>
      <span
        className="text-right"
        style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-text-heading)", fontVariantNumeric: "tabular-nums" }}
      >
        {pos.allocation}%
      </span>
    </div>
  );
}

export function PositionsTableCard({ portfolio }: { portfolio: PortfolioData }) {
  const sorted = [...portfolio.positions].sort((a, b) => b.score - a.score);
  const totalWeight = portfolio.positions.reduce((s, p) => s + p.allocation, 0);

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      <div className="rounded-[10px] bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-text-heading)" }}>Equity Positions</span>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: "var(--qc-text-muted)" }}>
              {portfolio.positions.length} holdings · {totalWeight}% allocated
            </span>
            <Target className="size-4 text-zinc-400" />
          </div>
        </div>

        <div
          className="grid gap-3 pb-2 border-b border-[#E2E2E2] mb-1"
          style={{ gridTemplateColumns: "24px 1fr 68px 70px 54px" }}
        >
          {["#", "Company", "Class", "IC Score", "Alloc"].map((h) => (
            <span
              key={h}
              className={h === "IC Score" || h === "Alloc" ? "text-right" : ""}
              style={{ fontSize: 10, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              {h}
            </span>
          ))}
        </div>

        {sorted.map((pos, i) => <PositionRow key={pos.id} pos={pos} rank={i + 1} />)}

        {sorted.length === 0 && (
          <div className="py-8 text-center" style={{ color: "var(--qc-text-muted)", fontSize: 13 }}>
            No positions in this portfolio.
          </div>
        )}
      </div>
    </div>
  );
}
