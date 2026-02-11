import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatLabel } from "@/lib/utils";
import type { TrustScore } from "@/types/management";

interface TrustPanelProps {
  trust: TrustScore;
}

export function TrustPanel({ trust }: TrustPanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <span className="text-green-600 dark:text-green-400 text-xl">🛡</span>
          </div>
          <CardTitle>MANAGEMENT QUALITY SUMMARY</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Overall Trust Level</p>
          <p className="text-4xl font-bold">{trust.overall}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>LOW</span>
            <div className="flex-1 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded" />
            <span>MODERATE</span>
            <div className="flex-1 h-1 bg-gradient-to-r from-yellow-500 to-green-500 rounded" />
            <span>HIGH</span>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(trust.subfactors).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatLabel(key)}</span>
                <span className="font-medium flex items-center gap-1">
                  <span className="text-green-600 dark:text-green-400">▮▮▮▮</span>
                  {value > 75 && <span className="text-muted-foreground">▯</span>}
                </span>
              </div>
              <Progress value={value} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
