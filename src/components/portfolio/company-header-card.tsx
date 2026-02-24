import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyHeaderCardProps {
  company: string;
  ticker?: string;
  date: string;
  dataConfidence?: "High" | "Medium" | "Low";
  badgeLabel?: string;
  onBadgeClick?: () => void;
  className?: string;
}

const confidenceColors = {
  High: "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  Medium: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Low: "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
};

export function CompanyHeaderCard({
  company,
  date,
  dataConfidence = "High",
  badgeLabel = "FULL IM",
  onBadgeClick,
  className,
}: CompanyHeaderCardProps) {
  return (
    <Card className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800", className)}>
      <CardHeader className="py-4">
        <div className="flex items-center gap-4">
          {/* Company icon */}
          <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
          </div>

          {/* Company info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate">{company}</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={onBadgeClick}
                className="h-6 px-2 text-xs font-semibold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                {badgeLabel}
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <Calendar className="h-3.5 w-3.5" />
                {date}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "h-5 px-2 text-[11px] font-semibold border bg-transparent",
                  confidenceColors[dataConfidence]
                )}
              >
                <ShieldCheck className="h-3 w-3 mr-1" />
                Data Confidence: {dataConfidence}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
