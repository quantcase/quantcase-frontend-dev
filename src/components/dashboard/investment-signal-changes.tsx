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
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconCssColor: string;
  bg: string;
  text: string;
  borderStyle: string;
}

const SIGNAL_CONFIG: Record<SignalType, SignalConfig> = {
  thesis_strengthening: {
    label: "THESIS STRENGTHENING",
    Icon: TrendingUp,
    iconCssColor: "var(--qc-up)",
    bg: "var(--qc-up-soft)",
    text: "var(--qc-up)",
    borderStyle: "3px solid var(--qc-up)",
  },
  assumption_risk: {
    label: "ASSUMPTION RISK",
    Icon: AlertTriangle,
    iconCssColor: "var(--qc-warn)",
    bg: "var(--qc-warn-soft)",
    text: "var(--qc-warn)",
    borderStyle: "3px solid var(--qc-warn)",
  },
  valuation_trigger: {
    label: "VALUATION TRIGGER",
    Icon: Target,
    iconCssColor: "var(--qc-ink-2)",
    bg: "var(--qc-chip)",
    text: "var(--qc-ink-2)",
    borderStyle: "3px solid var(--qc-hair)",
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
    <div
      className={cn("rounded-[10px] p-2", className)}
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
    >
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)", textTransform: "uppercase", letterSpacing: "0.01em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            Investment Signal Changes
          </span>
        </div>
        <span
          className="text-[10px] font-medium rounded-sm px-2 py-0.5"
          style={{ background: "var(--qc-chip)", color: "var(--qc-ink-2)", border: "1px solid var(--qc-hair)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
        >
          {timeLabel}
        </span>
      </div>

      {/* Inner white box */}
      <div
        className="rounded-[10px] overflow-hidden divide-y"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)", borderColor: "var(--qc-hair-2)" }}
      >
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
              className="flex items-center gap-4 pl-0 pr-4 py-3 cursor-pointer transition-colors group hover:bg-[var(--qc-section)]"
              style={{ borderLeft: config.borderStyle, borderTopColor: "var(--qc-hair-2)" }}
            >
              {/* Avatar */}
              <div className="pl-4 flex-shrink-0">
                <div
                  className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: config.bg,
                    color: config.text,
                    border: `1px solid ${config.text}33`,
                  }}
                >
                  {initials}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Line 1: company + signal type badge */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[13px] font-semibold" style={{ color: "var(--qc-ink)" }}>{signal.company}</span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5 flex-shrink-0"
                    style={{ background: config.bg, color: config.text, border: `1px solid ${config.text}33` }}
                  >
                    {config.label}
                  </span>
                </div>
                {/* Line 2: description */}
                <p className="text-[12px] leading-snug line-clamp-2" style={{ color: "var(--qc-ink)" }}>
                  {signal.description}
                </p>
              </div>

              {/* Right: icon box + CTA */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <div
                  style={{
                    padding: 6,
                    borderRadius: 6,
                    border: "1px solid var(--qc-hair)",
                    background: "var(--qc-chip)",
                  }}
                >
                  <Icon className="size-3.5" style={{ color: config.iconCssColor }} />
                </div>

                {signal.reviewHref ? (
                  <Link
                    href={signal.reviewHref}
                    className="flex items-center gap-1 text-[11px] font-semibold rounded-md px-2 py-0.5 transition-colors"
                    style={{ color: "var(--qc-ink)", border: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}
                  >
                    Review <ArrowRight className="size-3" />
                  </Link>
                ) : (
                  <ChevronRight className="size-3.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--qc-ink)" }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
