import { TrendingUp, AlertTriangle, Target, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  textClass: string;
}

const SIGNAL_CONFIG: Record<SignalType, SignalConfig> = {
  thesis_strengthening: {
    label: "THESIS STRENGTHENING",
    textClass: "text-emerald-600",
    Icon: TrendingUp,
  },
  assumption_risk: {
    label: "ASSUMPTION RISK",
    textClass: "text-amber-600",
    Icon: AlertTriangle,
  },
  valuation_trigger: {
    label: "VALUATION TRIGGER",
    textClass: "text-zinc-500",
    Icon: Target,
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
        <span style={{ fontSize: 11, color: "#888888" }}>{timeLabel}</span>
      </div>

      {/* Inner white box */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)]">
        {signals.map((signal, i) => {
          const config = SIGNAL_CONFIG[signal.signalType];
          const { Icon } = config;
          return (
            <div
              key={signal.id}
              className={cn(
                "flex items-start gap-3 px-4 py-4",
                i < signals.length - 1 && "border-b border-[#E2E2E2]"
              )}
            >
              {/* Icon */}
              <div
                style={{
                  padding: 4,
                  borderRadius: 6,
                  border: "1px solid rgba(18,18,18,0.10)",
                  background: "rgba(18,18,18,0.03)",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <Icon className={cn("size-4", config.textClass)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h5 style={{ color: "#0F172B" }}>{signal.company}</h5>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold tracking-wide rounded-sm px-1.5 py-0 border-0",
                      "bg-[#F5F5F5] text-[#90A1B9]"
                    )}
                  >
                    {config.label}
                  </Badge>
                </div>
                <p style={{ fontSize: 14, color: "#888888", lineHeight: 1.6 }}>{signal.description}</p>
              </div>

              {signal.reviewHref && (
                <Link
                  href={signal.reviewHref}
                  className="flex items-center gap-1 text-sm font-medium shrink-0 mt-0.5"
                  style={{ color: "#0F172B" }}
                >
                  Review <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
