import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Pencil } from "lucide-react";

interface WhyThisPortfolioCardProps {
  points: string[];
}

export function WhyThisPortfolioCard({ points }: WhyThisPortfolioCardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            Why This Portfolio
          </CardTitle>
          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          {points.map((point, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{point}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
