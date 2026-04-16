import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Target, ShieldAlert } from "lucide-react";

interface GrowthRisksProps {
  positiveTitle?: string;
  negativeTitle?: string;
  positiveItems: string[];
  negativeItems: string[];
}

export function GrowthRisks({
  positiveTitle = "Key Growth Drivers",
  negativeTitle = "Key Risks",
  positiveItems,
  negativeItems,
}: GrowthRisksProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{positiveTitle}</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {positiveItems.map((d, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{d}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <ShieldAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{negativeTitle}</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {negativeItems.map((r, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{r}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
