import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DataValue } from "@/components/molecules/data-value";
import { CheckCircle2, XCircle, Clock, Target } from "lucide-react";
import type { GuidanceRow, GuidanceSeverity } from "@/types/management";

interface GuidanceTrackTableProps {
  rows: GuidanceRow[];
}

function getStatusConfig(severity: GuidanceSeverity) {
  switch (severity) {
    case "beat":
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        textColor: "text-emerald-700",
        borderColor: "border-l-4 border-l-emerald-600",
        label: "Beat",
      };
    case "major":
      return {
        icon: <XCircle className="h-4 w-4 text-red-600" />,
        textColor: "text-red-700",
        borderColor: "border-l-4 border-l-red-600",
        label: "Major Miss",
      };
    case "mediocre":
      return {
        icon: <XCircle className="h-4 w-4 text-red-600" />,
        textColor: "text-red-700",
        borderColor: "border-l-4 border-l-red-600",
        label: "Miss",
      };
    case "minor":
      return {
        icon: <XCircle className="h-4 w-4 text-amber-600" />,
        textColor: "text-amber-700",
        borderColor: "border-l-4 border-l-amber-600",
        label: "Minor Miss",
      };
    case "rolled_forward":
      return {
        icon: <Clock className="h-4 w-4 text-blue-600" />,
        textColor: "text-blue-700",
        borderColor: "border-l-4 border-l-blue-600",
        label: "Rolled Fwd",
      };
    case "ongoing":
      return {
        icon: <Clock className="h-4 w-4 text-blue-600" />,
        textColor: "text-blue-700",
        borderColor: "border-l-4 border-l-blue-600",
        label: "Ongoing",
      };
    case "not_trackable":
      return {
        icon: null,
        textColor: "text-zinc-500",
        borderColor: "",
        label: "N/A",
      };
    default:
      return {
        icon: null,
        textColor: "text-zinc-500",
        borderColor: "",
        label: String(severity),
      };
  }
}

export function GuidanceTrackTable({ rows }: GuidanceTrackTableProps) {
  return (
    <div>
      {rows.length === 0 ? (
        <p className="text-xs text-zinc-500 py-4">No guidance records available</p>
      ) : (
        <div className="overflow-x-auto">
          <Table className="table-fixed w-full">
            <colgroup>
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[22%]" />
              <col className="w-[14%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="border-zinc-200">
                <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Period</TableHead>
                <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Tag</TableHead>
                <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Metric</TableHead>
                <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Guidance</TableHead>
                <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Actual / Delta</TableHead>
                <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TooltipProvider delayDuration={300}>
                {rows.map((row, index) => {
                  const statusConfig = getStatusConfig(row.severity);
                  const hasExplanation = !!row.management_explanation;

                  const tableRow = (
                    <TableRow
                      className={`border-zinc-200 ${statusConfig.borderColor} ${hasExplanation ? "cursor-default" : ""}`}
                    >
                      <TableCell className="text-xs text-zinc-700">
                        <div className="break-words whitespace-normal">
                          <DataValue value={row.period} />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-700">
                        <div className="flex items-center gap-2 break-words whitespace-normal">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded flex-shrink-0 bg-zinc-100">
                            <Target className="h-3 w-3 text-zinc-500" />
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                            {row.tag.replace(/_/g, " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-700">
                        <div className="break-words whitespace-normal">
                          <DataValue value={row.metric} />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-700">
                        <div className="break-words whitespace-normal">
                          <DataValue value={row.guidance} />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-700">
                        <div className="break-words whitespace-normal space-y-0.5">
                          <DataValue value={row.actual} />
                          {row.delta && (
                            <p className="text-[10px] text-zinc-400">{row.delta}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-50">
                          <span className="flex-shrink-0">{statusConfig.icon}</span>
                          <span className={`text-[10px] font-medium uppercase tracking-wide whitespace-nowrap ${statusConfig.textColor}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );

                  if (!hasExplanation) return React.cloneElement(tableRow, { key: index });
                  return (
                    <TooltipRoot key={index}>
                      <TooltipTrigger asChild>{tableRow}</TooltipTrigger>
                      <TooltipContent side="top" className="max-w-sm leading-relaxed">
                        <p>{row.management_explanation}</p>
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
