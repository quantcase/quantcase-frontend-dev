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
    trend === "up" ? "#059669" :
    trend === "down" ? "#dc2626" :
    "#888888";

  const inner = (
    <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] px-4 py-4 flex flex-col gap-3 h-full">
      {/* Icon + optional trend indicator on same row */}
      <div className="flex items-center justify-between">
        <div
          style={{
            padding: 6,
            borderRadius: 6,
            border: "1px solid rgba(18,18,18,0.10)",
            background: "rgba(18,18,18,0.03)",
          }}
        >
          {icon}
        </div>
        {sublabel && (
          <span
            className="text-[10px] font-medium rounded-sm px-1.5 py-0.5"
            style={{
              background: "#F5F5F5",
              color: trend ? trendColor : "#888888",
              border: "1px solid #E2E2E2",
            }}
          >
            {sublabel}
          </span>
        )}
      </div>

      {/* Value */}
      <div style={{ fontSize: 32, fontWeight: 500, color: "#0F172B", lineHeight: 1, letterSpacing: "-0.02em" }}>
        {value}
      </div>

      {/* Label */}
      <div style={{ fontSize: 10, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
    </div>
  );

  if (flat) return inner;

  return (
    <div
      className={cn(
        "rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2",
        className
      )}
    >
      {inner}
    </div>
  );
}
