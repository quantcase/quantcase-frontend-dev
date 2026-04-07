import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DataValue } from "@/components/molecules/data-value";
import { CheckCircle2, XCircle, Clock, DollarSign, Target } from "lucide-react";
import { getVarianceColor } from "@/lib/utils";
import type { GuidanceRecord, StatusType } from "@/types/management";

interface GuidanceTrackTableProps {
  records: GuidanceRecord[];
}

function getStatusConfig(status: StatusType) {
  switch (status) {
    case "ACHIEVED":
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />,
        textColor: "text-green-700 dark:text-green-400",
        borderColor: "border-l-4 border-l-green-600 dark:border-l-green-400",
      };
    case "MISSED":
      return {
        icon: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
        textColor: "text-red-700 dark:text-red-400",
        borderColor: "border-l-4 border-l-red-600 dark:border-l-red-400",
      };
    case "PENDING":
      return {
        icon: <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
        textColor: "text-blue-700 dark:text-blue-400",
        borderColor: "border-l-4 border-l-blue-600 dark:border-l-blue-400",
      };
    default:
      return {
        icon: null,
        textColor: "text-zinc-500 dark:text-zinc-400",
        borderColor: "",
      };
  }
}

export function GuidanceTrackTable({ records }: GuidanceTrackTableProps) {
  return (
    <div>
        {records.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 py-4">No guidance records available</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
                <col className="w-[15%]" />
              </colgroup>
              <TableHeader>
                <TableRow className="border-zinc-200 dark:border-zinc-800">
                  <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">GUIDANCE DATE</TableHead>
                  <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">METRIC</TableHead>
                  <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">ACTUAL</TableHead>
                  <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">GUIDED</TableHead>
                  <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">VAR</TableHead>
                  <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TooltipProvider delayDuration={300}>
                {records.filter((record, index, arr) => {
                  const key = `${record.metric}__${record.period}`;
                  return arr.findIndex(r => `${r.metric}__${r.period}` === key) === index;
                }).map((record) => {
                  const statusConfig = getStatusConfig(record.status);
                  const isFinancial = record.target_type === "financial";
                  const varianceDisplay = record.variance ?? (
                    record.variance_pct != null
                      ? `${record.variance_pct >= 0 ? "+" : ""}${record.variance_pct}%`
                      : "-"
                  );
                  const hasStatement = !!record.statement;
                  const row = (
                    <TableRow
                      className={`border-zinc-200 dark:border-zinc-800 ${statusConfig.borderColor} ${hasStatement ? "cursor-default" : ""}`}
                    >
                      <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">
                        <div className="break-words whitespace-normal">
                          <DataValue value={record.period} />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">
                        <div className="flex items-center gap-2 break-words whitespace-normal">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
                            {isFinancial ? (
                              <DollarSign className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                            ) : (
                              <Target className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                            )}
                          </span>
                          <DataValue value={record.metric} />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">
                        <div className="break-words whitespace-normal">
                          <DataValue value={record.current_value} />
                          {record.data_source && (
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-1">[{record.data_source}]</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">
                        <div className="break-words whitespace-normal">
                          <DataValue value={record.targeted_value} />
                        </div>
                      </TableCell>
                      <TableCell className={`${getVarianceColor(varianceDisplay)} text-xs`}>
                        <div className="break-words whitespace-normal">
                          <DataValue value={varianceDisplay} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800">
                          <span className="flex-shrink-0">{statusConfig.icon}</span>
                          <span className={`text-[10px] font-medium uppercase tracking-wide whitespace-nowrap ${statusConfig.textColor}`}>
                            <DataValue value={record.status} />
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                  if (!hasStatement) return React.cloneElement(row, { key: record.id });
                  return (
                    <TooltipRoot key={record.id}>
                      <TooltipTrigger asChild>{row}</TooltipTrigger>
                      <TooltipContent side="top" className="max-w-sm leading-relaxed">
                        <p>{record.statement}</p>
                        {record.source_call && (
                          <p className="mt-2 text-[10px] text-zinc-400 border-t border-zinc-700 pt-2">{record.source_call}</p>
                        )}
                      </TooltipContent>
                    </TooltipRoot>
                  );
                })}
                </TooltipProvider>
              </TableBody>
            </Table>
          </div>
        )}
    </div>
  );
}
