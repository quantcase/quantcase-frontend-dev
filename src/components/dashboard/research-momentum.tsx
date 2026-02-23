import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ResearchMetric {
  id: string;
  label: string;
  value: number | string;
  sublabel: string;
}

interface ResearchMomentumProps {
  metrics: ResearchMetric[];
  className?: string;
}

export function ResearchMomentum({ metrics, className }: ResearchMomentumProps) {
  return (
    <Card className={cn("px-6 py-5 gap-0 h-full", className)}>
      <CardHeader className="px-0 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-muted-foreground" />
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Research Momentum
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-0 flex flex-col gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3"
          >
            <span className="text-sm font-semibold">{metric.label}</span>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold leading-none">{metric.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{metric.sublabel}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
