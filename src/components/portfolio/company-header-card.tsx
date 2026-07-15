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
  High: "text-up border-up-soft",
  Medium: "text-warn border-warn-soft",
  Low: "text-down border-down-soft",
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
    <Card className={cn("bg-card border border-hair", className)}>
      <CardHeader className="py-4">
        <div className="flex items-center gap-4">
          {/* Company icon */}
          <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            <Building2 className="h-6 w-6 text-ink-3" />
          </div>

          {/* Company info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-ink truncate">{company}</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={onBadgeClick}
                className="h-6 px-2 text-xs font-semibold text-blue border-blue-soft hover:bg-blue-soft"
              >
                {badgeLabel}
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-ink-3">
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
