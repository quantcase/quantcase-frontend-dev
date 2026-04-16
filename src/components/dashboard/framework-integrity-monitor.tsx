import { Layers, CheckCircle2, AlertTriangle, XCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export type FrameworkStatus = "on_track" | "pressured" | "at_risk" | "watch";

export interface FrameworkItem {
  id: string;
  title: string;
  description: string;
  status: FrameworkStatus;
}

const STATUS_CONFIG: Record<FrameworkStatus, {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  iconBg: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}> = {
  on_track: {
    label: "ON TRACK",
    badgeBg: "#F0FDF4",
    badgeText: "#059669",
    borderClass: "border-l-emerald-500",
    iconBg: "#F0FDF4",
    Icon: CheckCircle2,
  },
  pressured: {
    label: "PRESSURED",
    badgeBg: "#FFFBEB",
    badgeText: "#d97706",
    borderClass: "border-l-amber-400",
    iconBg: "#FFFBEB",
    Icon: AlertTriangle,
  },
  at_risk: {
    label: "AT RISK",
    badgeBg: "#FEF3F2",
    badgeText: "#dc2626",
    borderClass: "border-l-red-500",
    iconBg: "#FEF3F2",
    Icon: XCircle,
  },
  watch: {
    label: "WATCH",
    badgeBg: "#F5F5F5",
    badgeText: "#888888",
    borderClass: "border-l-zinc-300",
    iconBg: "#F5F5F5",
    Icon: Eye,
  },
};

interface FrameworkIntegrityMonitorProps {
  items: FrameworkItem[];
  className?: string;
}

export function FrameworkIntegrityMonitor({ items, className }: FrameworkIntegrityMonitorProps) {
  const onTrack  = items.filter((i) => i.status === "on_track").length;
  const atRisk   = items.filter((i) => i.status === "at_risk").length;
  const watch    = items.filter((i) => i.status === "watch" || i.status === "pressured").length;

  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 h-full flex flex-col", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            Framework Integrity Monitor
          </span>
        </div>
        {/* Mini summary pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold rounded-sm px-1.5 py-0.5" style={{ background: "#F0FDF4", color: "#059669", border: "1px solid #bbf7d0" }}>
            {onTrack} OK
          </span>
          {watch > 0 && (
            <span className="text-[10px] font-semibold rounded-sm px-1.5 py-0.5" style={{ background: "#FFFBEB", color: "#d97706", border: "1px solid #fde68a" }}>
              {watch} Watch
            </span>
          )}
          {atRisk > 0 && (
            <span className="text-[10px] font-semibold rounded-sm px-1.5 py-0.5" style={{ background: "#FEF3F2", color: "#dc2626", border: "1px solid #fecaca" }}>
              {atRisk} Risk
            </span>
          )}
        </div>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] flex-1 flex flex-col divide-y divide-[#E2E2E2] overflow-hidden">
        {items.map((item) => {
          const config = STATUS_CONFIG[item.status];
          const { Icon } = config;
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-4 pl-0 pr-4 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors group border-l-[3px]",
                config.borderClass
              )}
            >
              {/* Icon box */}
              <div className="pl-4 flex-shrink-0">
                <div
                  className="p-1.5 rounded-[6px] flex items-center justify-center"
                  style={{
                    background: config.iconBg,
                    border: `1px solid ${config.badgeText}33`,
                  }}
                >
                  <Icon className="size-3.5" style={{ color: config.badgeText }} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: "#0F172B" }}>{item.title}</p>
                <p className="text-[11px] leading-snug mt-0.5" style={{ color: "#888888" }}>{item.description}</p>
              </div>

              {/* Status badge */}
              <span
                className="text-[9px] font-semibold uppercase tracking-wider rounded-sm px-2 py-0.5 flex-shrink-0"
                style={{ background: config.badgeBg, color: config.badgeText, border: `1px solid ${config.badgeText}33` }}
              >
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
