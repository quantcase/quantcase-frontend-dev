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
  bg: string;
  text: string;
  borderStyle: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}> = {
  on_track: {
    label: "ON TRACK",
    bg: "var(--qc-up-soft)",
    text: "var(--qc-up)",
    borderStyle: "3px solid var(--qc-up)",
    Icon: CheckCircle2,
  },
  pressured: {
    label: "PRESSURED",
    bg: "var(--qc-warn-soft)",
    text: "var(--qc-warn)",
    borderStyle: "3px solid var(--qc-warn)",
    Icon: AlertTriangle,
  },
  at_risk: {
    label: "AT RISK",
    bg: "var(--qc-down-soft)",
    text: "var(--qc-down)",
    borderStyle: "3px solid var(--qc-down)",
    Icon: XCircle,
  },
  watch: {
    label: "WATCH",
    bg: "var(--qc-chip-bg)",
    text: "var(--qc-text-muted)",
    borderStyle: "3px solid var(--qc-border-default)",
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
    <div
      className={cn("rounded-[10px] p-2 h-full flex flex-col", className)}
      style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
    >
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="size-3.5" style={{ color: "var(--qc-text-muted)" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-text-heading)", textTransform: "uppercase", letterSpacing: "0.01em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            Framework Integrity Monitor
          </span>
        </div>
        {/* Mini summary pills */}
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-semibold rounded-sm px-1.5 py-0.5"
            style={{ background: "var(--qc-up-soft)", color: "var(--qc-up)", border: "1px solid var(--qc-up)" }}
          >
            {onTrack} OK
          </span>
          {watch > 0 && (
            <span
              className="text-[10px] font-semibold rounded-sm px-1.5 py-0.5"
              style={{ background: "var(--qc-warn-soft)", color: "var(--qc-warn)", border: "1px solid var(--qc-warn)" }}
            >
              {watch} Watch
            </span>
          )}
          {atRisk > 0 && (
            <span
              className="text-[10px] font-semibold rounded-sm px-1.5 py-0.5"
              style={{ background: "var(--qc-down-soft)", color: "var(--qc-down)", border: "1px solid var(--qc-down)" }}
            >
              {atRisk} Risk
            </span>
          )}
        </div>
      </div>

      {/* Inner white box */}
      <div
        className="rounded-[10px] flex-1 flex flex-col divide-y overflow-hidden"
        style={{ background: "var(--qc-surface-card)", border: "1px solid var(--qc-border-inner)" }}
      >
        {items.map((item) => {
          const config = STATUS_CONFIG[item.status];
          const { Icon } = config;
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 pl-0 pr-4 py-3 cursor-pointer transition-colors group hover:bg-[var(--qc-surface-hover)]"
              style={{ borderLeft: config.borderStyle, borderTopColor: "var(--qc-border-inner)" }}
            >
              {/* Icon box */}
              <div className="pl-4 flex-shrink-0">
                <div
                  className="p-1.5 rounded-[6px] flex items-center justify-center"
                  style={{
                    background: config.bg,
                    border: `1px solid ${config.text}33`,
                  }}
                >
                  <Icon className="size-3.5" style={{ color: config.text }} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: "var(--qc-text-heading)" }}>{item.title}</p>
                <p className="text-[11px] leading-snug mt-0.5" style={{ color: "var(--qc-text-body)" }}>{item.description}</p>
              </div>

              {/* Status badge */}
              <span
                className="text-[9px] font-semibold uppercase tracking-wider rounded-sm px-2 py-0.5 flex-shrink-0"
                style={{ background: config.bg, color: config.text, border: `1px solid ${config.text}33`, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
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
