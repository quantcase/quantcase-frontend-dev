import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Target, AlertCircle, TrendingUp } from "lucide-react";
import type { CompetitionSection } from "@/types/opportunity";

interface CompetitiveBenchmarkingProps {
  data?: CompetitionSection;
}

const peers = [
  { company: "Reliance Industries", revenue: "54,230", revenue_growth: "24.2%", opm: "26.8%", roce: "18.4%", market_share: "22.6%", debt_equity: "0.42" },
  { company: "Adani Enterprises", revenue: "44,480", revenue_growth: "21.5%", opm: "24.8%", roce: "16.2%", market_share: "18.5%", debt_equity: "0.68", is_current: true },
  { company: "Tata Steel", revenue: "32,890", revenue_growth: "18.3%", opm: "22.1%", roce: "14.6%", market_share: "13.7%", debt_equity: "0.52" },
  { company: "Larsen & Toubro", revenue: "28,560", revenue_growth: "19.7%", opm: "23.4%", roce: "15.8%", market_share: "11.9%", debt_equity: "0.38" },
  { company: "JSW Steel", revenue: "22,340", revenue_growth: "16.8%", opm: "21.2%", roce: "13.4%", market_share: "9.3%", debt_equity: "0.61" },
  { company: "Industry Average", revenue: "36,500", revenue_growth: "20.1%", opm: "23.7%", roce: "15.7%", market_share: "15.2%", debt_equity: "0.52", is_average: true },
];

const columns = [
  { key: "company", label: "Company" },
  { key: "revenue", label: "Revenue (₹Cr)" },
  { key: "revenue_growth", label: "Revenue Growth" },
  { key: "opm", label: "OPM %" },
  { key: "roce", label: "ROCE %" },
  { key: "market_share", label: "Market Share" },
  { key: "debt_equity", label: "Debt/Equity" },
] as const;

export function CompetitiveBenchmarking({ data }: CompetitiveBenchmarkingProps) {
  const positioning = data?.text?.competitive_positioning;
  const takeaway = data?.text?.takeaway ?? 'N/A';

  return (
    <div className="space-y-5">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-100 dark:border-zinc-800">
              {columns.map((col) => (
                <TableHead key={col.key} className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {peers.map((row) => (
              <TableRow
                key={row.company}
                className={
                  row.is_current ? "bg-blue-50 dark:bg-blue-900/10 border-zinc-100 dark:border-zinc-800"
                  : row.is_average ? "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800"
                  : "border-zinc-100 dark:border-zinc-800"
                }
              >
                <TableCell className="font-medium text-xs text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    {row.company}
                    {row.is_current && <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[9px] font-semibold border-0 px-1.5 py-0">Current</Badge>}
                    {row.is_average && <span className="text-[10px] text-zinc-400 italic">(avg)</span>}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">{row.revenue}</TableCell>
                <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">{row.revenue_growth}</TableCell>
                <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">{row.opm}</TableCell>
                <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">{row.roce}</TableCell>
                <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">{row.market_share}</TableCell>
                <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">{row.debt_equity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Competitive Positioning Insights</span>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Target className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Strengths</p>
              </div>
              <div className="space-y-1">
                {(positioning?.strengths ?? []).map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{s}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <AlertCircle className="h-2.5 w-2.5 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Areas to Monitor</p>
              </div>
              <div className="space-y-1">
                {(positioning?.areas_to_monitor ?? []).map((a, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{a}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <TrendingUp className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Opportunities</p>
              </div>
              <div className="space-y-1">
                {(positioning?.opportunities ?? []).map((o, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{o}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-semibold uppercase">
              Competition Takeaway
            </Badge>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{takeaway}</p>
          </div>
        </div>
    </div>
  );
}
