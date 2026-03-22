import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { StoredModel, RiskProfileType } from "@/types/portfolio";

const RISK_PROFILE_LABELS: Record<RiskProfileType, string> = {
  conservative: "Conservative",
  balanced: "Balanced",
  aggressive: "Aggressive",
};

interface ModelBuilderCardProps {
  model: StoredModel;
}

export function ModelBuilderCard({ model }: ModelBuilderCardProps) {
  const totalAllocation = model.positions.reduce((sum, p) => sum + p.allocation, 0);

  return (
    <Link
      href={`/model-builder/${model.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-sm hover:border-zinc-300 transition-all cursor-pointer"
    >
      {/* Row 1: name + risk profile pill */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold" style={{ color: "#0F172B" }}>
          {model.name}
        </span>
        <span
          className="shrink-0 text-xs font-medium rounded-full px-2.5 py-0.5"
          style={{ background: "#F5F5F5", color: "#0F172B" }}
        >
          {RISK_PROFILE_LABELS[model.activeProfile]}
        </span>
      </div>

      {/* Row 2: style */}
      <p className="mt-1 text-xs" style={{ color: "#888888" }}>
        {model.style}
      </p>

      {/* Row 3: stats */}
      <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: "#888888" }}>
        <span>{model.positions.length} position{model.positions.length !== 1 ? "s" : ""}</span>
        <span className="text-zinc-300">·</span>
        <span>{totalAllocation}% allocated</span>
        <span className="text-zinc-300">·</span>
        <span>{formatDate(model.createdAt)}</span>
      </div>

      {/* Row 4: open link */}
      <div className="mt-3 flex justify-end">
        <span className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
          Open →
        </span>
      </div>
    </Link>
  );
}
