import type { TargetPriceMatrixSection, DPriceScenario } from "@/types/deal";
import { fmtDealNum } from "@/lib/utils";

interface TargetPriceMatrixProps {
  data?: TargetPriceMatrixSection;
}

const scenarioConfig = [
  {
    key: "bear" as const,
    label: "Bear case",
    accentColor: "var(--qc-warn)",
    targetColor: "var(--qc-down)",
  },
  {
    key: "base" as const,
    label: "Base case",
    accentColor: "var(--qc-blue)",
    targetColor: "var(--qc-blue)",
  },
  {
    key: "bull" as const,
    label: "Bull case",
    accentColor: "var(--qc-up)",
    targetColor: "var(--qc-up)",
  },
];

function isPositive(fromCmp?: string) {
  return fromCmp?.startsWith("+") ?? true;
}

function PriceCard({
  config,
  caseData,
}: {
  config: (typeof scenarioConfig)[number];
  caseData?: DPriceScenario;
}) {
  const fromCmpColor = isPositive(caseData?.from_cmp) ? "var(--qc-up)" : "var(--qc-down)";

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: `2px solid ${config.accentColor}`, background: "var(--qc-card)" }}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${config.accentColor}18`, color: config.accentColor, border: `1px solid ${config.accentColor}` }}
          >
            {config.label}
          </span>
          {(caseData?.tags ?? []).map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)", border: "1px solid var(--qc-hair)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--qc-ink-2)" }}>Target range</p>
          <p className="text-[32px] font-medium leading-tight" style={{ color: config.targetColor }}>
            {fmtDealNum(caseData?.target_range) ?? "N/A"}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: fromCmpColor }}>
              {fmtDealNum(caseData?.from_cmp) ?? "N/A"}
            </span>
            <span className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>from CMP</span>
          </div>
          <p className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>{fmtDealNum(caseData?.cagr)}</p>
        </div>

        <div className="space-y-0 pt-3" style={{ borderTop: "1px solid var(--qc-hair-2)" }}>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs" style={{ color: "var(--qc-ink-2)" }}>EPS CAGR</span>
            <span className="text-sm font-semibold" style={{ color: config.targetColor }}>
              {fmtDealNum(caseData?.eps_cagr) ?? "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs" style={{ color: "var(--qc-ink-2)" }}>FY EPS</span>
            <span className="text-sm font-semibold" style={{ color: "var(--qc-ink)" }}>
              {fmtDealNum(caseData?.fy_eps) ?? "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs" style={{ color: "var(--qc-ink-2)" }}>Exit P/E</span>
            <span className="text-sm font-semibold" style={{ color: "var(--qc-ink)" }}>
              {fmtDealNum(caseData?.exit_pe) ?? "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 mt-1 pt-2.5" style={{ borderTop: "1px solid var(--qc-hair-2)" }}>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs" style={{ color: "var(--qc-ink-2)" }}>Probability</span>
              <div className="h-1.5 flex-1 max-w-[100px] rounded-full overflow-hidden" style={{ background: "var(--qc-section)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${caseData?.probability ?? 0}%`, background: config.accentColor }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--qc-ink-2)" }}>
              {caseData?.probability ?? 0}%
            </span>
          </div>
        </div>

        {caseData?.pe_rationale && (
          <p className="text-[12px] leading-relaxed pt-3" style={{ color: "var(--qc-ink-2)", borderTop: "1px solid var(--qc-hair-2)" }}>
            {caseData.pe_rationale}
          </p>
        )}
      </div>
    </div>
  );
}

export function TargetPriceMatrix({ data }: TargetPriceMatrixProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {scenarioConfig.map((config) => (
        <PriceCard key={config.key} config={config} caseData={data?.[config.key]} />
      ))}
    </div>
  );
}
