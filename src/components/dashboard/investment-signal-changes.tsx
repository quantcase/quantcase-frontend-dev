import { TrendingUp, AlertTriangle, Target, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  badgeClass: string;
  iconClass: string;
  Icon: React.ComponentType<{ className?: string }>;
  bgClass: string;
}

const SIGNAL_CONFIG: Record<SignalType, SignalConfig> = {
  thesis_strengthening: {
    label: "THESIS STRENGTHENING",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
    Icon: TrendingUp,
  },
  assumption_risk: {
    label: "ASSUMPTION RISK",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50",
    Icon: AlertTriangle,
  },
  valuation_trigger: {
    label: "VALUATION TRIGGER",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconClass: "text-indigo-500",
    bgClass: "bg-indigo-50",
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
    <Card className={cn("px-6 py-5 gap-0", className)}>
      <CardHeader className="px-0 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-indigo-500" />
            <span className="font-semibold text-base">Investment Signal Changes</span>
          </div>
          <span className="text-sm text-muted-foreground">{timeLabel}</span>
        </div>
      </CardHeader>
      <CardContent className="px-0 flex flex-col divide-y divide-border">
        {signals.map((signal) => {
          const config = SIGNAL_CONFIG[signal.signalType];
          const { Icon } = config;
          return (
            <div key={signal.id} className="py-4 flex items-start gap-3">
              <div className={cn("size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", config.bgClass)}>
                <Icon className={cn("size-4", config.iconClass)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm">{signal.company}</span>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] font-semibold tracking-wide rounded-sm px-1.5 py-0", config.badgeClass)}
                  >
                    {config.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{signal.description}</p>
              </div>
              {signal.reviewHref && (
                <Link
                  href={signal.reviewHref}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium shrink-0 mt-0.5"
                >
                  Review <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
