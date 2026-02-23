import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  { label: "CURRENT CAP UTIL", value: "24.8%", sub: "+4.2% YoY", subColor: "text-emerald-600 dark:text-emerald-400" },
  { label: "EXP CAPACITY ADD", value: "+5.0%", sub: "FY25 New Plant Live", subColor: "text-blue-600 dark:text-blue-400" },
  { label: "PROJ CAP UTIL '25", value: "+6.8%", sub: "Vs Current", subColor: "text-blue-600 dark:text-blue-400" },
  { label: "PRICING POWER", value: "Improving", sub: "Cost pass-through", subColor: "text-orange-500 dark:text-orange-400", valueColor: "text-orange-500 dark:text-orange-400" },
];

export function OperatingMetrics() {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Operating Metrics &amp; Trends
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">{m.label}</p>
              <p className={`text-2xl font-bold mb-0.5 ${m.valueColor ?? "text-zinc-900 dark:text-zinc-50"}`}>
                {m.value}
              </p>
              <p className={`text-[11px] font-medium ${m.subColor}`}>{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
