import { cn } from "@/lib/utils";

interface StatCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  sublabel?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  /** When true, omits the outer panel wrapper so cards can be grouped inside a shared container */
  flat?: boolean;
}

export function StatCard({ value, label, icon, sublabel, trend, className, flat }: StatCardProps) {
  const trendColor =
    trend === "up" ? "var(--qc-up)" :
    trend === "down" ? "var(--qc-down)" :
    "var(--qc-ink-2)";

  const inner = (
    <div
      className="rounded-[10px] px-4 py-4 flex flex-col gap-3 h-full"
      style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)" }}
    >
      {/* Icon + optional trend indicator on same row */}
      <div className="flex items-center justify-between">
        <div
          style={{
            padding: 6,
            borderRadius: 6,
            border: "1px solid var(--qc-hair)",
            background: "var(--qc-chip)",
          }}
        >
          {icon}
        </div>
        {sublabel && (
          <span
            className="text-[10px] font-medium rounded-sm px-1.5 py-0.5"
            style={{
              background: "var(--qc-chip)",
              color: trend ? trendColor : "var(--qc-ink-2)",
              border: "1px solid var(--qc-hair)",
            }}
          >
            {sublabel}
          </span>
        )}
      </div>

      {/* Value */}
      <div style={{ fontSize: 32, fontWeight: 500, color: "var(--qc-ink)", lineHeight: 1, letterSpacing: "-0.02em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
        {value}
      </div>

      {/* Label */}
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
    </div>
  );

  if (flat) return inner;

  return (
    <div
      className={cn("rounded-[10px] p-2", className)}
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
    >
      {inner}
    </div>
  );
}
