import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { formatCapital } from "@/components/model-builder/portfolio-builder-stepper";
import type { StoredModel } from "@/types/portfolio";

const RISK_PROFILE_LABELS: Record<string, string> = {
  conservative: "Conservative",
  balanced:     "Balanced",
  aggressive:   "Aggressive",
};

const SEGMENT_COLORS = ["var(--qc-ink)", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7"];

interface ModelBuilderCardProps {
  model: StoredModel;
}

export function ModelBuilderCard({ model }: ModelBuilderCardProps) {
  const assetClasses = model.assetClasses ?? [];
  const totalPct     = assetClasses.reduce((s, a) => s + a.pct, 0);
  const isBalanced   = Math.round(totalPct) === 100;
  const isOver       = totalPct > 100;

  return (
    <Link
      href={`/model-builder/${model.id}`}
      className="block rounded-xl border border-[#E2E2E2] bg-white hover:shadow-sm hover:border-zinc-300 transition-all cursor-pointer overflow-hidden"
    >
      {/* Top strip */}
      <div className="px-4 pt-4 pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-0.5"
              style={{ color: "rgba(18,18,18,0.40)" }}
            >
              Portfolio Model
            </p>
            <span className="text-sm font-semibold leading-tight" style={{ color: "var(--qc-ink)" }}>
              {model.name}
            </span>
          </div>
          <span
            className="shrink-0 text-[10px] font-semibold rounded-sm px-2 py-0.5 uppercase tracking-wide"
            style={{ background: "var(--qc-section)", color: "var(--qc-ink)" }}
          >
            {RISK_PROFILE_LABELS[model.riskProfile] ?? model.riskProfile}
          </span>
        </div>

        {/* Capital */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: "var(--qc-ink)" }}>
            {formatCapital(model.capital)}
          </span>
          {model.client?.clientName && model.client.clientName !== "—" && (
            <>
              <span style={{ color: "var(--qc-hair)" }}>·</span>
              <span className="text-xs" style={{ color: "var(--qc-ink-2)" }}>
                {model.client.clientName}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">

        {/* Stacked allocation bar */}
        {assetClasses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--qc-ink-2)" }}>
                Allocation
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: isOver ? "#dc2626" : isBalanced ? "#059669" : "var(--qc-ink-2)" }}
              >
                {Math.round(totalPct)}%
              </span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
              {assetClasses.map((entry, i) => (
                <div
                  key={entry.key}
                  style={{ width: `${entry.pct}%`, background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                  title={`${entry.label}: ${entry.pct}%`}
                />
              ))}
              {totalPct < 100 && (
                <div style={{ width: `${100 - totalPct}%`, background: "#F0F0F0" }} />
              )}
            </div>
          </div>
        )}

        {/* Asset class pills */}
        {assetClasses.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {assetClasses.map((entry) => (
              <span
                key={entry.key}
                className="text-[10px] font-medium rounded-sm px-2 py-0.5"
                style={{ background: "var(--qc-section)", color: "var(--qc-ink)" }}
              >
                {entry.label} {entry.pct}%
              </span>
            ))}
          </div>
        )}

        {/* Why-this-portfolio */}
        {model.whyThisPortfolio?.length > 0 && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--qc-ink-2)" }}>
            {model.whyThisPortfolio[0]}
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2.5 flex items-center justify-between border-t"
        style={{ borderColor: "#F0F0F0" }}
      >
        <span className="text-[10px]" style={{ color: "var(--qc-ink-2)" }}>
          {assetClasses.length} class{assetClasses.length !== 1 ? "es" : ""}
          {" · "}
          {formatDate(model.createdAt)}
        </span>
        <span className="text-[10px] font-medium" style={{ color: "var(--qc-ink)" }}>
          Open →
        </span>
      </div>
    </Link>
  );
}
