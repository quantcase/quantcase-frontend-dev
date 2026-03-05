import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Target, AlertCircle, TrendingUp, ArrowUpRight } from "lucide-react";
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
    <div className="space-y-4">
        {/* Table */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-0">
                {columns.map((col) => (
                  <TableHead key={col.key} className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 py-2.5">
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
                    row.is_current
                      ? "bg-blue-50 dark:bg-blue-900/10 border-zinc-100 dark:border-zinc-800"
                      : row.is_average
                      ? "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800 font-semibold"
                      : "border-zinc-100 dark:border-zinc-800"
                  }
                >
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2">
                      {row.is_current && <div className="w-0.5 h-4 bg-blue-500 rounded-full -ml-px shrink-0" />}
                      <span className={`text-xs font-semibold ${row.is_current ? "text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-200"}`}>
                        {row.company}
                      </span>
                      {row.is_current && (
                        <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[9px] font-semibold px-1.5 py-0.5 uppercase tracking-wide">
                          CURRENT
                        </span>
                      )}
                      {row.is_average && <span className="text-[10px] text-zinc-400 font-normal italic">(avg)</span>}
                    </div>
                  </TableCell>
                  <TableCell className={`text-xs py-2.5 ${row.is_current ? "text-blue-700 dark:text-blue-300 font-semibold" : "text-zinc-600 dark:text-zinc-400"}`}>{row.revenue}</TableCell>
                  <TableCell className="text-xs py-2.5">
                    <span className={`flex items-center gap-0.5 ${row.revenue_growth ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-zinc-600 dark:text-zinc-400"}`}>
                      {row.revenue_growth && <ArrowUpRight className="h-3 w-3 shrink-0" />}
                      {row.revenue_growth}
                    </span>
                  </TableCell>
                  <TableCell className={`text-xs py-2.5 font-semibold ${row.is_current ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-300"}`}>{row.opm}</TableCell>
                  <TableCell className={`text-xs py-2.5 font-semibold ${row.is_current ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-300"}`}>{row.roce}</TableCell>
                  <TableCell className={`text-xs py-2.5 font-semibold ${row.is_current ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-300"}`}>{row.market_share}</TableCell>
                  <TableCell className={`text-xs py-2.5 ${row.is_current ? "text-blue-700 dark:text-blue-300 font-semibold" : "text-zinc-600 dark:text-zinc-400"}`}>{row.debt_equity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Competitive Positioning Insights */}
        <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4 space-y-4">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Competitive Positioning Insights</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Strengths</p>
              </div>
              <div className="space-y-1.5">
                {(positioning?.strengths ?? []).map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Areas to Monitor</p>
              </div>
              <div className="space-y-1.5">
                {(positioning?.areas_to_monitor ?? []).map((a, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Opportunities</p>
              </div>
              <div className="space-y-1.5">
                {(positioning?.opportunities ?? []).map((o, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{o}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Competition Takeaway footer */}
        <div className="border-t border-emerald-100 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 -mx-6 px-6 py-3 rounded-b-lg">
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">COMPETITION TAKEAWAY: </span>
            {takeaway}
          </p>
        </div>
    </div>
  );
}
