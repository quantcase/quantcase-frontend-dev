import { Minus } from "lucide-react";
import type { PortfolioData } from "@/types/portfolio";
import { formatCrore } from "./portfolio-data";

const PALETTE = ["var(--qc-ink)", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7"];

function AllocationDonut({ assetClasses }: { assetClasses: PortfolioData["assetClasses"] }) {
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 52;
  const innerR = 34;
  let angle = -90;

  const arcs = assetClasses.map((ac, i) => {
    const sweep = (ac.pct / 100) * 360;
    const start = angle;
    angle += sweep;
    return { label: ac.label, color: PALETTE[i % PALETTE.length], start, sweep };
  });

  function polarToXY(a: number, r: number) {
    const rad = (a * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(start: number, sweep: number, r: number) {
    const end = start + sweep - 0.3;
    const p1 = polarToXY(start, r);
    const p2 = polarToXY(end, r);
    const large = sweep > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
  }

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      {arcs.map((arc) => (
        <path
          key={arc.label}
          d={describeArc(arc.start, arc.sweep, outerR)}
          fill="none"
          stroke={arc.color}
          strokeWidth={outerR - innerR}
          strokeLinecap="butt"
        />
      ))}
      <text x={cx} y={cy - 5} textAnchor="middle" style={{ fontSize: 13, fontWeight: 600, fill: "var(--qc-ink)" }}>
        {assetClasses.length}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 9, fill: "var(--qc-ink-2)" }}>
        CLASSES
      </text>
    </svg>
  );
}

export function AllocationBreakdownCard({ portfolio }: { portfolio: PortfolioData }) {
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      <div className="rounded-[10px] bg-white p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)" }}>Asset Allocation</span>
          <span style={{ fontSize: 11, color: "var(--qc-ink-2)" }}>{portfolio.assetClasses.length} classes</span>
        </div>

        {/* Donut + legend */}
        <div className="flex items-start gap-5">
          <AllocationDonut assetClasses={portfolio.assetClasses} />
          <div className="flex-1 space-y-2 pt-1">
            {portfolio.assetClasses.map((ac, i) => (
              <div key={ac.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-[2px] flex-shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                  <span style={{ fontSize: 13, color: "#121212" }}>{ac.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}>
                  {ac.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-class detail */}
        <div className="pt-2 border-t border-[#E2E2E2] space-y-3">
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Sub-class Detail
          </div>
          {portfolio.assetClasses.map((ac) => (
            <div key={ac.key}>
              <div className="flex items-center justify-between py-1">
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {ac.label}
                </span>
                <span style={{ fontSize: 12, color: "var(--qc-ink-2)", fontVariantNumeric: "tabular-nums" }}>
                  {formatCrore(ac.amount)}
                </span>
              </div>
              {ac.subClasses.map((sc) => (
                <div key={sc.key} className="flex items-center justify-between py-1.5 border-b border-[#F5F5F5] last:border-0">
                  <div className="flex items-center gap-2">
                    <Minus className="size-3 text-zinc-300" />
                    <span style={{ fontSize: 13, color: "#121212" }}>{sc.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span style={{ fontSize: 12, color: "var(--qc-ink-2)", fontVariantNumeric: "tabular-nums" }}>
                      {formatCrore(sc.amount)}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums", minWidth: 36, textAlign: "right" }}>
                      {sc.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
