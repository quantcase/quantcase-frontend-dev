import { AlertCircle, Clock, CheckCircle2, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type PriorityUrgency = "urgent" | "upcoming" | "stable";

export interface ClientPriority {
  id: string;
  client: string;
  note: string;
  urgency: PriorityUrgency;
}

const URGENCY_CONFIG: Record<PriorityUrgency, {
  borderClass: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
}> = {
  urgent: {
    borderClass: "border-l-red-500",
    icon: AlertCircle,
    iconClass: "text-red-500",
    badgeBg: "#FEF3F2",
    badgeText: "#dc2626",
    badgeLabel: "Urgent",
  },
  upcoming: {
    borderClass: "border-l-amber-400",
    icon: Clock,
    iconClass: "text-amber-500",
    badgeBg: "#FFFBEB",
    badgeText: "#d97706",
    badgeLabel: "Upcoming",
  },
  stable: {
    borderClass: "border-l-emerald-500",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    badgeBg: "#F0FDF4",
    badgeText: "#059669",
    badgeLabel: "Stable",
  },
};

interface TodaysPrioritiesProps {
  items: ClientPriority[];
  summary: { needs_attention: number; upcoming: number; stable: number };
  className?: string;
}

export function TodaysPriorities({ items, summary, className }: TodaysPrioritiesProps) {
  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 flex flex-col", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            Today&apos;s Priorities
          </span>
        </div>
        {/* Summary chips */}
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium"
            style={{ background: "#FEF3F2", color: "#dc2626", border: "1px solid #fecaca" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
            {summary.needs_attention} urgent
          </span>
          <span
            className="flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium"
            style={{ background: "#FFFBEB", color: "#d97706", border: "1px solid #fde68a" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            {summary.upcoming} upcoming
          </span>
          <span
            className="flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium"
            style={{ background: "#F0FDF4", color: "#059669", border: "1px solid #bbf7d0" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {summary.stable} stable
          </span>
        </div>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] flex flex-col divide-y divide-[#E2E2E2] overflow-hidden">
        {items.map((item) => {
          const config = URGENCY_CONFIG[item.urgency];
          const Icon = config.icon;
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-4 pl-0 pr-4 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors group border-l-[3px]",
                config.borderClass
              )}
            >
              {/* Icon */}
              <div className="pl-4 flex-shrink-0">
                <Icon className={cn("size-4", config.iconClass)} />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: "#0F172B" }}>{item.client}</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#888888" }}>{item.note}</p>
              </div>
              {/* Badge */}
              <span
                className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5"
                style={{ background: config.badgeBg, color: config.badgeText, border: `1px solid ${config.badgeText}22` }}
              >
                {config.badgeLabel}
              </span>
              <ChevronRight className="size-3.5 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" style={{ color: "#0F172B" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
