import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

const thesisPoints = [
  {
    title: "Structural Revenue Growth",
    description: "Revenue CMGR12 of 18.5% benchmarks in the top quartile.",
  },
  {
    title: "ROCE Inflection Point",
    description: "Commissioning of green hydrogen ecosystem to boost ROCE.",
  },
  {
    title: "Current Returns",
    description: "ROCE currently at 14-16% is above WACC but not elite.",
  },
];

export function KeyThesisCard() {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Key Thesis
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 text-zinc-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {thesisPoints.map((point, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{point.title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{point.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
