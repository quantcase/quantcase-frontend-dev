import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getConfidenceVariant } from "@/lib/utils";
import { DataValue } from "@/components/molecules/data-value";
import type { CompanyInfo } from "@/types/management";
import { FileText, Calendar } from "lucide-react";

interface CallHeaderProps {
  company: CompanyInfo;
  onFullLLMClick?: () => void;
}

export function CallHeader({ company, onFullLLMClick }: CallHeaderProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          {/* Left Section: Company Info */}
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                <DataValue value={company.ticker} />
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">{company.exchange}: <DataValue value={company.name.split("_")[0]} /></span>
                {company.industry && (
                  <>
                    <span className="mx-2">•</span>
                    <DataValue value={company.industry.split(", ").slice(0, 5).join(" • ")} />
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Section: Actions and Metadata */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onFullLLMClick}
              className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold"
            >
              <FileText className="h-4 w-4 mr-1.5" />
              FULL IM
            </Button>
            <Badge
              variant={getConfidenceVariant(company.confidenceLevel)}
              className="h-fit px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0"
            >
              ✓ {company.confidenceLevel.toUpperCase()} CONFIDENCE
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              <Calendar className="h-4 w-4" />
              <DataValue value={company.callDate ? formatDate(company.callDate) : null} />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
