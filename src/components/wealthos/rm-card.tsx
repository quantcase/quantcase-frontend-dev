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
        border: isSelected ? "1px solid var(--qc-ink)" : "1px solid var(--qc-hair)",
        background: "var(--qc-card)",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--qc-ink)" }}>{rm.name}</p>
          {rm.team && (
            <p style={{ fontSize: 11, color: "var(--qc-ink-2)", marginTop: 2 }}>{rm.team}</p>
          )}
        </div>
        {rm.email && (
          <span
            className="truncate max-w-[120px]"
            style={{ fontSize: 10, color: "var(--qc-ink-2)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
          >
            {rm.email}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4" style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>
        <span className="flex items-center gap-1">
          <Users className="size-3" style={{ color: "var(--qc-ink-2)" }} />
          <span style={{ fontWeight: 600, color: "var(--qc-ink)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            {rm._count?.clients ?? 0}
          </span>{" "}
          clients
        </span>
        {rm.performance_score !== undefined && (
          <span className="flex items-center gap-1">
            <TrendingUp className="size-3" style={{ color: "var(--qc-ink-2)" }} />
            Score{" "}
            <span style={{ fontWeight: 600, color: "var(--qc-ink)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
              {rm.performance_score.toFixed(1)}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
