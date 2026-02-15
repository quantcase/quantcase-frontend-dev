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
    <Card className="bg-white dark:bg-zinc-900">
      <CardHeader className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left Section: Company Info */}
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <FileText className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                <DataValue value={company.name} />
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {company.exchange}: <DataValue value={company.ticker} className="font-medium" />
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                <DataValue value={company.industry} />
              </p>
            </div>
          </div>

          {/* Right Section: Actions and Metadata */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onFullLLMClick}
              className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <FileText className="h-4 w-4 mr-1" />
              FULL IM
            </Button>
            <Badge
              variant={getConfidenceVariant(company.confidenceLevel)}
              className="h-fit px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0"
            >
              ✓ {company.confidenceLevel} CONFIDENCE
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-500">
              <Calendar className="h-4 w-4" />
              <DataValue value={company.callDate ? formatDate(company.callDate) : null} />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
