import { Layers } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FrameworkStatus = "on_track" | "pressured" | "at_risk" | "watch";

export interface FrameworkItem {
  id: string;
  title: string;
  description: string;
  status: FrameworkStatus;
}

const STATUS_CONFIG: Record<FrameworkStatus, { label: string; className: string }> = {
  on_track: {
    label: "ON TRACK",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pressured: {
    label: "PRESSURED",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  at_risk: {
    label: "AT RISK",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  watch: {
    label: "WATCH",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

interface FrameworkIntegrityMonitorProps {
  items: FrameworkItem[];
  className?: string;
}

export function FrameworkIntegrityMonitor({ items, className }: FrameworkIntegrityMonitorProps) {
  return (
    <Card className={cn("px-6 py-5 gap-0 h-full", className)}>
      <CardHeader className="px-0 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" />
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Framework Integrity Monitor
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-0 flex flex-col gap-5">
        {items.map((item) => {
          const config = STATUS_CONFIG[item.status];
          return (
            <div key={item.id} className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm mb-1">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] font-bold tracking-wider rounded-md px-3 py-1 shrink-0",
                  config.className
                )}
              >
                {config.label}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
