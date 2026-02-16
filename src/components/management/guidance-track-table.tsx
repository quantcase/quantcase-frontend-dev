import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
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
        bgColor: "bg-green-50 dark:bg-green-950/30",
        textColor: "text-green-700 dark:text-green-400",
        borderColor: "border-l-4 border-l-green-600 dark:border-l-green-400",
      };
    case "MISSED":
      return {
        icon: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
        bgColor: "bg-red-50 dark:bg-red-950/30",
        textColor: "text-red-700 dark:text-red-400",
        borderColor: "border-l-4 border-l-red-600 dark:border-l-red-400",
      };
    case "PENDING":
      return {
        icon: <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
        bgColor: "bg-blue-50 dark:bg-blue-950/30",
        textColor: "text-blue-700 dark:text-blue-400",
        borderColor: "border-l-4 border-l-blue-600 dark:border-l-blue-400",
      };
  }
}

export function GuidanceTrackTable({ records }: GuidanceTrackTableProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">
          GUIDANCE TRACK RECORD
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-sm text-red-600 dark:text-red-400 py-4">No guidance records available</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[5%]" />
                <col className="w-[15%]" />
              </colgroup>
              <TableHeader>
                <TableRow className="border-zinc-200 dark:border-zinc-800">
                  <TableHead className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase">TARGET DATE</TableHead>
                  <TableHead className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase">METRIC</TableHead>
                  <TableHead className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase">CURRENT</TableHead>
                  <TableHead className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase">TARGET</TableHead>
                  <TableHead className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase">VAR</TableHead>
                  <TableHead className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => {
                  const statusConfig = getStatusConfig(record.status);
                  const isFinancial = record.target_type === "financial";
                  return (
                    <TableRow
                      key={record.id}
                      className={`border-zinc-200 dark:border-zinc-800 ${statusConfig.borderColor}`}
                    >
                      <TableCell className="font-medium text-zinc-900 dark:text-zinc-50 text-sm">
                        <div className="break-words whitespace-normal">
                          <DataValue value={record.period} />
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-900 dark:text-zinc-50 text-sm">
                        <div className="flex items-center gap-2 break-words whitespace-normal">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded flex-shrink-0 ${
                            isFinancial
                              ? "bg-purple-100 dark:bg-purple-900/30"
                              : "bg-sky-100 dark:bg-sky-900/30"
                          }`}>
                            {isFinancial ? (
                              <DollarSign className="h-3 w-3 text-purple-700 dark:text-purple-400" />
                            ) : (
                              <Target className="h-3 w-3 text-sky-700 dark:text-sky-400" />
                            )}
                          </span>
                          <DataValue value={record.metric} />
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-900 dark:text-zinc-50 text-sm">
                        <div className="break-words whitespace-normal">
                          <DataValue value={record.current_value} />
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">
                        <div className="break-words whitespace-normal">
                          <DataValue value={record.targeted_value} />
                        </div>
                      </TableCell>
                      <TableCell className={`${getVarianceColor(record.variance)} text-sm`}>
                        <div className="break-words whitespace-normal">
                          <DataValue value={record.variance} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md ${statusConfig.bgColor}`}>
                          <span className="flex-shrink-0">{statusConfig.icon}</span>
                          <span className={`text-xs font-semibold uppercase whitespace-nowrap ${statusConfig.textColor}`}>
                            <DataValue value={record.status} />
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
