import { TrendingUp, AlertTriangle, Target, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type SignalType = "thesis_strengthening" | "assumption_risk" | "valuation_trigger";

export interface InvestmentSignal {
  id: string;
  company: string;
  signalType: SignalType;
  description: string;
  reviewHref?: string;
}

interface SignalConfig {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  avatarBg: string;
  avatarText: string;
}

const SIGNAL_CONFIG: Record<SignalType, SignalConfig> = {
  thesis_strengthening: {
    label: "THESIS STRENGTHENING",
    iconClass: "text-emerald-600",
    Icon: TrendingUp,
    badgeBg: "#F0FDF4",
    badgeText: "#059669",
    borderClass: "border-l-emerald-500",
    avatarBg: "#F0FDF4",
    avatarText: "#059669",
  },
  assumption_risk: {
    label: "ASSUMPTION RISK",
    iconClass: "text-amber-600",
    Icon: AlertTriangle,
    badgeBg: "#FFFBEB",
    badgeText: "#d97706",
    borderClass: "border-l-amber-400",
    avatarBg: "#FFFBEB",
    avatarText: "#d97706",
  },
  valuation_trigger: {
    label: "VALUATION TRIGGER",
    iconClass: "text-zinc-500",
    Icon: Target,
    badgeBg: "#F5F5F5",
    badgeText: "#888888",
    borderClass: "border-l-zinc-300",
    avatarBg: "#F5F5F5",
    avatarText: "#888888",
  },
};

interface InvestmentSignalChangesProps {
  signals: InvestmentSignal[];
  timeLabel?: string;
  className?: string;
}

export function InvestmentSignalChanges({
  signals,
  timeLabel = "Past 24 Hours",
  className,
}: InvestmentSignalChangesProps) {
  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            Investment Signal Changes
          </span>
        </div>
        <span
          className="text-[10px] font-medium rounded-sm px-2 py-0.5"
          style={{ background: "#F5F5F5", color: "#888888", border: "1px solid #E2E2E2" }}
        >
          {timeLabel}
        </span>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] overflow-hidden divide-y divide-[#E2E2E2]">
        {signals.map((signal) => {
          const config = SIGNAL_CONFIG[signal.signalType];
          const { Icon } = config;
          const initials = signal.company
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={signal.id}
              className={cn(
                "flex items-center gap-4 pl-0 pr-4 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors group border-l-[3px]",
                config.borderClass
              )}
            >
              {/* Avatar */}
              <div className="pl-4 flex-shrink-0">
                <div
                  className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: config.avatarBg,
                    color: config.avatarText,
                    border: `1px solid ${config.avatarText}33`,
                  }}
                >
                  {initials}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Line 1: company + signal type badge */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[13px] font-semibold" style={{ color: "#0F172B" }}>{signal.company}</span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5 flex-shrink-0"
                    style={{ background: config.badgeBg, color: config.badgeText, border: `1px solid ${config.badgeText}33` }}
                  >
                    {config.label}
                  </span>
                </div>
                {/* Line 2: description */}
                <p className="text-[12px] leading-snug line-clamp-2" style={{ color: "#888888" }}>
                  {signal.description}
                </p>
              </div>

              {/* Right: icon box + CTA */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <div
                  style={{
                    padding: 6,
                    borderRadius: 6,
                    border: "1px solid rgba(18,18,18,0.10)",
                    background: "rgba(18,18,18,0.03)",
                  }}
                >
                  <Icon className={cn("size-3.5", config.iconClass)} />
                </div>

                {signal.reviewHref ? (
                  <Link
                    href={signal.reviewHref}
                    className="flex items-center gap-1 text-[11px] font-semibold rounded-md px-2 py-0.5 border border-[#E2E2E2] bg-white hover:bg-[#F5F5F5] transition-colors"
                    style={{ color: "#0F172B" }}
                  >
                    Review <ArrowRight className="size-3" />
                  </Link>
                ) : (
                  <ChevronRight className="size-3.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "#0F172B" }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
