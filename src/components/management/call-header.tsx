import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getConfidenceVariant } from "@/lib/utils";
import type { CompanyInfo } from "@/types/management";

interface CallHeaderProps {
  company: CompanyInfo;
  onFullLLMClick?: () => void;
}

export function CallHeader({ company, onFullLLMClick }: CallHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">{company.name}</CardTitle>
            <CardDescription>
              {company.exchange}: {company.ticker} • {company.industry}
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              {formatDate(company.callDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-blue-600">
              📄 FULL LLM
            </Button>
            <Badge variant={getConfidenceVariant(company.confidenceLevel)} className="h-fit">
              ✓ {company.confidenceLevel} CONFIDENCE
            </Badge>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
