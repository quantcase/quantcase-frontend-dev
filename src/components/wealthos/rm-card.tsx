import { cn } from "@/lib/utils";
import { Users, TrendingUp } from "lucide-react";
import type { WealthRM } from "@/types/wealthos";

interface RMCardProps {
  rm: WealthRM;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function RMCard({ rm, isSelected, onClick, className }: RMCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn("rounded-[14px] cursor-pointer transition-all", className)}
      style={{
        border: isSelected ? "1px solid var(--qc-border-active)" : "1px solid var(--qc-border-default)",
        background: "var(--qc-surface-card)",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--qc-text-heading)" }}>{rm.name}</p>
          {rm.team && (
            <p style={{ fontSize: 11, color: "var(--qc-text-muted)", marginTop: 2 }}>{rm.team}</p>
          )}
        </div>
        {rm.email && (
          <span
            className="truncate max-w-[120px]"
            style={{ fontSize: 10, color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
          >
            {rm.email}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4" style={{ fontSize: 12, color: "var(--qc-text-muted)" }}>
        <span className="flex items-center gap-1">
          <Users className="size-3" style={{ color: "var(--qc-text-muted)" }} />
          <span style={{ fontWeight: 600, color: "var(--qc-text-heading)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            {rm._count?.clients ?? 0}
          </span>{" "}
          clients
        </span>
        {rm.performance_score !== undefined && (
          <span className="flex items-center gap-1">
            <TrendingUp className="size-3" style={{ color: "var(--qc-text-muted)" }} />
            Score{" "}
            <span style={{ fontWeight: 600, color: "var(--qc-text-heading)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
              {rm.performance_score.toFixed(1)}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
