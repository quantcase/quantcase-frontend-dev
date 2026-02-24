import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type NarrativeSentiment = "neutral" | "caution" | "positive" | "negative";

export interface NarrativeShift {
  id: string;
  category: string;
  sentiment: NarrativeSentiment;
  description: string;
}

const SENTIMENT_CONFIG: Record<NarrativeSentiment, { label: string; className: string }> = {
  neutral: {
    label: "NEUTRAL",
    className: "bg-zinc-100 text-zinc-500 border-zinc-200",
  },
  caution: {
    label: "CAUTION",
    className: "bg-transparent text-amber-600 border-transparent",
  },
  positive: {
    label: "POSITIVE",
    className: "bg-transparent text-emerald-600 border-transparent",
  },
  negative: {
    label: "NEGATIVE",
    className: "bg-transparent text-red-600 border-transparent",
  },
};

interface MarketNarrativeShiftsProps {
  shifts: NarrativeShift[];
  className?: string;
}

export function MarketNarrativeShifts({ shifts, className }: MarketNarrativeShiftsProps) {
  return (
    <Card className={cn("px-6 py-5 gap-0 h-full", className)}>
      <CardHeader className="px-0 pb-4">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Market Narrative Shifts
        </span>
      </CardHeader>
      <CardContent className="px-0 flex flex-col divide-y divide-border">
        {shifts.map((shift) => {
          const config = SENTIMENT_CONFIG[shift.sentiment];
          return (
            <div key={shift.id} className="py-4">
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold tracking-widest rounded-sm px-1.5 py-0 bg-zinc-100 text-zinc-500 border-zinc-200"
                >
                  {shift.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] font-bold tracking-widest rounded-sm px-1.5 py-0", config.className)}
                >
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed">{shift.description}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
