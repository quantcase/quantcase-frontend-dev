import { Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ConvictionLevel = "positive" | "neutral" | "watch" | "review";

export interface OpportunityItem {
  id: string;
  company: string;
  ticker: string;
  conviction: ConvictionLevel;
  valuationZone: string;
  nextCatalyst: string;
}

const CONVICTION_CONFIG: Record<ConvictionLevel, { label: string; className: string }> = {
  positive: {
    label: "Positive",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  neutral: {
    label: "Neutral",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  watch: {
    label: "Watch",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  review: {
    label: "Review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

interface OpportunityRadarProps {
  items: OpportunityItem[];
  className?: string;
}

export function OpportunityRadar({ items, className }: OpportunityRadarProps) {
  return (
    <Card className={cn("px-6 py-5 gap-0", className)}>
      <CardHeader className="px-0 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Opportunity Radar
            </span>
          </div>
          <span className="text-sm text-muted-foreground">Sorted by Conviction</span>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.2fr_1.5fr_1.5fr] gap-4 pb-2 border-b border-border">
          {["Asset", "Conviction", "Valuation Zone", "Next Catalyst"].map((col) => (
            <span key={col} className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
              {col}
            </span>
          ))}
        </div>
        {/* Table rows */}
        <div className="flex flex-col divide-y divide-border">
          {items.map((item) => {
            const config = CONVICTION_CONFIG[item.conviction];
            return (
              <div key={item.id} className="grid grid-cols-[2fr_1.2fr_1.5fr_1.5fr] gap-4 py-4 items-center">
                <div>
                  <div className="font-bold text-sm">{item.company}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 tracking-wide">{item.ticker}</div>
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-medium rounded-md px-2.5 py-0.5", config.className)}
                  >
                    {config.label}
                  </Badge>
                </div>
                <div className="text-sm">{item.valuationZone}</div>
                <div className="text-sm text-muted-foreground">{item.nextCatalyst}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
