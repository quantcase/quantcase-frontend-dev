import { cn } from "@/lib/utils";
import type { WealthModel } from "@/types/wealthos";

interface ModelCardProps {
  model: WealthModel;
  className?: string;
  action?: React.ReactNode;
}

export function ModelCard({ model, className, action }: ModelCardProps) {
  return (
    <div
      className={cn("rounded-[14px]", className)}
      style={{
        border: "1px solid var(--qc-hair)",
        background: "var(--qc-card)",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p
          className="leading-snug"
          style={{ fontSize: 14, fontWeight: 500, color: "var(--qc-ink)" }}
        >
          {model.name}
        </p>
        <span
          className="shrink-0 inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium uppercase"
          style={{
            background: "var(--qc-chip)",
            border: "1px solid var(--qc-hair)",
            color: "var(--qc-ink-2)",
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            letterSpacing: "0.06em",
          }}
        >
          {model.model_type}
        </span>
      </div>
      {model.description && (
        <p className="line-clamp-2 mb-3" style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>
          {model.description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
