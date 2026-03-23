import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getConfidenceVariant } from "@/lib/utils";
import { DataValue } from "@/components/molecules/data-value";
import type { CompanyInfo } from "@/types/management";
import { FileText, Calendar } from "lucide-react";

interface CallHeaderProps {
  company: CompanyInfo;
  score?: number;
  callId?: string;
  callDate?: string;
  onFullLLMClick?: () => void;
}

export function CallHeader({ company, score, callId, callDate, onFullLLMClick }: CallHeaderProps) {
  const resolvedDate = callDate ?? company.callDate;
  const ticker = company.ticker ?? company.name?.split("_")[0] ?? null;
  const displayName = company.company_name ?? company.name ?? null;
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
              <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                <DataValue value={displayName} />
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">{company.exchange}: <DataValue value={ticker} /></span>
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
              className="font-semibold"
            >
              <FileText className="h-4 w-4 mr-1.5" />
              FULL IM
            </Button>
            {score != null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Score</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{score}</span>
              </div>
            )}
            <Badge
              variant={getConfidenceVariant(company.confidenceLevel)}
              className="h-fit px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border-0"
            >
              ✓ {company.confidenceLevel.toUpperCase()} CONFIDENCE
            </Badge>
            {callId && (
              <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                #{callId.slice(0, 8)}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              <Calendar className="h-4 w-4" />
              <DataValue value={resolvedDate ? formatDate(resolvedDate) : null} />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
