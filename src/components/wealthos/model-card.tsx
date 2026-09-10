import { cn } from "@/lib/utils";
import type { WealthModel } from "@/types/wealthos";

interface ModelCardProps {
  model: WealthModel;
  className?: string;
  action?: React.ReactNode;
  isAssigned?: boolean;
  onAssign?: (modelId: string) => void;
  onRemove?: (modelId: string) => void;
}

export function ModelCard({
  model,
  className,
  action,
  isAssigned,
  onAssign,
  onRemove,
}: ModelCardProps) {
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
      {!action && (onAssign || onRemove) && (
        <div className="mt-2 flex justify-end">
          {isAssigned ? (
            <button
              type="button"
              onClick={() => onRemove?.(model.id)}
              className="text-xs px-2.5 py-1 rounded hover:opacity-80 transition-opacity cursor-pointer font-medium"
              style={{ background: "rgba(220, 38, 38, 0.1)", color: "var(--qc-down)" }}
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAssign?.(model.id)}
              className="text-xs px-2.5 py-1 rounded hover:opacity-80 transition-opacity cursor-pointer font-medium"
              style={{ background: "var(--qc-ink)", color: "var(--qc-on-dark)" }}
            >
              Assign
            </button>
          )}
        </div>
      )}
    </div>
  );
}
