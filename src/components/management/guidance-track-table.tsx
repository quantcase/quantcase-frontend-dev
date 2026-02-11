import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { getStatusVariant, getVarianceColor } from "@/lib/utils";
import type { GuidanceRecord, StatusType } from "@/types/management";

interface GuidanceTrackTableProps {
  records: GuidanceRecord[];
}

function getStatusIcon(status: StatusType) {
  switch (status) {
    case "MET":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "MISS":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "UNDERPERFORM":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  }
}

export function GuidanceTrackTable({ records }: GuidanceTrackTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GUIDANCE TRACK RECORD</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PERIOD</TableHead>
                <TableHead>METRIC</TableHead>
                <TableHead>GUIDED</TableHead>
                <TableHead>ACTUAL</TableHead>
                <TableHead>VAR</TableHead>
                <TableHead>STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.period}</TableCell>
                  <TableCell>{record.metric}</TableCell>
                  <TableCell>{record.guided}</TableCell>
                  <TableCell className="font-semibold">{record.actual}</TableCell>
                  <TableCell className={getVarianceColor(record.variance)}>
                    {record.variance}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <span className="text-sm font-medium">{record.status}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
